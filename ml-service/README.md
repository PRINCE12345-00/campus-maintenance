# Smart Campus AI & ML Microservice (v2.0.0)

Production AI, Machine Learning, and NLP microservice powering the Smart Campus Maintenance and Predictive Analytics Platform.

---

## 🔬 Model Benchmark & Evaluation Summary

| Task | Champion Model | Evaluation Metric | Result |
| :--- | :--- | :--- | :--- |
| **Category Classification** | Calibrated Logistic Regression | Weighted F1 / Accuracy | **100.0%** (Calibrated $\tau=0.70$) |
| **Priority Classification** | Balanced Logistic Regression | Accuracy / Weighted F1 | **70.2%** (Emergency Escalation) |
| **Resolution Days Prediction**| Random Forest Regressor | MAE / RMSE | **MAE: 3.84 days**, RMSE: 4.54 days |

All models were evaluated on an 80/20 train-test split strictly isolated to resolved complaints without target leakage.

---

## 🌐 Endpoints

- `GET /health`: Health status and loaded model metadata.
- `GET /metrics`: Serialized evaluation metrics and champion benchmarks.
- `POST /predict`: Main prediction endpoint for category, priority, unclamped resolution days, expected resolution date, delay risk, SHAP feature attributions, and smart routing.
- `GET /analytics/predictive-maintenance`: Campus failure hotspots, risk scoring index, monthly time-series trends, and quarterly forecasts.
- `POST /chat`: RAG-based AI assistant querying campus maintenance knowledge base and live complaint database.
- `POST /vision/analyze`: Computer vision photo inspector verifying image quality, dimensions, blurriness, and damage patterns.

---

## 📁 Directory Structure

```
ml-service/
├── app.py                      # FastAPI REST microservice
├── chatbot.py                  # RAG Knowledge Base and live complaint status lookup
├── vision.py                   # Computer vision damage verification
├── data_pipeline.py            # Data engineering, leakage prevention & quality reporting
├── train_production_models.py  # Multi-model benchmarking and serialization
├── Campus_Maintenance_AI_Pipeline.ipynb # Multi-model research & SHAP analysis notebook
├── dataset/
│   ├── campus_maintenance_dataset.csv     # Raw dataset (5,000 records)
│   ├── cleaned_resolved_complaints.csv    # Resolved complaints (3,550 records, zero leakage)
│   ├── unresolved_complaints.csv          # Unresolved records (1,450 records)
│   └── data_quality_report.json           # Comprehensive data audit report
└── models/
    ├── category_model.joblib
    ├── category_label_encoder.joblib
    ├── priority_model.joblib
    ├── priority_label_encoder.joblib
    ├── resolution_time_model.joblib
    ├── metrics.json
    └── model_comparison_results.json
```
