import os
import json
import re
from typing import Dict, Any, List, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Campus Maintenance Knowledge Base
KNOWLEDGE_BASE = [
    {
        "id": "kb-01",
        "topic": "Complaint Submission Procedure",
        "keywords": ["how to submit", "file complaint", "raise ticket", "register complaint", "procedure", "steps"],
        "content": "To submit a maintenance complaint on Campus Care: 1) Log in to your student portal. 2) Click 'Overview' or 'My Complaints'. 3) Fill in the complaint title, select the campus location (e.g., Boys Hostel, Academic Block A), choose the department, and provide a clear description. 4) Optionally attach a photo evidence. 5) Submit the complaint. Our AI triage system will automatically classify priority and estimate resolution time.",
        "source": "Campus Care Student Handbook Section 2.1"
    },
    {
        "id": "kb-02",
        "topic": "Turnaround Time and SLA Guidelines",
        "keywords": ["how long", "resolution time", "turnaround", "sla", "days required", "when will it be fixed"],
        "content": "Campus maintenance operates on priority-based SLAs: High Priority issues (such as water pipe bursts, short circuits, or gas hazards) are attended to within 24-36 hours (~1.5 days). Medium Priority routine repairs take 2-4 days. Minor Low Priority requests take 3-5 days. Actual resolution time is dynamically estimated by our Machine Learning Regressor based on historical repair performance.",
        "source": "Campus Maintenance SLA Manual Rev 3"
    },
    {
        "id": "kb-03",
        "topic": "Emergency Contacts & Critical Safety Hazards",
        "keywords": ["emergency", "fire", "spark", "electric shock", "gas leak", "burning smell", "urgent", "danger", "helpline"],
        "content": "For immediate life-safety emergencies (electrical fire, high-voltage spark, gas leak, building structural collapse), immediately notify the Campus Rapid Response Cell at +91-1269-248001 or contact the Security Control Room at the Main Gate. In the portal, selecting safety keywords will automatically escalate the complaint to 'High' priority with rapid triage.",
        "source": "DCRUST Campus Safety & Emergency Protocol"
    },
    {
        "id": "kb-04",
        "topic": "Plumbing Maintenance Unit",
        "keywords": ["plumbing", "water leakage", "tap broken", "washbasin", "toilet", "drainage", "water supply", "tank"],
        "content": "The Plumbing Unit handles water supply failures, washroom drainage clogs, leaking pipes, overhead tank overflows, and broken taps across all academic blocks and hostels. Standard response time is 1-3 business days.",
        "source": "Estate Office - Sanitation & Plumbing Dept"
    },
    {
        "id": "kb-05",
        "topic": "Electrical Maintenance Cell",
        "keywords": ["electrical", "power cut", "light flickering", "fan not working", "switchboard", "wiring", "ac repair", "generator"],
        "content": "The Electrical Maintenance Cell is responsible for street lighting, hostel room power outlets, classroom projectors, switchboard replacements, and substation power distribution. Report live wire exposures immediately.",
        "source": "Estate Office - Electrical Division"
    },
    {
        "id": "kb-06",
        "topic": "Civil & Carpentry Maintenance",
        "keywords": ["furniture", "broken bench", "door lock", "window pane", "desk", "wall crack", "plaster", "carpentry"],
        "content": "The Carpentry and Civil Works Cell repairs broken classroom benches, damaged hostel doors/locks, shattered window panes, and wall plastering. Repairs are scheduled on working days between 9:00 AM and 5:00 PM.",
        "source": "Estate Office - Civil Infrastructure"
    },
    {
        "id": "kb-07",
        "topic": "IT & Campus Wi-Fi / LAN Network",
        "keywords": ["wifi", "internet", "lan port", "network", "router", "lab computer", "slow speed", "connectivity"],
        "content": "The Computer Center & Network Maintenance Cell handles Wi-Fi access point downtime, hostel LAN socket repairs, and campus fiber link troubleshooting. Submit MAC address if experiencing individual authentication blocks.",
        "source": "DCRUST Computer Center Helpdesk"
    },
    {
        "id": "kb-08",
        "topic": "Complaint Status Tracking & Progress",
        "keywords": ["track complaint", "check status", "progress", "what does assigned mean", "in progress", "resolved"],
        "content": "Complaints progress through five stages: 1) Submitted (10%): Complaint logged in system. 2) Assigned (25%): Allocated to specialized maintenance team. 3) In Progress (60%): Technician currently performing repairs. 4) Resolved (90%): Work completed on-site. 5) Closed (100%): Verified by student with feedback rating.",
        "source": "Campus Care Workflow Lifecycle"
    }
]

