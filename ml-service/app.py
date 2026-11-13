
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from pathlib import Path
from typing import Optional
import joblib
import pandas as pd
import re

app = FastAPI(
    title="Campus Maintenance ML API",
    description="V4 Hybrid Complaint Category and Priority Prediction",
    version="4.0"
)

# Load V4 models
MODEL_PATH = (
    Path(__file__).parent
    / "models"
    / "campus_maintenance_models_v4.joblib"
)

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model_bundle = joblib.load(MODEL_PATH)

category_model = model_bundle["category_model"]
priority_model = model_bundle["priority_model"]

CONFIDENCE_THRESHOLD = model_bundle.get(
    "review_confidence_threshold", 0.60
)

MARGIN_THRESHOLD = model_bundle.get(
    "review_margin_threshold", 0.15
)


class ComplaintRequest(BaseModel):
    title: Optional[str] = ""
    description: str = Field(min_length=3, max_length=2000)
    location: str = Field(min_length=2, max_length=100)


def predict_with_confidence(model, features):
    probabilities = model.predict_proba(features)[0]

    best_index = probabilities.argmax()
    sorted_probabilities = sorted(probabilities, reverse=True)

    confidence = float(probabilities[best_index])

    margin = (
        sorted_probabilities[0] - sorted_probabilities[1]
        if len(sorted_probabilities) > 1
        else confidence
    )

    return {
        "prediction": str(model.classes_[best_index]),
        "confidence": round(confidence, 4),
        "margin": round(float(margin), 4)
    }


def safety_priority_check(text):
    text = text.lower()

    high_risk_keywords = [
        "burning smell",
        "exposed wire",
        "electric shock",
        "sparking",
        "burst pipe",
        "slippery floor",
        "water leakage",
        "water leaking",
        "water is leaking",
        "floor has become slippery",
        "broken glass",
        "sharp edge",
        "loose railing",
        "trip hazard",
        "fire",
        "smoke",
        "ceiling collapse"
    ]

    if any(keyword in text for keyword in high_risk_keywords):
        return "High"

    return None


@app.get("/")
def home():
    return {
        "message": "Campus Maintenance V4 ML API is running",
        "version": "4.0"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "version": "4.0",
        "category_model": "loaded",
        "priority_model": "loaded"
    }


@app.post("/predict")
def predict_complaint(request: ComplaintRequest):

    try:
        # Combine title and description as used during training
        combined_text = (
            f"{request.title or ''} {request.description}"
        ).strip()

        features = pd.DataFrame([{
            "text": combined_text,
            "location": request.location.strip()
        }])

        # Category prediction
        category_result = predict_with_confidence(
            category_model, features
        )

        # Priority prediction
        priority_result = predict_with_confidence(
            priority_model, features
        )

        # Safety rule
        safety_priority = safety_priority_check(combined_text)

        predicted_priority = priority_result["prediction"]
        final_priority = predicted_priority

        category_review = (
            category_result["confidence"] < CONFIDENCE_THRESHOLD
        )

        priority_review = (
            priority_result["confidence"] < CONFIDENCE_THRESHOLD
            or priority_result["margin"] < MARGIN_THRESHOLD
        )

        if safety_priority == "High":
            final_priority = "High"
            decision_status = "Safety Rule Override"

        elif category_review or priority_review:
            decision_status = "Manual Review Required"

        else:
            decision_status = "ML Prediction"

        manual_review_required = (
            safety_priority == "High"
            or category_review
            or priority_review
        )

        return {
            "success": True,
            "model_version": "v4",

            "category": category_result["prediction"],
            "category_confidence": category_result["confidence"],

            "predicted_priority": predicted_priority,
            "priority_confidence": priority_result["confidence"],
            "priority_margin": priority_result["margin"],

            "safety_priority": safety_priority,
            "priority": final_priority,

            "manual_review_required": manual_review_required,
            "decision_status": decision_status
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )
