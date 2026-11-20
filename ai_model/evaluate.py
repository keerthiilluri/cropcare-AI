"""
CropCare AI - Real Model Evaluation Script
Evaluates the ONNX Crop Disease Classification Model on test images and computes
real, genuine metrics: Accuracy, Precision, Recall, F1-Score, and Confusion Matrix.
NEVER fabricates or invents metrics.
"""

import os
import json
import argparse
from pathlib import Path
import numpy as np
from PIL import Image
import onnxruntime as ort
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, classification_report

BASE_DIR = Path(__file__).resolve().parent
LABELS_PATH = BASE_DIR / "labels.json"
MODEL_PATH = BASE_DIR / "crop_disease_model.onnx"
OUTPUT_REPORT_PATH = BASE_DIR / "evaluation_report.json"

def preprocess_image(image_path: str):
    image = Image.open(image_path).convert("RGB")
    image = image.resize((224, 224))
    img_data = np.array(image, dtype=np.float32) / 255.0
    
    # Standard ImageNet normalization
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    img_data = (img_data - mean) / std
    
    # Transpose to NCHW: (1, 3, 224, 224)
    img_data = np.transpose(img_data, (2, 0, 1))
    img_data = np.expand_dims(img_data, axis=0)
    return img_data

def evaluate(test_dir: str = None):
    print("=" * 65)
    print("CropCare AI - Model Evaluation & Performance Verification")
    print("=" * 65)

    if not MODEL_PATH.exists():
        print(f"Error: Model not found at {MODEL_PATH}")
        return

    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        labels = json.load(f)
    
    id_to_name = {item["id"]: f"{item['crop']} - {item['disease']}" for item in labels}
    name_to_id = {item["class_name"]: item["id"] for item in labels}

    # Prepare test set
    test_samples = []
    
    # 1. Check if external test directory with class folders exists
    if test_dir and os.path.isdir(test_dir):
        for folder_name in os.listdir(test_dir):
            if folder_name in name_to_id:
                folder_path = os.path.join(test_dir, folder_name)
                if os.path.isdir(folder_path):
                    for img_name in os.listdir(folder_path):
                        if img_name.lower().endswith((".jpg", ".jpeg", ".png")):
                            test_samples.append((os.path.join(folder_path, img_name), name_to_id[folder_name]))
    
    # 2. Check sample_images directory with known ground truth mapping
    if len(test_samples) == 0:
        sample_dir = BASE_DIR / "sample_images"
        sample_mapping = {
            "tomato_early_blight_sample.jpg": 0,
            "tomato_healthy_sample.jpg": 4,
            "potato_early_blight_sample.jpg": 5,
            "potato_late_blight_sample.jpg": 6,
            "corn_common_rust_sample.jpg": 8,
            "rice_brown_spot_sample.jpg": 12,
        }
        for filename, true_id in sample_mapping.items():
            filepath = sample_dir / filename
            if filepath.exists():
                test_samples.append((str(filepath), true_id))

    if len(test_samples) == 0:
        print("No test samples available to evaluate.")
        print("Place test images in a structured directory and run:")
        print("  python evaluate.py --test_dir /path/to/test_dataset")
        return

    print(f"Loaded {len(test_samples)} verified test samples for quantitative evaluation.")
    print("Starting ONNX inference session...")
    
    session = ort.InferenceSession(str(MODEL_PATH))
    input_name = session.get_inputs()[0].name

    y_true = []
    y_pred = []
    predictions_log = []

    for img_path, true_label in test_samples:
        img_tensor = preprocess_image(img_path)
        raw_output = session.run(None, {input_name: img_tensor})[0]
        pred_label = int(np.argmax(raw_output, axis=1)[0])
        
        # Softmax probabilities
        exp_preds = np.exp(raw_output - np.max(raw_output))
        probs = exp_preds / np.sum(exp_preds)
        confidence = float(np.max(probs))

        y_true.append(true_label)
        y_pred.append(pred_label)

        predictions_log.append({
            "image": os.path.basename(img_path),
            "true_label": id_to_name.get(true_label, str(true_label)),
            "predicted_label": id_to_name.get(pred_label, str(pred_label)),
            "confidence": round(confidence * 100, 2),
            "correct": bool(true_label == pred_label)
        })

    # Compute genuine scikit-learn metrics
    accuracy = accuracy_score(y_true, y_pred)
    precision = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    recall = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_true, y_pred, average="weighted", zero_division=0)
    cm = confusion_matrix(y_true, y_pred).tolist()

    report = {
        "model_file": os.path.basename(MODEL_PATH),
        "total_test_samples": len(test_samples),
        "accuracy": round(float(accuracy), 4),
        "precision_weighted": round(float(precision), 4),
        "recall_weighted": round(float(recall), 4),
        "f1_score_weighted": round(float(f1), 4),
        "confusion_matrix": cm,
        "sample_evaluations": predictions_log
    }

    with open(OUTPUT_REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n" + "-" * 40)
    print("GENUINE EVALUATION METRICS REPORT")
    print("-" * 40)
    print(f"Total Test Samples Evaluated : {len(test_samples)}")
    print(f"Accuracy                     : {accuracy * 100:.2f}%")
    print(f"Precision (Weighted)         : {precision * 100:.2f}%")
    print(f"Recall (Weighted)            : {recall * 100:.2f}%")
    print(f"F1-Score (Weighted)          : {f1 * 100:.2f}%")
    print("-" * 40)
    print(f"Evaluation report saved to: {OUTPUT_REPORT_PATH}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="CropCare AI - Model Evaluation")
    parser.add_argument("--test_dir", type=str, default="", help="Path to test images directory")
    args = parser.parse_args()
    evaluate(test_dir=args.test_dir)
