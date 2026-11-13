"""Train complaint category and priority models from labelled real complaint data.

CSV columns: title, description, category, priority.
Do not use synthetic rows as evidence of real-world model performance.
"""
from pathlib import Path
import json
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

BASE = Path(__file__).resolve().parent
DATA = BASE / "dataset" / "complaints.csv"
MODELS = BASE / "models"
REQUIRED = {"title", "description", "category", "priority"}

def main():
    if not DATA.exists():
        raise SystemExit(f"Dataset not found: {DATA}. Copy complaints_template.csv to complaints.csv and add labelled records.")
    df = pd.read_csv(DATA)
    missing = REQUIRED - set(df.columns)
    if missing:
        raise SystemExit(f"Missing CSV columns: {sorted(missing)}")
    df = df.dropna(subset=list(REQUIRED))
    if len(df) < 30:
        raise SystemExit(f"Need at least 30 labelled rows to run a basic training experiment; found {len(df)}. More diverse real records are strongly recommended.")
    text = (df["title"].astype(str) + " " + df["description"].astype(str)).str.strip()
    MODELS.mkdir(exist_ok=True)
    metrics = {}
    for target in ("category", "priority"):
        if df[target].nunique() < 2:
            raise SystemExit(f"Column '{target}' must contain at least two distinct labels.")
        if df[target].value_counts().min() < 2:
            raise SystemExit(f"Each label in '{target}' needs at least two rows for a stratified train/test split.")
        X_train, X_test, y_train, y_test = train_test_split(text, df[target].astype(str), test_size=0.2, random_state=42, stratify=df[target].astype(str))
        model = Pipeline([("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=12000, stop_words="english")), ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced"))])
        model.fit(X_train, y_train)
        pred = model.predict(X_test)
        joblib.dump(model, MODELS / f"{target}_model.joblib")
        metrics[target] = {"accuracy": round(float(accuracy_score(y_test, pred)), 4), "report": classification_report(y_test, pred, output_dict=True, zero_division=0), "train_rows": len(X_train), "test_rows": len(X_test)}
    (MODELS / "training_metrics.json").write_text(json.dumps(metrics, indent=2))
    print(json.dumps({k: {"accuracy": v["accuracy"], "train_rows": v["train_rows"], "test_rows": v["test_rows"]} for k, v in metrics.items()}, indent=2))

if __name__ == "__main__":
    main()
