import os
import json
import numpy as np
from PIL import Image
import onnxruntime as ort
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

from .config import settings

class MLService:
    def __init__(self):
        self.session = None
        self.labels = []
        self.kb_map = {}
        self.load_resources()

    def load_resources(self):
        # 1. Load labels
        if settings.LABELS_PATH.exists():
            with open(settings.LABELS_PATH, "r", encoding="utf-8") as f:
                self.labels = json.load(f)
        else:
            print(f"Warning: labels file not found at {settings.LABELS_PATH}")

        # 2. Load Knowledge Base
        kb_path = Path(__file__).resolve().parent / "data" / "disease_kb.json"
        if kb_path.exists():
            with open(kb_path, "r", encoding="utf-8") as f:
                kb_list = json.load(f)
                # Map by (crop.lower(), disease.lower())
                for item in kb_list:
                    key = f"{item['crop'].lower()}_{item['disease'].lower()}"
                    self.kb_map[key] = item
                    # Also map healthy
                    if item.get("is_healthy"):
                        self.kb_map[f"{item['crop'].lower()}_healthy"] = item

        # 3. Load ONNX model
        if settings.MODEL_PATH.exists():
            try:
                self.session = ort.InferenceSession(
                    str(settings.MODEL_PATH),
                    providers=["CPUExecutionProvider"]
                )
                self.input_name = self.session.get_inputs()[0].name
                print(f"ML Service: ONNX model loaded successfully from {settings.MODEL_PATH}")
            except Exception as e:
                print(f"Error loading ONNX model: {e}")
                self.session = None
        else:
            print(f"Warning: ONNX model not found at {settings.MODEL_PATH}")

    def is_plant_leaf(self, image: Image.Image) -> Tuple[bool, str]:
        """
        Heuristic to verify that the uploaded image contains plant foliage/vegetation
        and is not a completely unrelated photo (e.g. text document, face, blank screen).
        """
        img_rgb = image.convert("RGB").resize((100, 100))
        arr = np.array(img_rgb, dtype=np.float32)
        r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
        
        # Plant leaves typically exhibit substantial green channel presence or yellow/brown hues with leaf texture
        # Check standard deviation (texture)
        std_dev = np.std(arr)
        if std_dev < 15.0:
            return False, "Image appears uniform or blank without sufficient visual detail."
        
        # Foliage green / chlorophyll test or brown/yellow necrosis
        green_excess = (g - 0.5 * r - 0.5 * b)
        green_ratio = np.mean(green_excess > 5)
        
        # Also check for brownish necrotic leaf tissue (r > b, g > b)
        brown_ratio = np.mean((r > b + 15) & (g > b + 5) & (r < 220))
        
        if green_ratio < 0.08 and brown_ratio < 0.12:
            return False, "The uploaded image does not appear to be a crop leaf. Please upload a clear photo of an agricultural plant leaf."
        
        return True, "Valid plant photo"

    def predict(self, image_path: str) -> Dict[str, Any]:
        """
        Performs genuine inference on an uploaded image using the trained ONNX model.
        Returns predicted disease, confidence, alternatives, and knowledge base guidance.
        """
        if self.session is None or not self.labels:
            return {
                "success": False,
                "is_reliable": False,
                "message": "AI model inference engine is currently unavailable. Please check backend setup.",
                "crop_name": "Unknown",
                "predicted_disease": "Unknown",
                "confidence_score": 0.0,
                "confidence_percentage": 0.0,
                "is_healthy": False,
                "status_label": "Unknown",
                "top_alternatives": [],
                "disease_info": None
            }

        try:
            image = Image.open(image_path).convert("RGB")
        except Exception as e:
            return {
                "success": False,
                "is_reliable": False,
                "message": f"Unable to read or decode image file: {str(e)}",
                "crop_name": "Unknown",
                "predicted_disease": "Unknown",
                "confidence_score": 0.0,
                "confidence_percentage": 0.0,
                "is_healthy": False,
                "status_label": "Unknown",
                "top_alternatives": [],
                "disease_info": None
            }

        # Validate plant characteristics
        is_plant, reason = self.is_plant_leaf(image)
        if not is_plant:
            return {
                "success": True,
                "is_reliable": False,
                "message": f"Unable to identify reliably: {reason}",
                "crop_name": "Unrecognized",
                "predicted_disease": "Unable to identify reliably. Please upload a clearer image.",
                "confidence_score": 0.0,
                "confidence_percentage": 0.0,
                "is_healthy": False,
                "status_label": "Uncertain",
                "top_alternatives": [],
                "disease_info": None
            }

        # Preprocess for MobileNetV2: 224x224, normalized
        resized = image.resize((224, 224))
        img_data = np.array(resized, dtype=np.float32) / 255.0
        mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
        std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
        img_data = (img_data - mean) / std
        img_data = np.transpose(img_data, (2, 0, 1))
        input_tensor = np.expand_dims(img_data, axis=0)

        # Run ONNX inference
        raw_output = self.session.run(None, {self.input_name: input_tensor})[0]
        
        # Compute numerically stable Softmax
        exp_preds = np.exp(raw_output - np.max(raw_output))
        probabilities = (exp_preds / np.sum(exp_preds))[0]

        # Top prediction
        top_idx = int(np.argmax(probabilities))
        confidence = float(probabilities[top_idx])
        top_label = self.labels[top_idx]

        # Sorted alternatives
        sorted_indices = np.argsort(probabilities)[::-1]
        alternatives = []
        for idx in sorted_indices[1:4]:
            alt_label = self.labels[int(idx)]
            alternatives.append({
                "crop": alt_label["crop"],
                "disease": alt_label["disease"],
                "confidence": round(float(probabilities[idx]) * 100, 2),
                "is_healthy": alt_label["is_healthy"]
            })

        is_reliable = confidence >= settings.CONFIDENCE_THRESHOLD
        
        crop_name = top_label["crop"]
        predicted_disease = top_label["disease"]
        is_healthy = top_label["is_healthy"]
        scientific_name = top_label.get("scientific_name", "")

        # Look up disease knowledge base entry
        kb_key = f"{crop_name.lower()}_{predicted_disease.lower()}"
        disease_info = self.kb_map.get(kb_key)
        if not disease_info and is_healthy:
            disease_info = self.kb_map.get(f"{crop_name.lower()}_healthy")

        if not is_reliable:
            message = "Unable to identify reliably. Please upload a clearer image taken in natural light."
            status_label = "Uncertain"
        elif is_healthy:
            message = f"Crop appears Healthy with {confidence*100:.1f}% confidence."
            status_label = "Healthy"
        else:
            message = f"Detected {predicted_disease} on {crop_name} with {confidence*100:.1f}% confidence."
            status_label = "Potentially Diseased"

        return {
            "success": True,
            "is_reliable": is_reliable,
            "crop_name": crop_name if is_reliable else "Uncertain",
            "predicted_disease": predicted_disease if is_reliable else "Unable to identify reliably. Please upload a clearer image.",
            "scientific_name": scientific_name if is_reliable else None,
            "confidence_score": round(confidence, 4),
            "confidence_percentage": round(confidence * 100, 2),
            "is_healthy": is_healthy if is_reliable else False,
            "status_label": status_label,
            "message": message,
            "top_alternatives": alternatives if is_reliable else [],
            "disease_info": disease_info if is_reliable else None
        }

ml_service = MLService()
