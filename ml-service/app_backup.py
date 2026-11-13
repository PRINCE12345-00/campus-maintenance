
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path
import joblib
import re
import pandas as pd

app = FastAPI(
    title="Campus Maintenance ML API",
    description="Complaint Category and Priority Prediction",
    version="1.0"
)

# Load trained models
MODEL_PATH = Path(__file__).parent / "models" / "campus_maintenance_models.joblib"

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model_bundle = joblib.load(MODEL_PATH)

category_model = model_bundle["category_model"]
priority_model = model_bundle["priority_model"]


class ComplaintRequest(BaseModel):
    description: str = Field(min_length=3, max_length=2000)
    location: str = Field(min_length=2, max_length=100)


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def predict_with_confidence(model, features):
    probabilities = model.predict_proba(features)[0]
    best_index = probabilities.argmax()

    return {
        "prediction": str(model.classes_[best_index]),
        "confidence": round(float(probabilities[best_index]), 4)
    }


@app.get("/")
def home():
    return {
        "message": "Campus Maintenance ML API is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "category_model": "loaded",
        "priority_model": "loaded"
    }


@app.post("/predict")
def predict_complaint(request: ComplaintRequest):

    try:
        cleaned_description = clean_text(request.description)

        features = pd.DataFrame([{
            "description_clean": cleaned_description,
            "location": request.location.strip()
        }])

        category_result = predict_with_confidence(
            category_model, features
        )

        priority_result = predict_with_confidence(
            priority_model, features
        )

        review_required = (
            category_result["confidence"] < 0.60
            or priority_result["confidence"] < 0.60
        )

        return {
            "success": True,
            "category": category_result["prediction"],
            "category_confidence": category_result["confidence"],
            "priority": priority_result["prediction"],
            "priority_confidence": priority_result["confidence"],
            "manual_review_required": review_required
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
