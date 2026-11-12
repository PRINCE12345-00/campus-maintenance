import { ArrowRight, Building2, CheckCircle2, ClipboardList, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import campusPhoto from '../../pictures/background.jpeg'
import universityLogo from '../../pictures/logo.jpeg'
import './LandingPage.css'

const features = [
  {
    icon: ClipboardList,
    title: 'Complaint Management',
    description: 'Students can report maintenance, cleaning, network, and infrastructure issues through a simple digital workflow.',
  },
  {
    icon: ShieldCheck,
    title: 'Permission Management',
    description: 'Apply for educational and cultural events with approval flows built for academic coordination.',
  },
  {
    icon: Sparkles,
    title: 'Smart Analytics',
    description: 'Track recurring campus issues and get mock AI-driven predictions for maintenance planning.',
  },
]

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="landing-nav landing-shell" aria-label="Main navigation">
          <Link to="/" className="landing-brand" aria-label="DCRUST Smart Campus home">
            <img src={universityLogo} alt="DCRUST university logo" />
            <span className="landing-brand-copy">
              <span>DCRUST</span>
              <strong>Smart Campus</strong>
            </span>
          </Link>

          <div className="landing-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="landing-actions">
            <Link to="/login" className="landing-button landing-button-quiet">Login</Link>
            <Link to="/register" className="landing-button landing-button-primary">Register</Link>
          </div>
        </nav>
      </header>

      <main>
        <section className="landing-hero" style={{ backgroundImage: `url(${campusPhoto})` }}>
          <div className="landing-hero-inner landing-shell">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow"><Building2 size={15} /> Smart Campus Management System</p>
              <h1>Smarter campus operations for a <span>future-ready university.</span></h1>
              <p className="landing-hero-description">
                A central place for DCRUST students and staff to manage campus complaints, permission requests, notifications, and service updates.
              </p>
              <div className="landing-hero-actions">
                <Link to="/login" className="landing-button landing-button-primary">Explore the portal <ArrowRight size={17} /></Link>
                <Link to="/register" className="landing-button landing-button-quiet">Student registration</Link>
              </div>
              <div className="landing-trust" aria-label="Portal benefits">
                <span><CheckCircle2 size={15} /> Clear request tracking</span>
                <span><CheckCircle2 size={15} /> Student and staff workflows</span>
              </div>
            </div>

            <aside className="campus-card" aria-label="Illustrative campus dashboard preview">
              <div className="campus-card-inner">
                <div className="campus-card-heading">
                  <div>
                    <p className="campus-card-kicker">Demo preview</p>
                    <h2 className="campus-card-title">Campus overview</h2>
                  </div>
                  <span className="campus-live">Sample data</span>
                </div>

                <div className="campus-metric">
                  <div className="campus-card-label"><span>Complaints resolved</span><strong>78%</strong></div>
                  <div className="campus-progress" aria-label="Sample complaint resolution 78 percent"><span style={{ width: '78%' }} /></div>
                </div>
                <div className="campus-metric campus-metric-blue">
                  <div className="campus-card-label"><span>Permission approvals</span><strong>89%</strong></div>
                  <div className="campus-progress" aria-label="Sample permission approvals 89 percent"><span style={{ width: '89%' }} /></div>
                </div>

                <div className="campus-stat-grid">
                  <div className="campus-stat"><span className="campus-stat-label">Open issues</span><strong className="campus-stat-value">28</strong></div>
                  <div className="campus-stat"><span className="campus-stat-label">Pending reviews</span><strong className="campus-stat-value">12</strong></div>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="features" className="landing-section landing-shell">
          <div className="landing-section-heading">
            <p>Built for campus life</p>
            <h2>Everyday campus services, in one place</h2>
            <span>Simple tools help students submit requests and help university teams keep work moving.</span>
          </div>

          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, description }) => (
              <article key={title} className="landing-feature">
                <div className="landing-feature-icon"><Icon size={22} aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="about" className="landing-about">
          <div className="landing-about-inner landing-shell landing-section">
            <div className="landing-about-copy">
              <p>Designed around your campus</p>
              <h2>A clearer connection between students and university teams.</h2>
              <p>
                The Smart Campus portal brings common campus requests into a more organized digital workflow. Students can follow progress, while university teams can review requests and share updates in one place.
              </p>
            </div>

            <div className="landing-about-panel">
              <div className="landing-about-grid">
                <div className="landing-about-stat"><span>Complaint tracking</span><strong>From report to resolution</strong></div>
                <div className="landing-about-stat"><span>Campus permissions</span><strong>Requests and reviews</strong></div>
                <div className="landing-about-stat"><span>Role-based access</span><strong>Workflows by responsibility</strong></div>
                <div className="landing-about-stat"><span>Service updates</span><strong>Progress in one place</strong></div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="landing-footer">
        <div className="landing-footer-inner landing-shell">
          <p>© 2026 DCRUST Smart Campus Management System</p>
          <div className="landing-footer-links">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
