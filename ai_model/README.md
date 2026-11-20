# CropCare AI - Machine Learning Pipeline & Dataset Documentation

## 1. Overview
The CropCare AI computer vision engine uses **MobileNetV2** (a deep Convolutional Neural Network optimized for high-efficiency mobile and edge inference) with a custom multi-class classifier trained on the **PlantVillage Crop Disease Benchmark Dataset**.

The model is exported to **ONNX (Open Neural Network Exchange)** format for high-speed, CPU-efficient, deterministic inference via **ONNX Runtime**, with zero GPU overhead and sub-50ms inference times.

---

## 2. Supported Target Classes & Crops
The model architecture supports 24 agricultural classes spanning vital staple and commercial crops:
- **Tomato**: Early Blight, Late Blight, Bacterial Spot, Yellow Leaf Curl Virus, Healthy
- **Potato**: Early Blight, Late Blight, Healthy
- **Corn (Maize)**: Common Rust, Northern Leaf Blight, Healthy
- **Rice (Paddy)**: Bacterial Leaf Blight, Brown Spot, Healthy
- **Pepper Bell (Chilli)**: Bacterial Spot, Healthy
- **Apple**: Apple Scab, Black Rot, Cedar Apple Rust, Healthy
- **Grape**: Black Rot, Esca (Black Measles), Leaf Blight, Healthy

Detailed metadata for each class is indexed in `labels.json`.

---

## 3. Dataset Download & Structure
### Source: PlantVillage Dataset
The standard PlantVillage dataset contains over 54,000 curated leaf images across 38 crop disease categories, licensed under Creative Commons.

### Download Instructions:
1. Download from Kaggle:
   ```bash
   kaggle datasets download -d emmarex/plantdisease
   # Or download the Color version of PlantVillage:
   kaggle datasets download -d abdallahalidev/plantvillage-dataset
   ```
2. Extract the archive into a local folder:
   ```
   datasets/
   └── plantvillage/
       ├── Tomato___Early_blight/
       ├── Tomato___Late_blight/
       ├── Tomato___healthy/
       ├── Potato___Early_blight/
       ├── Corn_(maize)___Common_rust_/
       └── ...
   ```

---

## 4. Reproducible Model Training
To train or fine-tune MobileNetV2 on the extracted dataset:
```bash
python train.py --data_dir /path/to/plantvillage --epochs 10 --batch_size 32 --lr 0.0005
```
Key features of `train.py`:
- Freezes initial feature extractor layers of MobileNetV2.
- Employs data augmentation: random horizontal flips, 15° rotation, and color jitter.
- Uses Adam optimizer with CrossEntropyLoss.
- Performs validation tracking at each epoch.
- Automatically exports the fine-tuned model to `crop_disease_model.onnx`.

---

## 5. Model Evaluation & Verification
To evaluate the model against test data and compute genuine scikit-learn metrics:
```bash
python evaluate.py --test_dir /path/to/test_dataset
```
Or run against the included test suite in `sample_images/`:
```bash
python evaluate.py
```
This produces:
- Overall Accuracy
- Weighted Precision
- Weighted Recall
- Weighted F1-Score
- Multiclass Confusion Matrix
- Detailed per-sample JSON report stored in `evaluation_report.json`.

---

## 6. Critical Accuracy & Reliability Constraints
1. **Confidence Thresholding**: Predictions with maximum softmax probability below **55%** are classified as unreliable. The system outputs:
   > *"Unable to identify reliably. Please upload a clearer image."*
2. **Out-of-Distribution & Non-Plant Detection**: The inference engine scans for green/foliar color variance and edge density. Non-plant or irrelevant photos (e.g. documents, faces, furniture) are rejected.
3. **No 100% Accuracy Claims**: Real-world agricultural factors (lighting variations, camera lens blur, harsh direct sunlight, heavy shadows, moisture on leaves) naturally affect classification accuracy. The system transparently details these factors for farmer education.
