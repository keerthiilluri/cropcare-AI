"""
CropCare AI - Model Architecture and ONNX Export Script
Constructs MobileNetV2 with custom 24-class classifier for PlantVillage crop diseases
and exports to high-performance ONNX format for production inference.
"""

import os
import json
import torch
import torch.nn as nn
import torchvision.models as models
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
LABELS_PATH = BASE_DIR / "labels.json"
ONNX_OUTPUT_PATH = BASE_DIR / "crop_disease_model.onnx"

def build_model(num_classes: int = 24):
    print("Constructing MobileNetV2 architecture...")
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    
    # Replace the final linear classification layer with custom head for crop disease classes
    in_features = model.classifier[1].in_features
    model.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=False),
        nn.Linear(in_features, 512),
        nn.ReLU(inplace=True),
        nn.Dropout(p=0.2, inplace=False),
        nn.Linear(512, num_classes)
    )
    return model

def export_to_onnx():
    with open(LABELS_PATH, "r", encoding="utf-8") as f:
        labels = json.load(f)
    num_classes = len(labels)
    print(f"Loaded {num_classes} crop disease target classes.")

    model = build_model(num_classes)
    model.eval()

    # Create dummy input tensor: batch_size=1, channels=3, height=224, width=224
    dummy_input = torch.randn(1, 3, 224, 224, dtype=torch.float32)

    print(f"Exporting model to ONNX format at {ONNX_OUTPUT_PATH}...")
    torch.onnx.export(
        model,
        dummy_input,
        str(ONNX_OUTPUT_PATH),
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={
            "input": {0: "batch_size"},
            "output": {0: "batch_size"}
        }
    )
    print(f"Successfully generated {ONNX_OUTPUT_PATH} ({os.path.getsize(ONNX_OUTPUT_PATH) / (1024*1024):.2f} MB)")

if __name__ == "__main__":
    export_to_onnx()
