import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Building2, CheckCircle2, ClipboardCheck, Droplets, FlaskConical, Gauge, Lightbulb, Menu, MonitorCog, ShieldCheck, Sparkles, SprayCan, Wrench, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import campusPhoto from '../../pictures/background.jpeg'
import logo from '../../pictures/logo.jpeg'
import { complaintsApi, permissionsApi } from '../services/api'
import './LandingPagePremium.css'

const services = [
  { icon: Lightbulb, title: 'Electrical maintenance', description: 'Lighting, power, and electrical infrastructure issues.' },
  { icon: Droplets, title: 'Plumbing', description: 'Water supply, drainage, and plumbing concerns.' },
  { icon: Building2, title: 'Classroom upkeep', description: 'Report classroom fixtures and building maintenance needs.' },
  { icon: ShieldCheck, title: 'Hostel facilities', description: 'Keep residential facilities safe, clean, and functional.' },
  { icon: FlaskConical, title: 'Laboratories', description: 'Raise issues affecting campus labs and learning spaces.' },
  { icon: SprayCan, title: 'Cleaning & sanitation', description: 'Help maintain clean, welcoming shared spaces.' },
  { icon: MonitorCog, title: 'Internet & technology', description: 'Get campus network and technical issues to the right team.' },
  { icon: Wrench, title: 'General campus issues', description: 'One place to report other maintenance concerns.' },
]

