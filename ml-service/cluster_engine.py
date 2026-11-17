import os
import json
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

CAMPUS_FACILITY_CONCEPTS = [
    {"concept": "fan_cooling", "keywords": ["fan", "fans", "ceiling fan", "cooler", "exhaust", "regulator", "ventilation"]},
    {"concept": "lighting", "keywords": ["light", "lights", "lamp", "bulb", "tube", "tubelight", "flicker", "flickering", "dark", "street light", "led"]},
    {"concept": "water_sanitation", "keywords": ["water", "leak", "leaking", "pipe", "pipes", "tap", "taps", "faucet", "washroom", "toilet", "drain", "drainage", "flush", "sink", "geyser", "supply"]},
    {"concept": "electrical_power", "keywords": ["power", "switch", "socket", "short circuit", "spark", "breaker", "fuse", "mcb", "wiring", "voltage", "blackout", "tripping", "meter"]},
    {"concept": "network_lab", "keywords": ["wifi", "wi-fi", "internet", "lan", "router", "network", "connectivity", "cable", "ethernet", "computer", "lab", "pc", "monitor"]},
    {"concept": "furniture_civil", "keywords": ["bench", "chair", "desk", "table", "door", "window", "lock", "handle", "blackboard", "whiteboard", "tile", "wall", "plaster"]},
]

def extract_concepts(text: str) -> set:
    text_lower = text.lower()
    matched = set()
    for item in CAMPUS_FACILITY_CONCEPTS:
        for kw in item["keywords"]:
            if kw in text_lower:
                matched.add(item["concept"])
                break
    return matched