class MaintenanceRAGChatbot:
    def __init__(self):
        self.kb = KNOWLEDGE_BASE
        self.corpus = [f"{item['topic']}. {item['content']} {' '.join(item['keywords'])}" for item in self.kb]
        self.vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
        self.doc_vectors = self.vectorizer.fit_transform(self.corpus)

    def retrieve_context(self, query: str, top_k: int = 2) -> List[Dict[str, Any]]:
        query_vec = self.vectorizer.transform([query])
        sims = cosine_similarity(query_vec, self.doc_vectors)[0]
        top_indices = sims.argsort()[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            if sims[idx] > 0.1:
                results.append({
                    "score": round(float(sims[idx]), 3),
                    "topic": self.kb[idx]["topic"],
                    "content": self.kb[idx]["content"],
                    "source": self.kb[idx]["source"]
                })
        return results

    def answer_query(self, user_query: str, live_complaints: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
        clean_q = user_query.strip()
        
        # 1. Check for specific Complaint ID inquiry (e.g., "status of CMP-1001", "CMP-1794926925002")
        cmp_match = re.search(r'CMP[-\d]+', clean_q, re.IGNORECASE)
        if cmp_match and live_complaints:
            target_id = cmp_match.group(0).upper()
            found = next((c for c in live_complaints if c.get('id', '').upper() == target_id), None)
            if found:
                status = found.get('status', 'Submitted')
                cat = found.get('category', 'General')
                progress = found.get('progress', 10)
                assigned = found.get('assignedTo', 'Maintenance Cell')
                est_days = found.get('mlPrediction', {}).get('estimatedResolutionDays') or '2-3'
                
                response_text = (
                    f"**Live Complaint Status for {found.get('id')}:**\n\n"
                    f"- **Title:** {found.get('title')}\n"
                    f"- **Status:** {status} ({progress}% completed)\n"
                    f"- **Category:** {cat}\n"
                    f"- **Assigned Team:** {assigned}\n"
                    f"- **Location:** {found.get('location')}\n"
                    f"- **Estimated Resolution:** ~{est_days} days\n\n"
                    f"Our maintenance technicians have been notified. You will receive an automated email update upon each stage completion."
                )
                return {
                    "answer": response_text,
                    "source": "Campus Care Live Database API",
                    "confidence": 0.99,
                    "type": "live_status_lookup"
                }
            else:
                return {
                    "answer": f"I checked our database, but no complaint record was found with ID `{target_id}`. Please verify your Complaint ID in the 'My Complaints' tab.",
                    "source": "Campus Care Live Database API",
                    "confidence": 0.90,
                    "type": "live_status_not_found"
                }

        # 2. General RAG Knowledge Base Retrieval
        retrieved = self.retrieve_context(clean_q, top_k=2)
        if retrieved:
            primary = retrieved[0]
            answer_parts = [primary["content"]]
            if len(retrieved) > 1 and retrieved[1]["score"] > 0.25:
                answer_parts.append(f"\n\n**Additional Details:** {retrieved[1]['content']}")

            sources = list(set([r["source"] for r in retrieved]))
            return {
                "answer": "".join(answer_parts),
                "source": ", ".join(sources),
                "confidence": primary["score"],
                "type": "rag_knowledge_base"
            }

        # 3. Fallback General Assistance
        return {
            "answer": "I am the Smart Campus AI Assistant. You can ask me how to file complaints, check maintenance turnaround SLAs, emergency contacts for hazardous leaks or electrical sparks, or check the live progress of any ticket by mentioning its Complaint ID (e.g. `CMP-1001`).",
            "source": "Campus Care AI Knowledge System",
            "confidence": 0.50,
            "type": "fallback"
        }

if __name__ == "__main__":
    bot = MaintenanceRAGChatbot()
    print("Testing Query 1 (How to submit):", bot.answer_query("how can I file a complaint?"))
    print("\nTesting Query 2 (Water leakage):", bot.answer_query("tap broken in hostel washroom"))
    print("\nTesting Query 3 (Status lookup):", bot.answer_query("what is the status of CMP-1001?", [{"id": "CMP-1001", "title": "Street light flickering", "status": "Assigned", "progress": 25, "category": "Electrical", "assignedTo": "Maintenance Team", "location": "Academic Block A"}]))
