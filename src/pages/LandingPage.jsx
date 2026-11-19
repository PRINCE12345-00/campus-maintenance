import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Building2, CheckCircle2, ClipboardCheck, Droplets, FlaskConical, Gauge, Lightbulb, Mail, MapPin, Menu, MonitorCog, Phone, Send, ShieldCheck, Sparkles, SprayCan, Wrench, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import campusPhoto from '../../pictures/background.jpeg'
import campusPhotoTwo from '../../pictures/background2.jpeg'
import campusPhotoThree from '../../pictures/background3.jpeg'
import campusPhotoFour from '../../pictures/background4jpeg?url'
import campusPhotoFive from '../../pictures/background5.jpeg'
import campusPhotoSix from '../../pictures/background6.jpeg'
import logo from '../../pictures/logo.jpeg'
import { complaintsApi, newsletterApi, permissionsApi } from '../services/api'
import './LandingPagePremium.css'

function YoutubeIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  )
}

function LinkedinIcon({ size = 15, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  )
}

function XIcon({ size = 13, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function InstagramIcon({ size = 15, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function WhatsAppIcon({ size = 14, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a7.89 7.89 0 0 1-1.21-4.38c0-4.36 3.55-7.91 7.91-7.91 2.11 0 4.09.82 5.58 2.31 1.49 1.49 2.31 3.47 2.31 5.58 0 4.36-3.55 7.91-7.9 7.91zm4.33-5.92c-.24-.12-1.4-.69-1.62-.77-.22-.08-.37-.12-.53.12-.16.24-.61.77-.75.93-.14.16-.28.18-.51.06-.24-.12-1-.37-1.9-1.18-.7-.62-1.17-1.39-1.31-1.63-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.53-1.27-.72-1.74-.19-.46-.38-.4-.53-.41h-.45c-.16 0-.41.06-.63.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.59 4.12 3.63.58.25 1.02.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.4-.57 1.6-1.13.2-.55.2-1.02.14-1.13-.06-.1-.2-.16-.44-.28z" />
    </svg>
  )
}



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

const heroTitleFirstLine = 'SMART CAMPUS.'
const heroTitleSecondLine = 'BETTER LIVING.'
const heroTitleLength = heroTitleFirstLine.length + heroTitleSecondLine.length
const heroBackgrounds = [campusPhoto, campusPhotoTwo, campusPhotoThree, campusPhotoFour, campusPhotoFive, campusPhotoSix]

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [metrics, setMetrics] = useState(null)
  const [typedTitleLength, setTypedTitleLength] = useState(0)
  const [activeBackground, setActiveBackground] = useState(0)
  const [devContactOpen, setDevContactOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterMessage, setNewsletterMessage] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined

    const backgroundTimer = window.setInterval(() => {
      setActiveBackground((index) => (index + 1) % heroBackgrounds.length)
    }, 8000)
    return () => window.clearInterval(backgroundTimer)
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTypedTitleLength(heroTitleLength)
      return undefined
    }

    if (typedTitleLength >= heroTitleLength) return undefined

    const delay = typedTitleLength === 0 ? 350 : 95
    const typingTimer = window.setTimeout(() => {
      setTypedTitleLength((length) => Math.min(length + 1, heroTitleLength))
    }, delay)

    return () => window.clearTimeout(typingTimer)
  }, [typedTitleLength])
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault()
    setNewsletterLoading(true)
    setNewsletterMessage('')
    try {
      const { data } = await newsletterApi.subscribe(newsletterEmail.trim())
      setNewsletterMessage(data.message || 'Thank you for subscribing!')
      setNewsletterEmail('')
    } catch (error) {
      setNewsletterMessage(error?.response?.data?.message || 'Could not subscribe right now. Please try again later.')
    } finally {
      setNewsletterLoading(false)
    }
  }

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
          {heroBackgrounds.map((image, index) => (
            <div
              key={image}
              className={`landing-hero-background${index === activeBackground ? ' is-active' : ''}`}
              style={{ backgroundImage: `url(${image})` }}
              aria-hidden="true"
            />
          ))}
          <div className="landing-cloud-drift" aria-hidden="true">
            <span className="landing-cloud landing-cloud-one" />
            <span className="landing-cloud landing-cloud-two" />
          </div>
          <div className="landing-hero-inner landing-shell">
            <div className="landing-hero-copy">
              <p className="landing-eyebrow">
                <Sparkles size={15} /> CAMPUS MAINTENANCE, REIMAGINED
              </p>
              <motion.h1 aria-label={`${heroTitleFirstLine} ${heroTitleSecondLine}`} initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75 }}>
                <span className="landing-typing-text" aria-hidden="true">
                  {heroTitleFirstLine.slice(0, typedTitleLength)}
                  <br />
                  <span>{heroTitleSecondLine.slice(0, Math.max(0, typedTitleLength - heroTitleFirstLine.length))}
                  </span>
                </span>
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
        <div className="landing-shell landing-footer-shell">
          <div className="landing-footer-grid">
            {/* Column 1: Brand Info */}
            <div className="footer-col footer-col-brand">
              <div className="footer-brand-header">
                <div className="footer-brand-logo-wrap">
                  <img src={logo} alt="DCRUST Logo" className="footer-brand-logo" />
                </div>
                <div className="footer-brand-title">
                  <span className="brand-name-main">DCRUST</span>
                  <span className="brand-name-sub">Smart Campus</span>
                  <span className="brand-tagline">Connect • Manage • Grow</span>
                </div>
              </div>
              <p className="footer-brand-desc">
                A smart, secure and efficient campus management platform for a <span className="highlight-text">better</span> academic experience.
              </p>
              <div className="footer-social-row">
                <a href="https://www.youtube.com/watch?v=JN2Y74xvOSg" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="YouTube">
                  <YoutubeIcon size={16} />
                </a>
                <a href="https://www.linkedin.com/company/dcrustm/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
                  <LinkedinIcon size={15} />
                </a>
                <a href="https://x.com/MurthalDcrust?lang=en" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="X (Twitter)">
                  <XIcon size={13} />
                </a>
                <a href="https://www.instagram.com/dcrustnews/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                  <InstagramIcon size={15} />
                </a>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="footer-col">
              <h3 className="footer-col-heading">Quick Links</h3>
              <div className="footer-heading-bar" />
              <ul className="footer-links-list">
                <li><a href="https://www.dcrustm.ac.in/" target="_blank" rel="noopener noreferrer"><span className="link-chevron">&gt;</span> About DCRUST</a></li>
                <li><a href="#contact"><span className="link-chevron">&gt;</span> Contact Us</a></li>
                <li><a href="#services"><span className="link-chevron">&gt;</span> Help &amp; Support</a></li>
                <li><a href="#how-it-works"><span className="link-chevron">&gt;</span> FAQs</a></li>
                <li><a href="#about"><span className="link-chevron">&gt;</span> Terms &amp; Conditions</a></li>
                <li><a href="#about"><span className="link-chevron">&gt;</span> Privacy Policy</a></li>
              </ul>
            </div>

            {/* Column 3: Our Services */}
            <div className="footer-col">
              <h3 className="footer-col-heading">Our Services</h3>
              <div className="footer-heading-bar" />
              <ul className="footer-links-list">
                <li><a href="#services"><span className="link-chevron">&gt;</span> Campus Management</a></li>
                <li><a href="#services"><span className="link-chevron">&gt;</span> Student Services</a></li>
                <li><Link to="/login" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}><span className="link-chevron">&gt;</span> Complaint Portal</Link></li>
                <li><Link to="/login" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}><span className="link-chevron">&gt;</span> Permission Requests</Link></li>
                <li><Link to="/login" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}><span className="link-chevron">&gt;</span> Notifications</Link></li>
                <li><Link to="/login" onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}><span className="link-chevron">&gt;</span> Analytics Dashboard</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact Us */}
            <div className="footer-col footer-col-contact">
              <h3 className="footer-col-heading">Contact Us</h3>
              <div className="footer-heading-bar" />
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <MapPin size={18} className="footer-contact-icon" />
                  <div className="footer-contact-text">
                    <span>DCRUST, Murthal</span>
                    <span>(Sonepat), Haryana</span>
                  </div>
                </div>
                <div className="footer-contact-item">
                  <Phone size={18} className="footer-contact-icon" />
                  <a href="tel:01302484005" className="footer-contact-link">0130-2484005</a>
                </div>
                <div className="footer-contact-item">
                  <Mail size={18} className="footer-contact-icon" />
                  <a href="mailto:support@dcrust.ac.in" className="footer-contact-link">support@dcrust.ac.in</a>
                </div>
              </div>
            </div>

            {/* Column 5: Stay Updated Card */}
            <div className="footer-col footer-col-newsletter">
              <div className="newsletter-card">
                <div className="newsletter-header">
                  <Send size={18} className="newsletter-icon" />
                  <h3>Stay Updated</h3>
                </div>
                <p className="newsletter-desc">
                  Get the latest updates from DCRUST Smart Campus.
                </p>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    disabled={newsletterLoading}
                    className="newsletter-input"
                  />
                  <button type="submit" className="newsletter-submit-btn" aria-label="Subscribe to updates" disabled={newsletterLoading}>
                    {newsletterLoading ? '…' : <ArrowRight size={17} />}
                  </button>
                </form>
                {newsletterMessage && <p className="newsletter-status-msg" role="status">{newsletterMessage}</p>}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="footer-bottom-bar">
            <div className="footer-bottom-copy">
              &copy; 2026 <strong>DCRUST Smart Campus</strong>. All Rights Reserved.
            </div>
            <div className="footer-bottom-divider" aria-hidden="true" />
            <div className="footer-bottom-center">
              <div
                className="developer-contact-wrapper"
                onMouseEnter={() => setDevContactOpen(true)}
                onMouseLeave={() => setDevContactOpen(false)}
                onClick={() => setDevContactOpen((prev) => !prev)}
              >
                <button
                  type="button"
                  className="developer-contact-link"
                  aria-expanded={devContactOpen}
                  aria-haspopup="dialog"
                >
                  Developer Contact
                </button>

                <div className={`developer-popover ${devContactOpen ? 'is-visible' : ''}`} role="tooltip">
                  <div className="dev-popover-header">
                    <h4>Developer Contact</h4>
                  </div>
                  <div className="dev-popover-body">
                    <div className="dev-card-item">
                      <div className="dev-name">Pankaj Kumar</div>
                      <div className="dev-branch">B.Tech CSE: 2023-27</div>
                      <div className="dev-mob">
                        Mob: <a href="https://wa.me/919306817255?text=Hello%20Pankaj%2C%20I%20have%20an%20issue%20regarding%20the%20Campus%20Maintenance%20Portal." target="_blank" rel="noopener noreferrer" className="dev-whatsapp-link" title="Chat with Pankaj on WhatsApp">
                          +91 9306817255
                          <WhatsAppIcon size={14} className="whatsapp-icon" />
                        </a>
                      </div>
                    </div>

                    <div className="dev-card-item">
                      <div className="dev-name">Prince</div>
                      <div className="dev-branch">B.Tech CSE: 2023-27</div>
                      <div className="dev-mob">
                        Mob: <a href="https://wa.me/918307676381?text=Hello%20Prince%2C%20I%20have%20an%20issue%20regarding%20the%20Campus%20Maintenance%20Portal." target="_blank" rel="noopener noreferrer" className="dev-whatsapp-link" title="Chat with Prince on WhatsApp">
                          +91 8307676381
                          <WhatsAppIcon size={14} className="whatsapp-icon" />
                        </a>
                      </div>
                    </div>

                    <div className="dev-card-item">
                      <div className="dev-name">MD Raza</div>
                      <div className="dev-branch">B.Tech CSE: 2024-27</div>
                      <div className="dev-mob">
                        Mob: <a href="https://wa.me/917562950586?text=Hello%20MD%20Raza%2C%20I%20have%20an%20issue%20regarding%20the%20Campus%20Maintenance%20Portal." target="_blank" rel="noopener noreferrer" className="dev-whatsapp-link" title="Chat with MD Raza on WhatsApp">
                          +91 7562950586
                          <WhatsAppIcon size={14} className="whatsapp-icon" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="footer-bottom-divider" aria-hidden="true" />
            <div className="footer-bottom-follow">
              <span className="follow-label">Follow Us:</span>
              <div className="footer-social-row footer-social-mini">
                <a href="https://www.youtube.com/watch?v=JN2Y74xvOSg" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="YouTube">
                  <YoutubeIcon size={14} />
                </a>
                <a href="https://www.linkedin.com/company/dcrustm/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
                  <LinkedinIcon size={13} />
                </a>
                <a href="https://x.com/MurthalDcrust?lang=en" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="X (Twitter)">
                  <XIcon size={12} />
                </a>
                <a href="https://www.instagram.com/dcrustnews/" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
                  <InstagramIcon size={13} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