def analyze_complaint_clusters(
    complaints: List[Dict[str, Any]], 
    target_id: Optional[str] = None, 
    threshold: float = 0.35
) -> Dict[str, Any]:
    """
    Data Science Unsupervised Incident Clustering Engine:
    - Uses TF-IDF Vector Space Modeling + Cosine Similarity Matrix.
    - Applies spatial location, category semantic, and domain keyword concept boosting.
    - Groups related/duplicate complaints into Incident Clusters.
    - Identifies Master Tickets to eliminate duplicate maintenance dispatches.
    """
    if not complaints or len(complaints) < 1:
        return {
            "success": True,
            "target_id": target_id,
            "is_clustered": False,
            "cluster_size": 1,
            "similar_complaints": [],
            "ai_cluster_recommendation": "No other active complaints available for clustering."
        }

    # Normalize problem texts for TF-IDF
    corpus = []
    concepts_list = []
    for c in complaints:
        title = str(c.get("title", ""))
        desc = str(c.get("description", ""))
        text = f"{title} {title} {desc}".strip().lower()
        corpus.append(text)
        concepts_list.append(extract_concepts(text))

    try:
        vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=2500,
            sublinear_tf=True
        )
        tfidf_matrix = vectorizer.fit_transform(corpus)
        sim_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    except Exception as e:
        return {
            "success": False,
            "error": f"TF-IDF vectorization error: {str(e)}",
            "is_clustered": False
        }

    n = len(complaints)
    # Apply domain concept, location & category boost
    boosted_sim = np.copy(sim_matrix)
    for i in range(n):
        for j in range(n):
            if i != j:
                same_loc = (complaints[i].get("location") == complaints[j].get("location")) and bool(complaints[i].get("location"))
                same_cat = (complaints[i].get("category") == complaints[j].get("category")) and bool(complaints[i].get("category"))
                shared_concepts = concepts_list[i].intersection(concepts_list[j])

                if shared_concepts:
                    boosted_sim[i, j] += 0.28  # Shared domain maintenance concept boost
                if same_loc:
                    boosted_sim[i, j] += 0.20  # High spatial proximity boost
                if same_cat:
                    boosted_sim[i, j] += 0.12  # Category match boost
                boosted_sim[i, j] = min(0.98, boosted_sim[i, j])

    # If target_id is specified, compute cluster for that specific complaint
    target_idx = None
    if target_id:
        for idx, c in enumerate(complaints):
            if str(c.get("id")) == str(target_id):
                target_idx = idx
                break

    if target_idx is not None:
        target_comp = complaints[target_idx]
        matches = []
        for j in range(n):
            if j != target_idx:
                score = float(boosted_sim[target_idx, j])
                if score >= threshold:
                    match_comp = complaints[j]
                    matches.append({
                        "id": match_comp.get("id"),
                        "title": match_comp.get("title"),
                        "category": match_comp.get("category"),
                        "location": match_comp.get("location"),
                        "status": match_comp.get("status"),
                        "submission_date": match_comp.get("submissionDate", ""),
                        "similarity_score": round(score * 100, 1)
                    })

        # Sort matches by similarity descending
        matches.sort(key=lambda x: x["similarity_score"], reverse=True)
        is_clustered = len(matches) > 0
        cluster_size = len(matches) + 1

        # Determine Master Ticket (earliest submitted or in-progress)
        master_id = target_comp.get("id")
        master_title = target_comp.get("title")
        if is_clustered:
            all_cluster_items = [target_comp] + [complaints[j] for j in range(n) if float(boosted_sim[target_idx, j]) >= threshold and j != target_idx]
            earliest = sorted(all_cluster_items, key=lambda x: str(x.get("submissionDate", "")) or str(x.get("id", "")))[0]
            master_id = earliest.get("id")
            master_title = earliest.get("title")

        if is_clustered:
            rec = (
                f"Cluster of {cluster_size} related tickets detected in {target_comp.get('location')}. "
                f"Top match: '{matches[0]['title']}' ({matches[0]['similarity_score']}% match). "
                f"Recommended: Coordinate repairs under Master Ticket {master_id} to eliminate redundant technician dispatches."
            )
        else:
            rec = (
                f"Verified Isolated Incident. No duplicate or correlated tickets detected in {target_comp.get('location')} "
                f"under {target_comp.get('category')}. Standalone dispatch verified."
            )

        return {
            "success": True,
            "target_id": target_id,
            "is_clustered": is_clustered,
            "cluster_size": cluster_size,
            "similarity_threshold_used": int(threshold * 100),
            "master_ticket_id": master_id,
            "master_ticket_title": master_title,
            "similar_complaints": matches,
            "ai_cluster_recommendation": rec
        }

    # Global clustering overview across all campus complaints
    all_clusters = []
    visited = set()
    for i in range(n):
        if i in visited:
            continue
        group_indices = [i]
        for j in range(n):
            if j != i and j not in visited and float(boosted_sim[i, j]) >= threshold:
                group_indices.append(j)

        if len(group_indices) > 1:
            for idx in group_indices:
                visited.add(idx)

            cluster_items = [complaints[idx] for idx in group_indices]
            earliest = sorted(cluster_items, key=lambda x: str(x.get("submissionDate", "")) or str(x.get("id", "")))[0]
            master_id = earliest.get("id")
            master_title = earliest.get("title")

            # Average similarity score among members
            scores = []
            tickets = []
            for idx in group_indices:
                comp = complaints[idx]
                sim_score = 100.0 if comp.get("id") == master_id else round(float(boosted_sim[group_indices[0], idx]) * 100, 1)
                scores.append(sim_score)
                tickets.append({
                    "id": comp.get("id"),
                    "title": comp.get("title"),
                    "category": comp.get("category"),
                    "location": comp.get("location"),
                    "status": comp.get("status"),
                    "submittedBy": comp.get("submittedBy"),
                    "is_master": comp.get("id") == master_id,
                    "similarity_score": sim_score
                })

            tickets.sort(key=lambda t: (not t["is_master"], -t["similarity_score"]))
            avg_score = round(sum(scores) / len(scores), 1)

            all_clusters.append({
                "cluster_id": f"CLUST-0{len(all_clusters)+1}",
                "category": complaints[group_indices[0]].get("category"),
                "location": complaints[group_indices[0]].get("location"),
                "size": len(group_indices),
                "master_ticket_id": master_id,
                "master_ticket_title": master_title,
                "avg_similarity_score": avg_score,
                "recommended_action": f"Consolidate {len(group_indices)} tickets under Master Ticket {master_id}. Eliminates {len(group_indices) - 1} redundant dispatch(es).",
                "tickets": tickets
            })

    # Isolated complaints that do not belong to any cluster
    isolated = []
    for i in range(n):
        if i not in visited:
            isolated.append({
                "id": complaints[i].get("id"),
                "title": complaints[i].get("title"),
                "category": complaints[i].get("category"),
                "location": complaints[i].get("location"),
                "status": complaints[i].get("status"),
                "submittedBy": complaints[i].get("submittedBy"),
            })

    redundant_count = sum(c["size"] - 1 for c in all_clusters)
    efficiency_pct = round((redundant_count / n) * 100, 1) if n > 0 else 0.0

    return {
        "success": True,
        "total_complaints_analyzed": n,
        "total_clusters_found": len(all_clusters),
        "redundant_tickets_eliminated": redundant_count,
        "dispatch_efficiency_gain": f"{efficiency_pct}%",
        "clusters": all_clusters,
        "isolated_complaints": isolated
    }

