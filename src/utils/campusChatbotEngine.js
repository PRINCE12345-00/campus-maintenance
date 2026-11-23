// Campus Care AI Autonomous Knowledge & RAG Fallback Engine
// Provides high-fidelity instant answers and ticket lookup whether online or offline

export const CAMPUS_KNOWLEDGE_BASE = [
  {
    id: 'kb-01',
    topic: 'Complaint Submission Procedure',
    keywords: ['how to submit', 'file complaint', 'raise ticket', 'register complaint', 'procedure', 'steps', 'submit', 'complain', 'lodge'],
    content: "To submit a maintenance complaint on Campus Care:\n1) Log in to your student portal.\n2) Navigate to 'My Complaints' or click the '+ New Complaint' button.\n3) Enter a descriptive title (e.g., 'Broken fan in Lab 208').\n4) Select the campus location (e.g., Boys Hostel, Academic Block A) and choose category (Electrical, Plumbing, Civil, etc.).\n5) Optionally upload a photo for AI Computer Vision authenticity audit.\n6) Submit the complaint. Our AI triage system will automatically classify priority and estimate turnaround time.",
    source: 'Campus Care Student Handbook Section 2.1'
  },
  {
    id: 'kb-02',
    topic: 'Turnaround Time and SLA Guidelines',
    keywords: ['how long', 'resolution time', 'turnaround', 'sla', 'days required', 'when will it be fixed', 'time', 'delay', 'duration', 'service level'],
    content: "Campus maintenance operates on priority-based SLAs:\n• High Priority (water pipe bursts, live wire sparks, gas hazards): Attended within 24-36 hours (~1.5 days).\n• Medium Priority (room fans, tube lights, door latch repairs): Resolved in 2-4 days.\n• Low Priority (minor cosmetic fixes, whiteboards): Attended in 3-5 days.\n\nActual resolution time is dynamically estimated by our Machine Learning Regressor based on historical repair records.",
    source: 'Campus Maintenance SLA Manual Rev 3'
  },
  {
    id: 'kb-03',
    topic: 'Emergency Contacts & Critical Safety Hazards',
    keywords: ['emergency', 'fire', 'spark', 'electric shock', 'gas leak', 'burning smell', 'urgent', 'danger', 'helpline', 'contact', 'number', 'phone', 'call', 'ambulance'],
    content: "For immediate campus life-safety emergencies:\n• Campus Rapid Response Cell: +91-1269-248001\n• Security Control Room (Main Gate): +91-1269-248100\n• Campus Health Center & Ambulance: +91-1269-248222\n• Chief Warden Office: +91-1269-248333\n• Electrical Substation Emergency: +91-1269-248444\n\nIn the portal, selecting safety keywords will automatically escalate the complaint to 'High' priority with rapid dispatch.",
    source: 'DCRUST Campus Safety & Emergency Protocol'
  },
  {
    id: 'kb-04',
    topic: 'Plumbing Maintenance Unit',
    keywords: ['plumbing', 'water', 'leak', 'leaking', 'tap', 'washbasin', 'toilet', 'drainage', 'water supply', 'tank', 'flush', 'sink', 'geyser', 'pipe'],
    content: "The Plumbing Maintenance Unit handles water supply failures, washroom drainage clogs, leaking pipes, overhead tank overflows, and broken taps across all academic blocks and hostels. Standard response time is 1-3 business days.",
    source: 'Estate Office - Sanitation & Plumbing Dept'
  },
  {
    id: 'kb-05',
    topic: 'Electrical Maintenance Cell',
    keywords: ['electrical', 'power', 'power cut', 'light', 'fan', 'flicker', 'flickering', 'switch', 'socket', 'ac', 'cooler', 'wiring', 'voltage', 'short circuit', 'mcb'],
    content: "The Electrical Maintenance Cell is responsible for street lighting, hostel room power outlets, fans, classroom projectors, switchboard replacements, and substation power distribution. Report live wire exposures immediately.",
    source: 'Estate Office - Electrical Division'
  },
  {
    id: 'kb-06',
    topic: 'Civil & Carpentry Maintenance',
    keywords: ['furniture', 'bench', 'chair', 'desk', 'door', 'lock', 'window', 'pane', 'wall', 'crack', 'plaster', 'carpentry', 'blackboard', 'table'],
    content: "The Carpentry and Civil Works Cell repairs broken classroom benches, damaged hostel doors/locks, shattered window panes, and wall plastering. Repairs are scheduled on working days between 9:00 AM and 5:00 PM.",
    source: 'Estate Office - Civil Infrastructure'
  },
  {
    id: 'kb-07',
    topic: 'IT & Campus Wi-Fi / LAN Network',
    keywords: ['wifi', 'wi-fi', 'internet', 'lan', 'network', 'router', 'computer', 'lab', 'connectivity', 'slow speed', 'ethernet', 'cable'],
    content: "The Computer Center & Network Maintenance Cell handles Wi-Fi access point downtime, hostel LAN socket repairs, and campus fiber link troubleshooting. Submit your MAC address if experiencing individual authentication blocks.",
    source: 'DCRUST Computer Center Helpdesk'
  },
  {
    id: 'kb-08',
    topic: 'Complaint Status Tracking & Progress',
    keywords: ['track', 'status', 'progress', 'what does assigned mean', 'in progress', 'resolved', 'stages', 'closed'],
    content: "Complaints progress through five stages:\n1) Submitted (10%): Complaint logged in system.\n2) Assigned (25%): Allocated to specialized maintenance team.\n3) In Progress (50%): Technician currently performing repairs.\n4) Verification (75%): Supervisor quality & safety check.\n5) Resolved (100%): Work complete & verified by student.",
    source: 'Campus Care Workflow Lifecycle'
  }
]

