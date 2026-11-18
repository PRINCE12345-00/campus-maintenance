import os
import json
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score, mean_absolute_error, r2_score
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.ensemble import RandomForestRegressor

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, "dataset", "campus_maintenance_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

def train_category_model(df):
    print("\n--- Training Model 1: Category Classifier ---")
    # Features & Target
    X = (df['title'].fillna('') + ' ' + df['description'].fillna('')).values
    y = df['category'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=6000, stop_words='english')),
        ('clf', LogisticRegression(max_iter=1000, C=1.5, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Category Classifier Accuracy: {acc * 100:.2f}%")
    report = classification_report(y_test, y_pred, output_dict=True)

    joblib.dump(pipeline, os.path.join(MODELS_DIR, "category_model.joblib"))
    return acc, report

def train_priority_model(df):
    print("\n--- Training Model 2: Priority Classifier ---")
    # Features & Target
    X = (df['title'].fillna('') + ' ' + df['description'].fillna('') + ' ' + df['location'].fillna('')).values
    y = df['priority'].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(ngram_range=(1, 2), max_features=4000, stop_words='english')),
        ('clf', LogisticRegression(class_weight='balanced', max_iter=1000, C=1.0, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Priority Classifier Accuracy: {acc * 100:.2f}%")
    report = classification_report(y_test, y_pred, output_dict=True)

    joblib.dump(pipeline, os.path.join(MODELS_DIR, "priority_model.joblib"))
    return acc, report

def train_resolution_time_model(df):
    print("\n--- Training Model 3: Resolution Days Regressor ---")
    # Filter rows with non-null resolution_days
    resolved_df = df[df['resolution_days'].notnull()].copy()

    features = ['category', 'priority', 'location', 'submitted_hour', 'has_media']
    target = 'resolution_days'

    X = resolved_df[features]
    y = resolved_df[target].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    categorical_features = ['category', 'priority', 'location']
    numerical_features = ['submitted_hour', 'has_media']

    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features),
            ('num', StandardScaler(), numerical_features)
        ]
    )

    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42))
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"Resolution Time Regressor - MAE: {mae:.2f} days, R2: {r2:.3f}")

    joblib.dump(pipeline, os.path.join(MODELS_DIR, "resolution_time_model.joblib"))
    return mae, r2

def main():
    print(f"Loading dataset from: {DATASET_PATH}")
    df = pd.read_csv(DATASET_PATH)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    cat_acc, cat_report = train_category_model(df)
    prio_acc, prio_report = train_priority_model(df)
    res_mae, res_r2 = train_resolution_time_model(df)

    metrics = {
        "category_accuracy": round(cat_acc * 100, 2),
        "priority_accuracy": round(prio_acc * 100, 2),
        "resolution_mae_days": round(res_mae, 2),
        "resolution_r2": round(res_r2, 3),
        "total_training_records": len(df),
        "categories": list(df['category'].dropna().unique()),
        "locations": list(df['location'].dropna().unique()),
        "priorities": list(df['priority'].dropna().unique())
    }

    metrics_path = os.path.join(MODELS_DIR, "metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nAll models and metrics successfully saved to: {MODELS_DIR}")
    print(f"Metrics: {json.dumps(metrics, indent=2)}")

if __name__ == "__main__":
    main()