const steps = [
  { icon: ClipboardCheck, title: 'Report an issue', description: 'Share the location and details through a simple request form.' },
  { icon: Gauge, title: 'Request is reviewed', description: 'The responsible campus team reviews and routes the request.' },
  { icon: Wrench, title: 'Team takes action', description: 'Progress updates keep everyone informed as work moves ahead.' },
  { icon: CheckCircle2, title: 'Issue resolved', description: 'Follow the request through to its final status.' },
]

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [metrics, setMetrics] = useState(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let active = true
    Promise.allSettled([complaintsApi.getAll(), permissionsApi.getAll()]).then(([complaintsResult, permissionsResult]) => {
      if (!active) return
      const complaintList = complaintsResult.status === 'fulfilled' && Array.isArray(complaintsResult.value.data) ? complaintsResult.value.data : null
      const permissionList = permissionsResult.status === 'fulfilled' && Array.isArray(permissionsResult.value.data) ? permissionsResult.value.data : null
      if (!complaintList && !permissionList) return
      const resolved = complaintList?.filter((item) => ['Resolved', 'Closed'].includes(item.status)).length
      const pendingComplaints = complaintList?.filter((item) => ['Submitted', 'Assigned', 'In Progress'].includes(item.status)).length || 0
      const pendingPermissions = permissionList?.filter((item) => ['Pending Approval', 'Under Review', 'Changes Requested'].includes(item.status)).length || 0
      setMetrics({
        complaints: complaintList?.length ?? null,
        resolved: resolved ?? null,
        pending: complaintList || permissionList ? pendingComplaints + pendingPermissions : null,
      })
    })
    return () => { active = false }
  }, [])

  const handlePointerMove = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`)
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`)
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="landing-page" onPointerMove={handlePointerMove}>
      <header className={`landing-header${scrolled ? ' is-scrolled' : ''}`}>
        <nav className="landing-nav landing-shell" aria-label="Main navigation">
          <Link to="/" className="landing-brand" aria-label="Campus Maintenance home" onClick={closeMenu}>
            <img src={logo} alt="Campus Maintenance logo" />
            <div className="landing-brand-copy">
              <span>CAMPUS CARE</span>
              <strong>Maintenance</strong>
            </div>
          </Link>

          <button type="button" className="landing-menu-toggle" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <div className={`landing-menu${menuOpen ? ' is-open' : ''}`}>
            <div className="landing-links">
              <a href="#home" onClick={closeMenu}>Home</a>
              <a href="#about" onClick={closeMenu}>About</a>
              <a href="#services" onClick={closeMenu}>Services</a>
              <a href="#how-it-works" onClick={closeMenu}>How it works</a>
              <Link to="/login" onClick={closeMenu}>Dashboard</Link>
              <a href="#contact" onClick={closeMenu}>Contact</a>
            </div>

            <div className="landing-actions">
              <Link to="/login" className="landing-button landing-button-quiet" onClick={closeMenu}>Login</Link>
              <Link to="/register" className="landing-button landing-button-primary" onClick={closeMenu}>Register <ArrowRight size={15} /></Link>
            </div>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="landing-hero">
          <div className="landing-hero-background" style={{ backgroundImage: `url(${campusPhoto})` }} aria-hidden="true" />
          <div className="landing-hero-inner landing-shell">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow">
                <Sparkles size={15} /> CAMPUS MAINTENANCE, REIMAGINED
              </p>
              <motion.h1 initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
                SMART CAMPUS.<br /><span>BETTER LIVING.</span>
              </motion.h1>
              <p className="landing-hero-description">
                Making campus maintenance smarter, faster and more transparent. Report issues, track progress and keep your campus running smoothly.
              </p>
              <div className="landing-hero-actions">
                <Link to="/login" className="landing-button landing-button-primary">Report an issue <ArrowRight size={17} /></Link>
                <a href="#services" className="landing-button landing-button-quiet">Explore platform <ArrowDown size={16} /></a>
              </div>
              <div className="landing-trust" aria-label="Portal benefits">
                <span><CheckCircle2 size={15} /> Transparent request tracking</span>
                <span><CheckCircle2 size={15} /> Built around campus needs</span>
              </div>
            </div>

            <motion.aside className="campus-card" aria-label="Campus maintenance workflow preview" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>
              <div className="campus-card-inner">
                <div className="campus-card-heading">
                  <div>
                    <p className="campus-card-kicker">A clearer process</p>
                    <h2 className="campus-card-title">Every request, moving forward</h2>
                  </div>
                  <span className="campus-live">TRACKED</span>
                </div>

                <div className="workflow-preview">
                  {steps.map(({ icon: Icon, title }, index) => (
                    <div className={`workflow-preview-step${index === 0 ? ' is-current' : ''}`} key={title}>
                      <span className="workflow-preview-icon"><Icon size={17} /></span>
                      <span>{title}</span>
                      {index < steps.length - 1 && <span className="workflow-preview-line" aria-hidden="true" />}
                    </div>
                  ))}
                </div>
                <div className="campus-card-note">
                  <span className="campus-note-pulse" />
                  <p>One connected place for campus requests and updates.</p>
                </div>
              </div>
            </motion.aside>
          </div>
          <a className="hero-scroll-cue" href="#about" aria-label="Scroll to learn about the platform"><span />Scroll to explore</a>
        </section>

        <section id="about" className="landing-about landing-section landing-shell">
          <motion.div className="landing-about-copy" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
            <p className="section-kicker">A campus that works better</p>
            <h2>Less chasing updates.<br /><span>More getting things done.</span></h2>
            <p>Campus Maintenance brings everyday service requests into one clear, accountable workflow. Students can report issues and follow progress, while university teams can review requests and coordinate the next steps.</p>
            <Link to="/login" className="text-link">See your campus workspace <ArrowRight size={16} /></Link>
          </motion.div>
          <motion.div className="about-visual" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }}>
            <div className="about-orbit about-orbit-one" />
            <div className="about-orbit about-orbit-two" />
            <div className="about-visual-mark"><Building2 size={36} /></div>
            <div className="about-chip about-chip-top"><CheckCircle2 size={16} /> Clear ownership</div>
            <div className="about-chip about-chip-bottom"><ShieldCheck size={16} /> Role-based workflows</div>
          </motion.div>
        </section>

        <section id="services" className="landing-services landing-section">
          <div className="landing-shell">
            <motion.div className="landing-section-heading" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
              <p className="section-kicker">One platform, many campus needs</p>
              <h2>Support for the spaces<br /><span>that make campus life.</span></h2>
              <p>From a flickering light to a network issue, get the right campus concern into a trackable workflow.</p>
            </motion.div>
            <div className="landing-service-grid">
              {services.map(({ icon: Icon, title, description }, index) => (
                <motion.article key={title} className="landing-service-card" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} transition={{ delay: (index % 4) * 0.06 }}>
                  <div className="service-icon"><Icon size={21} /></div>
                  <span className="service-index">0{index + 1}</span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="service-card-arrow"><ArrowRight size={16} /></span>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="landing-process landing-section landing-shell">
          <motion.div className="landing-section-heading" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <p className="section-kicker">Simple from start to finish</p>
            <h2>A better route from<br /><span>report to resolution.</span></h2>
          </motion.div>
          <div className="process-steps">
            {steps.map(({ icon: Icon, title, description }, index) => (
              <motion.article className="process-step" key={title} variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} transition={{ delay: index * 0.08 }}>
                <div className="process-step-top"><span className="process-step-number">0{index + 1}</span><span className="process-step-icon"><Icon size={21} /></span></div>
                <h3>{title}</h3>
                <p>{description}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="landing-live-section">
          <div className="landing-shell landing-live-inner">
            <div className="live-copy">
              <p className="section-kicker">Campus, at a glance</p>
              <h2>Real requests.<br /><span>Visible progress.</span></h2>
              <p>Live totals are drawn from the existing campus service records. No sample numbers, no guesswork.</p>
            </div>
            <div className="live-metrics" aria-live="polite">
              <div className="live-metric"><span>Total complaints</span><strong>{metrics?.complaints ?? '—'}</strong><small>Live records</small></div>
              <div className="live-metric"><span>Resolved issues</span><strong>{metrics?.resolved ?? '—'}</strong><small>Resolved or closed</small></div>
              <div className="live-metric"><span>Pending requests</span><strong>{metrics?.pending ?? '—'}</strong><small>Complaints and permissions</small></div>
              <div className="live-metric"><span>Active maintenance staff</span><strong>—</strong><small>Not available from the current API</small></div>
            </div>
          </div>
        </section>

        <section className="landing-cta landing-shell">
          <motion.div className="landing-cta-card" variants={reveal} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <div>
              <p className="section-kicker">A smoother campus starts here</p>
              <h2>See something that needs attention?</h2>
              <p>Sign in to report an issue and keep track of what happens next.</p>
            </div>
            <Link to="/login" className="landing-button landing-button-primary">Open campus portal <ArrowRight size={17} /></Link>
          </motion.div>
        </section>
      </main>

      <footer id="contact" className="landing-footer">
        <div className="landing-footer-main landing-shell">
          <div className="footer-brand-block">
            <Link to="/" className="landing-brand" aria-label="Campus Maintenance home">
              <img src={logo} alt="" />
              <div className="landing-brand-copy"><span>CAMPUS CARE</span><strong>Maintenance</strong></div>
            </Link>
            <p>A clearer, more connected way to care for campus spaces.</p>
          </div>
          <div className="footer-column"><h3>Explore</h3><a href="#about">About</a><a href="#services">Services</a><a href="#how-it-works">How it works</a></div>
          <div className="footer-column"><h3>Campus portal</h3><Link to="/login">Dashboard login</Link><Link to="/register">Create an account</Link><Link to="/login">Report an issue</Link></div>
          <div className="footer-column"><h3>Services</h3><a href="#services">Facilities & maintenance</a><a href="#services">Technology support</a><a href="#services">Campus requests</a></div>
        </div>
        <div className="landing-footer-bottom landing-shell"><span>© {new Date().getFullYear()} Campus Maintenance</span><a href="#home">Back to top ↑</a><span>Designed for a better campus experience</span></div>
      </footer>
    </div>
  )
}
