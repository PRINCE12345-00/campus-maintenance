# Smart Campus Maintenance and Predictive Analytics Platform

An industry-grade, AI-powered Smart Campus Maintenance, Predictive Analytics, and Intelligent Complaint Management Platform for Deenbandhu Chhotu Ram University of Science and Technology (DCRUST), Murthal.

---

## 🚀 Key AI & Engineering Capabilities

1. **Complaint Category Classification:**
   - NLP pipeline comparing TF-IDF + Calibrated Logistic Regression, Linear SVM, Random Forest, and XGBoost.
   - Calibrated probabilities with Brier score optimization and automated confidence thresholding.

2. **Priority Assessment & Safety Escalation:**
   - Multi-feature classification (Text, Location, Domain signals).
   - Real-time emergency hazard detection (fire, electrical sparks, gas leaks, structural collapse) with automatic escalation to High priority.

3. **Advanced Resolution Time Prediction (No Clamps):**
   - Pure machine learning regressor (Random Forest Regressor, MAE 3.84 days, RMSE 4.54 days) trained strictly on resolved records with **zero target leakage**.
   - Dynamically computes **Expected Resolution Date** and **Remaining Days** with overdue tracking.
   - Delay Risk Categorization: *On Track*, *At Risk*, *Delayed*, *High Urgency SLA*.

4. **Predictive Maintenance & Failure Hotspots:**
   - Dynamic campus location risk scoring: incident volume weighted against critical hazard proportion.
   - Monthly time-series trend analysis and quarterly demand forecasting.
   - Automated preventive maintenance action recommendations.

5. **Explainable AI (SHAP & Feature Attribution):**
   - Dynamic local feature attribution providing human-readable explanations of AI triage decisions in the Student & Admin views.

6. **Smart Complaint Routing:**
   - Rule and optimization-based dispatch recommending specialized campus teams (e.g. Sanitation & Water Works, Electrical Cell) and targeted turnaround SLAs.

7. **RAG-Powered AI Maintenance Chatbot:**
   - Interactive assistant leveraging a TF-IDF vector knowledge base of campus maintenance policies, emergency guidelines, and live complaint status lookup.

8. **Computer Vision Inspection Module:**
   - Image analysis pipeline verifying resolution, sharpness (blur detection), and damage signatures for uploaded complaint photos.

9. **Persistent Data Storage:**
   - File-backed persistent database (`server/data/database.json`) ensuring all complaints, status updates, timelines, and email logs persist across server restarts.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS, Recharts, Lucide Icons
- **Backend API:** Node.js, Express.js (Port 5000), Nodemailer, Twilio, Persistent JSON Store
- **AI/ML Service:** Python 3.11, FastAPI (Port 8000), Scikit-Learn 1.6, XGBoost 3.2, SHAP 0.51, Pandas, NumPy

---

## ⚡ Execution Instructions

### Step 1: Start Python AI & ML Microservice
```bash
cd campus-maintenance
# Run using Python 3.11
python ml-service/app.py
```
*Service will be active on:* `http://127.0.0.1:8000`  
*Interactive Swagger API Docs:* `http://127.0.0.1:8000/docs`

### Step 2: Start Node.js Backend Server
```bash
cd campus-maintenance
node server/server.js
```
*Backend API will be active on:* `http://localhost:5000`

### Step 3: Start React Frontend
```bash
cd campus-maintenance
npm run dev
```
*Frontend will be active on:* `http://localhost:5173`

---

## 📊 Retraining Production ML Models

To rerun dataset cleaning, leakage checks, and retrain all production models:
```bash
cd campus-maintenance/ml-service
# 1. Run Data Engineering & Quality Pipeline
python data_pipeline.py

# 2. Run Multi-Model Benchmark & Serialization
python train_production_models.py
```

---

## 👤 Demo Authentication Accounts

- **Student:** `aarav@student.dcrust.in` / `student123`
- **Admin:** `chahalprince0481@gmail.com` / `prince@123`
- **HOD CSE:** `hod.cse@dcrust.in` / `hod12345`