export function answerCampusQuery(userQuery, liveComplaints = []) {
  const cleanQ = (userQuery || '').trim()
  if (!cleanQ) {
    return {
      answer: "How can I assist you with campus maintenance today? You can ask about filing complaints, SLAs, emergency contacts, or check any complaint ID.",
      source: "Campus Care AI Assistant"
    }
  }

  // 1. Check for specific Ticket ID inquiry (e.g. CMP-1001, CMP-1794936753571)
  const cmpMatch = cleanQ.match(/CMP[-\d]+/i)
  if (cmpMatch) {
    const targetId = cmpMatch[0].toUpperCase()
    const found = (liveComplaints || []).find((c) => (c.id || '').toUpperCase() === targetId)
    if (found) {
      const progress = found.progress !== undefined && found.progress !== null
        ? found.progress
        : (found.status === 'Resolved' || found.status === 'Closed' ? 100 : found.status === 'In Progress' ? 50 : 25)

      return {
        answer: `**Live Ticket Status for ${found.id}:**\n\n• **Title:** ${found.title}\n• **Status:** ${found.status} (${progress}% completed)\n• **Category:** ${found.category}\n• **Location:** ${found.location}\n• **Assigned Team:** ${found.assignedTo || 'Campus Care Maintenance Cell'}\n• **Submitted By:** ${found.submittedBy || 'Student'}\n• **Submission Date:** ${found.submissionDate || 'Recently'}\n\nOur maintenance technicians have been notified. You can track live updates directly on your dashboard.`,
        source: 'Campus Care Live Database'
      }
    } else {
      return {
        answer: `Complaint ID **${targetId}** was not found in active records. Please check the ticket number (e.g., CMP-1001) or visit the 'My Complaints' tab.`,
        source: 'Campus Care Database Registry'
      }
    }
  }

  // 2. Greetings check
  const lower = cleanQ.toLowerCase()
  if (/^(hi|hello|hey|namaste|good morning|good afternoon|good evening|help|sup)\b/i.test(lower)) {
    return {
      answer: "Hello! I am your AI Campus Care Assistant. I can help you file maintenance requests, explain repair SLAs, provide emergency contacts, or track any ticket ID (e.g. CMP-1001). How can I assist you today?",
      source: "Campus Care AI Assistant"
    }
  }

  // 3. Search Knowledge Base
  let bestEntry = null
  let bestScore = 0

  for (const item of CAMPUS_KNOWLEDGE_BASE) {
    let score = 0
    for (const kw of item.keywords) {
      if (lower.includes(kw)) {
        score += kw.split(' ').length * 3
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestEntry = item
    }
  }

  if (bestEntry && bestScore > 0) {
    return {
      answer: bestEntry.content,
      source: bestEntry.source
    }
  }

  // 4. Default helpful fallback
  return {
    answer: "I am here to assist with all campus maintenance questions. You can ask me:\n• **How to submit a complaint**\n• **Repair SLAs & expected resolution times**\n• **Emergency safety contacts**\n• **Tracking a ticket** (type CMP ID like CMP-1001)\n• **Electrical, Plumbing, Civil, or Wi-Fi network issues**.",
    source: "Campus Care AI Knowledge System"
  }
}