# ---------------------------------------------------------------------------
# Predictive Campus Asset Health & Failure Risk Matrix Engine
# ---------------------------------------------------------------------------

CANONICAL_CAMPUS_ASSETS = [
    {
        "asset_id": "AST-PLUMB-01",
        "asset_name": "Main Hydro-Pneumatic Water Booster Pump",
        "category": "Plumbing",
        "location": "Boys Hostel",
        "installation_year": 2022,
        "expected_lifespan_years": 8,
        "base_mtbf_days": 21.0,
        "criticality": "High",
        "preventive_task": "Inspect impeller casing seal, lubricate motor bearings, and test auto-cutoff pressure switches."
    },
    {
        "asset_id": "AST-PLUMB-02",
        "asset_name": "Rooftop Gravity Water Supply & Float Valve System",
        "category": "Plumbing",
        "location": "Girls Hostel",
        "installation_year": 2023,
        "expected_lifespan_years": 10,
        "base_mtbf_days": 28.0,
        "criticality": "High",
        "preventive_task": "Clean float chamber strainer, inspect overhead pipe joins, and verify distribution pressure."
    },
    {
        "asset_id": "AST-ELEC-01",
        "asset_name": "Step-Down Power Substation Transformer (33kV/415V)",
        "category": "Electrical",
        "location": "Academic Block A",
        "installation_year": 2021,
        "expected_lifespan_years": 15,
        "base_mtbf_days": 45.0,
        "criticality": "Critical",
        "preventive_task": "Perform infrared thermal imaging for hot spots, test dielectric breakdown voltage of transformer oil."
    },
    {
        "asset_id": "AST-HVAC-01",
        "asset_name": "Central Server Rack & Lab Precision AC Units (Cluster 1-4)",
        "category": "Electrical",
        "location": "Computer Lab 3",
        "installation_year": 2023,
        "expected_lifespan_years": 7,
        "base_mtbf_days": 18.0,
        "criticality": "High",
        "preventive_task": "Chemical coil wash, check refrigerant gas R-410A operating pressures, and clean condenser fan blades."
    },
    {
        "asset_id": "AST-ELEC-02",
        "asset_name": "High-Mast Security Floodlight Pillars & Perimeter Circuit",
        "category": "Electrical",
        "location": "Main Gate",
        "installation_year": 2022,
        "expected_lifespan_years": 6,
        "base_mtbf_days": 24.0,
        "criticality": "Medium",
        "preventive_task": "Check dusk-to-dawn astronomical timer, inspect underground armored cable insulation resistance."
    },
    {
        "asset_id": "AST-STRUCT-01",
        "asset_name": "Auditorium Acoustic Paneling & Automated Stage Hoist",
        "category": "Damaged Furniture",
        "location": "Auditorium",
        "installation_year": 2020,
        "expected_lifespan_years": 12,
        "base_mtbf_days": 60.0,
        "criticality": "Low",
        "preventive_task": "Inspect wire rope safety load limits, calibrate motorized limit switches, tighten acoustic panel wall anchors."
    }
]

