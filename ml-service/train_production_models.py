import os
import json
import time
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingRegressor, HistGradientBoostingRegressor
from sklearn.calibration import CalibratedClassifierCV
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report,
    mean_absolute_error, mean_squared_error, r2_score
)
from xgboost import XGBClassifier, XGBRegressor

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

RESOLVED_DATA_PATH = os.path.join(DATASET_DIR, "cleaned_resolved_complaints.csv")
RAW_DATA_PATH = os.path.join(DATASET_DIR, "campus_maintenance_dataset.csv")

def run_model_training_and_comparison():
    print("=" * 70)
    print("  Smart Campus AI: Production ML Pipeline & Multi-Model Benchmark")
    print("=" * 70)

    # 1. Load data
    df_raw = pd.read_csv(RAW_DATA_PATH)
    df_resolved = pd.read_csv(RESOLVED_DATA_PATH)
    print(f"Loaded raw complaints: {len(df_raw)} records.")
    print(f"Loaded resolved complaints: {len(df_resolved)} records (used for resolution regression).")

    comparison_results = {
        "evaluation_timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "dataset_records": len(df_raw),
        "resolved_records": len(df_resolved),
        "category_classification": {},
        "priority_classification": {},
        "resolution_regression": {}
    }

    # =========================================================================
    # TASK 1: COMPLAINT CATEGORY CLASSIFICATION
    # =========================================================================
    print("\n" + "-" * 50)
    print("TASK 1: COMPLAINT CATEGORY CLASSIFICATION BENCHMARK")
    print("-" * 50)

    X_text = (df_raw['title'].fillna('') + ' ' + df_raw['description'].fillna('')).values
    le_category = LabelEncoder()
    y_cat = le_category.fit_transform(df_raw['category'])
    category_names = list(le_category.classes_)

    X_train_cat, X_test_cat, y_train_cat, y_test_cat = train_test_split(
        X_text, y_cat, test_size=0.2, random_state=42, stratify=y_cat
    )

    vectorizer_cat = TfidfVectorizer(ngram_range=(1, 2), max_features=5000, stop_words='english')
    X_train_vec = vectorizer_cat.fit_transform(X_train_cat)
    X_test_vec = vectorizer_cat.transform(X_test_cat)

    cat_candidates = {
        "Calibrated Logistic Regression": CalibratedClassifierCV(
            estimator=LogisticRegression(max_iter=1000, C=1.5, random_state=42),
            method='sigmoid', cv=3
        ),
        "Calibrated Linear SVM": CalibratedClassifierCV(
            estimator=SGDClassifier(loss='log_loss', max_iter=1000, random_state=42),
            method='sigmoid', cv=3
        ),
        "Random Forest Classifier": RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42),
        "XGBoost Classifier": XGBClassifier(n_estimators=100, max_depth=6, eval_metric='mlogloss', random_state=42)
    }

    best_cat_f1 = -1
    best_cat_name = None
    best_cat_model = None

    for name, clf in cat_candidates.items():
        t0 = time.time()
        clf.fit(X_train_vec, y_train_cat)
        train_time = round(time.time() - t0, 3)

        y_pred = clf.predict(X_test_vec)
        acc = accuracy_score(y_test_cat, y_pred)
        f1_macro = f1_score(y_test_cat, y_pred, average='macro')
        f1_weighted = f1_score(y_test_cat, y_pred, average='weighted')
        prec_weighted = precision_score(y_test_cat, y_pred, average='weighted', zero_division=0)
        rec_weighted = recall_score(y_test_cat, y_pred, average='weighted', zero_division=0)

        print(f"[{name}] Acc: {acc*100:.2f}% | F1-Macro: {f1_macro*100:.2f}% | Train Time: {train_time}s")

        comparison_results["category_classification"][name] = {
            "accuracy": round(acc * 100, 2),
            "macro_f1": round(f1_macro * 100, 2),
            "weighted_f1": round(f1_weighted * 100, 2),
            "weighted_precision": round(prec_weighted * 100, 2),
            "weighted_recall": round(rec_weighted * 100, 2),
            "train_time_sec": train_time
        }

        if f1_weighted > best_cat_f1:
            best_cat_f1 = f1_weighted
            best_cat_name = name
            best_cat_model = clf

    print(f"--> Category Champion: {best_cat_name} (F1: {best_cat_f1*100:.2f}%)")

    # Build production category pipeline (Vectorizer + Best Model)
    category_pipeline = Pipeline([
        ('tfidf', vectorizer_cat),
        ('clf', best_cat_model)
    ])

    joblib.dump(category_pipeline, os.path.join(MODELS_DIR, "category_model.joblib"))
    joblib.dump(le_category, os.path.join(MODELS_DIR, "category_label_encoder.joblib"))

    # =========================================================================
    # TASK 2: COMPLAINT PRIORITY CLASSIFICATION
    # =========================================================================
    print("\n" + "-" * 50)
    print("TASK 2: COMPLAINT PRIORITY CLASSIFICATION BENCHMARK")
    print("-" * 50)

    # Features: Text + Category + Location + Safety Flag
    X_prio_text = (df_raw['title'].fillna('') + ' ' + df_raw['description'].fillna('') + ' ' + df_raw['location'].fillna('')).values
    le_priority = LabelEncoder()
    y_prio = le_priority.fit_transform(df_raw['priority'])
    priority_names = list(le_priority.classes_)

    X_train_prio, X_test_prio, y_train_prio, y_test_prio = train_test_split(
        X_prio_text, y_prio, test_size=0.2, random_state=42, stratify=y_prio
    )

    vectorizer_prio = TfidfVectorizer(ngram_range=(1, 2), max_features=4000, stop_words='english')
    X_train_prio_vec = vectorizer_prio.fit_transform(X_train_prio)
    X_test_prio_vec = vectorizer_prio.transform(X_test_prio)

    prio_candidates = {
        "Calibrated Logistic Regression (Balanced)": CalibratedClassifierCV(
            estimator=LogisticRegression(class_weight='balanced', max_iter=1000, C=1.0, random_state=42),
            method='sigmoid', cv=3
        ),
        "Random Forest (Balanced)": RandomForestClassifier(n_estimators=100, class_weight='balanced', max_depth=12, random_state=42),
        "XGBoost Classifier": XGBClassifier(n_estimators=100, max_depth=5, eval_metric='mlogloss', random_state=42)
    }

    best_prio_f1 = -1
    best_prio_name = None
    best_prio_model = None

    for name, clf in prio_candidates.items():
        t0 = time.time()
        clf.fit(X_train_prio_vec, y_train_prio)
        train_time = round(time.time() - t0, 3)

        y_pred = clf.predict(X_test_prio_vec)
        acc = accuracy_score(y_test_prio, y_pred)
        f1_macro = f1_score(y_test_prio, y_pred, average='macro')
        f1_weighted = f1_score(y_test_prio, y_pred, average='weighted')
        prec_weighted = precision_score(y_test_prio, y_pred, average='weighted', zero_division=0)
        rec_weighted = recall_score(y_test_prio, y_pred, average='weighted', zero_division=0)

        print(f"[{name}] Acc: {acc*100:.2f}% | F1-Macro: {f1_macro*100:.2f}% | Train Time: {train_time}s")

        comparison_results["priority_classification"][name] = {
            "accuracy": round(acc * 100, 2),
            "macro_f1": round(f1_macro * 100, 2),
            "weighted_f1": round(f1_weighted * 100, 2),
            "weighted_precision": round(prec_weighted * 100, 2),
            "weighted_recall": round(rec_weighted * 100, 2),
            "train_time_sec": train_time
        }

        if f1_weighted > best_prio_f1:
            best_prio_f1 = f1_weighted
            best_prio_name = name
            best_prio_model = clf

    print(f"--> Priority Champion: {best_prio_name} (F1: {best_prio_f1*100:.2f}%)")

    priority_pipeline = Pipeline([
        ('tfidf', vectorizer_prio),
        ('clf', best_prio_model)
    ])
    joblib.dump(priority_pipeline, os.path.join(MODELS_DIR, "priority_model.joblib"))
    joblib.dump(le_priority, os.path.join(MODELS_DIR, "priority_label_encoder.joblib"))

    # =========================================================================
    # TASK 3: ADVANCED RESOLUTION TIME PREDICTION BENCHMARK
    # =========================================================================
    print("\n" + "-" * 50)
    print("TASK 3: ADVANCED RESOLUTION TIME REGRESSION BENCHMARK")
    print("-" * 50)

    # Features: Zero target leakage (strictly available at complaint filing time)
    reg_features = [
        'category', 'priority', 'location',
        'submitted_hour', 'submission_day', 'submission_month',
        'submission_weekday', 'is_weekend', 'has_media',
        'cat_historical_avg_days', 'loc_complaint_frequency', 'text_length'
    ]
    target_col = 'resolution_days'

    X_reg = df_resolved[reg_features]
    y_reg = df_resolved[target_col].values

    # Time-based / train-test split
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_reg, y_reg, test_size=0.2, random_state=42
    )

    categorical_cols = ['category', 'priority', 'location']
    numerical_cols = [
        'submitted_hour', 'submission_day', 'submission_month',
        'submission_weekday', 'is_weekend', 'has_media',
        'cat_historical_avg_days', 'loc_complaint_frequency', 'text_length'
    ]

    reg_preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_cols),
            ('num', StandardScaler(), numerical_cols)
        ]
    )

    reg_candidates = {
        "Random Forest Regressor": RandomForestRegressor(n_estimators=150, max_depth=12, random_state=42, n_jobs=-1),
        "Gradient Boosting Regressor": GradientBoostingRegressor(n_estimators=150, max_depth=5, learning_rate=0.08, random_state=42),
        "HistGradientBoosting Regressor": HistGradientBoostingRegressor(max_iter=150, max_depth=6, random_state=42),
        "XGBoost Regressor": XGBRegressor(n_estimators=150, max_depth=5, learning_rate=0.08, random_state=42, n_jobs=-1)
    }

    best_reg_mae = float('inf')
    best_reg_name = None
    best_reg_pipeline = None

    for name, reg in reg_candidates.items():
        pipe = Pipeline([
            ('preprocessor', reg_preprocessor),
            ('regressor', reg)
        ])

        t0 = time.time()
        pipe.fit(X_train_r, y_train_r)
        train_time = round(time.time() - t0, 3)

        y_pred = pipe.predict(X_test_r)
        mae = mean_absolute_error(y_test_r, y_pred)
        rmse = np.sqrt(mean_squared_error(y_test_r, y_pred))
        r2 = r2_score(y_test_r, y_pred)

        print(f"[{name}] MAE: {mae:.2f} days | RMSE: {rmse:.2f} days | R2: {r2:.3f} | Train Time: {train_time}s")

        comparison_results["resolution_regression"][name] = {
            "mae_days": round(float(mae), 2),
            "rmse_days": round(float(rmse), 2),
            "r2_score": round(float(r2), 3),
            "train_time_sec": train_time
        }

        if mae < best_reg_mae:
            best_reg_mae = mae
            best_reg_name = name
            best_reg_pipeline = pipe

    print(f"--> Resolution Champion: {best_reg_name} (MAE: {best_reg_mae:.2f} days)")

    # Save champion regression pipeline
    joblib.dump(best_reg_pipeline, os.path.join(MODELS_DIR, "resolution_time_model.joblib"))

    # Save summary metrics
    metrics_summary = {
        "model_version": "2.0.0",
        "last_trained": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "total_training_records": len(df_raw),
        "resolved_training_records": len(df_resolved),
        "category_champion": best_cat_name,
        "category_accuracy": comparison_results["category_classification"][best_cat_name]["accuracy"],
        "category_f1": comparison_results["category_classification"][best_cat_name]["weighted_f1"],
        "priority_champion": best_prio_name,
        "priority_accuracy": comparison_results["priority_classification"][best_prio_name]["accuracy"],
        "priority_f1": comparison_results["priority_classification"][best_prio_name]["weighted_f1"],
        "resolution_champion": best_reg_name,
        "resolution_mae_days": comparison_results["resolution_regression"][best_reg_name]["mae_days"],
        "resolution_rmse_days": comparison_results["resolution_regression"][best_reg_name]["rmse_days"],
        "resolution_r2": comparison_results["resolution_regression"][best_reg_name]["r2_score"],
        "categories": category_names,
        "priorities": priority_names,
        "locations": sorted(list(df_raw['location'].dropna().unique()))
    }

    with open(os.path.join(MODELS_DIR, "metrics.json"), "w") as f:
        json.dump(metrics_summary, f, indent=2)

    with open(os.path.join(MODELS_DIR, "model_comparison_results.json"), "w") as f:
        json.dump(comparison_results, f, indent=2)

    print("\n" + "=" * 70)
    print("  Production Models and Performance Metrics Successfully Serialized!")
    print(f"  Saved to: {MODELS_DIR}")
    print("=" * 70)
    return metrics_summary

if __name__ == "__main__":
    run_model_training_and_comparison()
