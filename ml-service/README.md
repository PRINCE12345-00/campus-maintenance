# Campus Maintenance ML Service

This Python service is an additive ML component; it does not replace the existing React or Node.js application.

## 1. Setup (Windows PowerShell)

```powershell
cd ml-service
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## 2. Prepare labelled data

Copy `dataset/complaints_template.csv` to `dataset/complaints.csv`. Add at least 30 labelled complaint records with these exact columns:

- `title`: complaint title
- `description`: complaint details
- `category`: verified category (for example Electrical, Plumbing, Cleaning, IT/Network)
- `priority`: verified priority (for example Low, Medium, High, Critical)

Use real, reviewed records where possible. Do not treat generated/sample rows as representative campus data. Aim for hundreds of varied records per label before relying on predictions. Remove personal details from training text.

## 3. Train models

```powershell
python train.py
```

The script trains separate TF-IDF + Logistic Regression classifiers for category and priority, evaluates them on a held-out test split, and saves model files and metrics under `models/`. Check per-class precision/recall and class balance; accuracy alone is not enough.

## 4. Run API

```powershell
uvicorn app:app --reload --port 8000
```

Health: `http://localhost:8000/health`
Prediction: `POST http://localhost:8000/predict` with JSON `{ "title": "Water leak", "description": "Pipe is leaking in hostel washroom" }`.

The service deliberately returns HTTP 503 until both models have been trained. It does not invent predictions when no trained model exists. The current Node backend has not yet been wired to call this service; that integration is the next implementation step after the dataset and labels are agreed.