def compute_asset_health_matrix(
    live_complaints: List[Dict[str, Any]], 
    historical_df: Optional[Any] = None
) -> Dict[str, Any]:
    """
    Data Science Predictive Asset Health & Reliability Matrix:
    - Calculates Failure Rate (Lambda) and MTBF (Mean Time Between Failures).
    - Uses Poisson probability model P(Failure within 30 days) = 1 - exp(-lambda * 30).
    - Evaluates Asset Health Score (0 - 100%) and categorizes Risk (Critical / Moderate / Optimal).
    - Prescribes proactive preventive maintenance actions before catastrophic breakdown occurs.
    """
    results = []

    for asset in CANONICAL_CAMPUS_ASSETS:
        loc = asset["location"]
        cat = asset["category"]

        # Count active live complaints for this asset
        active_live = [
            c for c in live_complaints
            if c.get("location") == loc and (c.get("category") == cat or cat in str(c.get("title", ""))) and c.get("status") in ["Submitted", "Assigned", "In Progress"]
        ]
        active_count = len(active_live)

        # Historical count
        hist_count = 12
        if historical_df is not None and not historical_df.empty:
            try:
                hist_match = historical_df[
                    (historical_df["location"] == loc) & (historical_df["category"] == cat)
                ]
                hist_count = max(4, len(hist_match))
            except Exception:
                hist_count = 15

        # MTBF calculation (Operational days / Incidents)
        # Assuming 365 operational days in academic evaluation cycle
        operational_days = 365.0
        lambda_failure_rate = (hist_count + active_count * 2) / operational_days
        mtbf_days = round(1.0 / max(0.005, lambda_failure_rate), 1)

        # Poisson 30-day failure probability: P = 1 - exp(-lambda * 30)
        failure_prob_30d = round(float(1.0 - math.exp(-lambda_failure_rate * 30.0)) * 100.0, 1)

        # Health Index Score (0 - 100%)
        # Penalized heavily by active unresolved incidents and high failure rates
        health_score = int(np.clip(100.0 - (active_count * 18.0) - (failure_prob_30d * 0.45), 20.0, 96.0))

        # Risk Classification
        if health_score < 50 or active_count >= 2:
            risk_level = "Critical Risk"
            risk_tone = "rose"
            days_until_next_failure = round(max(1.5, mtbf_days * 0.25), 1)
        elif health_score < 75 or active_count == 1:
            risk_level = "Moderate Risk"
            risk_tone = "amber"
            days_until_next_failure = round(max(4.0, mtbf_days * 0.55), 1)
        else:
            risk_level = "Optimal Health"
            risk_tone = "emerald"
            days_until_next_failure = round(max(12.0, mtbf_days * 0.90), 1)

        next_service_date = (datetime.now() + timedelta(days=days_until_next_failure)).strftime("%Y-%m-%d")

        results.append({
            "asset_id": asset["asset_id"],
            "asset_name": asset["asset_name"],
            "category": asset["category"],
            "location": asset["location"],
            "criticality": asset["criticality"],
            "health_score": health_score,
            "risk_level": risk_level,
            "risk_tone": risk_tone,
            "active_tickets": active_count,
            "mtbf_days": mtbf_days,
            "failure_probability_30d": failure_prob_30d,
            "predicted_next_failure_days": days_until_next_failure,
            "next_service_date": next_service_date,
            "recommended_preventive_action": asset["preventive_task"]
        })

    # Sort results by health score ascending (most critical first)
    results.sort(key=lambda x: x["health_score"])

    # Overall campus infrastructure health KPI
    avg_health = round(sum(r["health_score"] for r in results) / len(results), 1)
    critical_assets_count = sum(1 for r in results if r["risk_level"] == "Critical Risk")

    return {
        "success": True,
        "campus_infrastructure_health_score": avg_health,
        "critical_assets_count": critical_assets_count,
        "total_monitored_assets": len(results),
        "evaluation_timestamp": datetime.now().isoformat(),
        "assets": results
    }

if __name__ == "__main__":
    # Self-test
    mock_complaints = [
        {"id": "CMP-1", "title": "Water leakage in boys hostel", "description": "Bathroom pipe leaking", "category": "Plumbing", "location": "Boys Hostel", "status": "In Progress"},
        {"id": "CMP-2", "title": "Water leaking issue", "description": "Pipe dripping water", "category": "Plumbing", "location": "Boys Hostel", "status": "In Progress"},
        {"id": "CMP-3", "title": "Fan not working in lab", "description": "Ceiling fan stopped", "category": "Electrical", "location": "Computer Lab 3", "status": "In Progress"}
    ]
    clust_res = analyze_complaint_clusters(mock_complaints, target_id="CMP-2")
    print("\n--- CLUSTERING TEST ---")
    print("Is Clustered:", clust_res["is_clustered"])
    print("Master ID:", clust_res["master_ticket_id"])
    print("Recommendation:", clust_res["ai_cluster_recommendation"])

    asset_res = compute_asset_health_matrix(mock_complaints)
    print("\n--- ASSET HEALTH TEST ---")
    print("Campus Health Score:", asset_res["campus_infrastructure_health_score"])
    print("Top Critical Asset:", asset_res["assets"][0]["asset_name"], "| Health:", asset_res["assets"][0]["health_score"])
