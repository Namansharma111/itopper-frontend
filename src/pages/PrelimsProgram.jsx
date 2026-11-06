import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import EvaluationCheckoutModal from '../components/EvaluationCheckoutModal';
import { launchRazorpayCheckout } from '../utils/razorpay';
import { BookOpen, CalendarDays, Clock, PlayCircle, ArrowUpRight, Download, CheckCircle2, GraduationCap } from 'lucide-react';
import Navbar from '../components/Navigation';
import Footer from '../components/Footer';
import { defaultProgram, loadPrelimsProgram, safeProgramLink, prelimsPurchasePlan } from '../utils/prelimsProgram';
import './PrelimsProgram.css';

const dateLabel = value => value ? new Date(`${value}T12:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date to be announced';
const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`;
function Resource({ session }) {
  const link = safeProgramLink(session.link);
  return <div className="pp-resource"><span className="pp-icon"><PlayCircle size={21}/></span><div><strong>{session.title}</strong><p>{session.subject} {session.date && ` • ${dateLabel(session.date)}`} {session.time && ` • ${session.time} IST`} {session.duration && ` • ${session.duration}`}</p>{session.note && <p>{session.note}</p>}</div>{link ? <a className="pp-button pp-small" href={link} target="_blank" rel="noopener noreferrer">{session.isDemo ? 'Watch demo' : 'Open class'} <ArrowUpRight size={13}/></a> : <span className="pp-muted">Link coming soon</span>}</div>;
}
export default function PrelimsProgram() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const paymentBusy = useRef(false);
  const [paying, setPaying] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [program, setProgram] = useState(defaultProgram);
  const [error, setError] = useState('');
  const [subject, setSubject] = useState('All classes');
  const [day, setDay] = useState('');
  const [batch, setBatch] = useState('online');
  useEffect(() => { let active = true; loadPrelimsProgram().then(data => { if (active) setProgram(data); }).catch(() => { if (active) setError('Showing the course brochure details. Live class updates are temporarily unavailable.'); }); return () => { active = false; }; }, []);
  const sessions = program.sessions || [];
  const dates = [...new Set(sessions.filter(s => s.date).map(s => s.date))].sort();
  const price = batch === 'online' ? program.onlinePrice : program.offlinePrice;
  const mrp = batch === 'online' ? program.onlineMrp : program.offlineMrp;
  const subscribe = () => {
    if (paymentBusy.current) return;
    const plan = prelimsPurchasePlan(program, batch);
    setPaymentError('');
    if (!user) { setCheckoutPlan(plan); return; }
    paymentBusy.current = true; setPaying(true);
    const release = () => { paymentBusy.current = false; setPaying(false); };
    launchRazorpayCheckout({ item: plan, user, amount: plan.finalPrice,
      onSuccess: paymentId => { release(); navigate(`/payment-success?txnid=${encodeURIComponent(paymentId)}`); },
      onError: message => { release(); setPaymentError(String(message || 'Unable to open payment. Please try again.')); },
      onCancel: release
    });
  };
  return <><Navbar theme="light"/><div className="prelims-page">
    <div className="pp-heading"><div className="pp-container"><p className="pp-eyebrow">ITOPPER ACADEMY • NEW DELHI</p><h1>{program.title}</h1><p>Patterns. Logic. Understanding. Strategy.</p></div></div>
    <nav className="pp-tabs" aria-label="Course sections">{[['overview','Overview'],['schedule','Class schedule'],['curriculum','Course plan'],['demo','Demo resources'],['faculty','Faculty'],['faq','FAQ']].map(([id,label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>
    <main className="pp-container pp-main">
      {error && <p role="status" className="pp-notice">{error}</p>}
      {paymentError && <p role="alert" className="pp-notice">{paymentError} <a href="/my-courses" className="underline">Open My Courses</a></p>}
      <section id="overview" className="pp-hero">
        <div className="pp-poster">{safeProgramLink(program.image) ? <img src={program.image} alt={program.title}/> : <><img className="pp-poster-logo" src="/images/itopper.png" alt="iTopper Academy"/><span>PRELIMS PLUS</span><b>2027</b><p>Every PYQ Has a Lesson</p><div>150 CLASSES • HYBRID</div><small>WITH {program.facultyName.toUpperCase()}</small></>}</div>
        <div className="pp-hero-content"><span className="pp-badge">UPSC CSE • {program.format}</span><h2>{program.title}</h2><p className="pp-tagline">{program.tagline}</p><p>{program.description}</p><div className="pp-facts"><span><CalendarDays size={16}/>{dateLabel(program.startDate)}</span><span><Clock size={16}/>{program.timings}</span><span><BookOpen size={16}/>{program.totalClasses} classes</span></div><div className="pp-batches"><button className={batch === 'online' ? 'selected' : ''} onClick={() => setBatch('online')}>Online batch</button><button className={batch === 'offline' ? 'selected' : ''} onClick={() => setBatch('offline')}>Offline • ORN Center</button></div><div className="pp-price"><strong>{money(price)}</strong><del>{money(mrp)}</del>{mrp > price && <span>Save {Math.round((1-price/mrp)*100)}%</span>}</div><div className="pp-actions"><button type="button" className="pp-button" onClick={subscribe} disabled={paying}>{paying ? "Opening payment…" : "Subscribe now"} <ArrowUpRight size={16}/></button>{safeProgramLink(program.brochure) && <a className="pp-outline" href={program.brochure} target="_blank" rel="noopener noreferrer"><Download size={16}/> Download brochure</a>}</div></div>
      </section>
      <section><h2 className="pp-section-title">The iTopper <span>Advantage</span></h2><div className="pp-advantages">{program.features.map((feature,i) => <details key={i} className={i%2 ? 'warm' : ''} open={i === 0}><summary><CheckCircle2 size={21}/>{feature.split(':')[0]}<span>+</span></summary><p>{feature.includes(':') ? feature.slice(feature.indexOf(':')+1).trim() : feature}</p></details>)}</div></section>
      <section className="pp-framework"><p className="pp-eyebrow">CORE METHODOLOGY</p><h2>One theme. Two steps to mastery.</h2><div className="pp-two"><article><span>01 / PYQs ASKED</span><h3>Understand the examiner’s thinking</h3><p>Deconstruct past question patterns, examiner traps and repeated conceptual threads.</p></article><article><span>02 / PROBABLE QUESTIONS</span><h3>Apply the concept to what comes next</h3><p>Practice forward-looking probable questions from the same theme across key UPSC formats.</p></article></div><div className="pp-chips">{program.questionTypes.map(t => <span key={t}>{t}</span>)}</div></section>
      <section id="schedule"><h2 className="pp-section-title">Day Wise Class Schedule</h2><p className="pp-muted">{program.timings} • All class times are in IST</p>{dates.length > 0 && <div className="pp-days"><button className={!day ? 'selected' : ''} onClick={() => setDay('')}>All dates</button>{dates.map(d => <button key={d} className={day === d ? 'selected' : ''} onClick={() => setDay(d)}>{dateLabel(d)}</button>)}</div>}{sessions.filter(s => !day || s.date === day).length ? sessions.filter(s => !day || s.date === day).map((s,i) => <Resource key={i} session={s}/>) : <div className="pp-empty"><CalendarDays/><div><strong>Classes begin {dateLabel(program.startDate)}</strong><p>The detailed class schedule and joining links will appear here when published.</p></div></div>}</section>
      <section id="curriculum"><h2 className="pp-section-title">Course Curriculum</h2><div className="pp-curriculum"><aside>{['All classes', ...new Set([...program.subjects, ...sessions.map(s => s.subject).filter(Boolean)])].map(s => <button key={s} className={subject === s ? 'selected' : ''} onClick={() => setSubject(s)}>{s}</button>)}</aside><div><h3>{subject === 'All classes' ? 'Theme-wise learning & PYQ discussion' : subject}</h3><p className="pp-muted">Concise thematic workbooks • Past 10 years’ PYQs • Probable questions</p>{sessions.filter(s => subject === 'All classes' || s.subject === subject).map((s,i) => <Resource key={i} session={s}/>)}{!sessions.some(s => subject === 'All classes' || s.subject === subject) && <div className="pp-empty"><BookOpen/><p>Theme-wise sessions will be published here. Explore the brochure for the course methodology.</p></div>}</div></div></section>
      <section className="pp-banner"><GraduationCap size={38}/><p className="pp-eyebrow">SKILL-FIRST PROBLEM SOLVING</p><h2>Learn the logic behind every answer.</h2><p>Concepts, patterns and practice — brought together in {program.totalClasses} interactive classes.</p><button type="button" className="pp-button" onClick={subscribe} disabled={paying}>Join {program.title} <ArrowUpRight size={16}/></button></section>
      <section id="demo"><h2 className="pp-section-title">Demo Resources</h2>{sessions.some(s => s.isDemo) ? sessions.filter(s => s.isDemo).map((s,i) => <Resource session={s} key={i}/>) : <div className="pp-empty"><PlayCircle/><p>Demo sessions will appear here once published.</p></div>}</section>
      <section id="faculty"><h2 className="pp-section-title">About the Faculty</h2><article className="pp-faculty">{safeProgramLink(program.facultyImage) && <img src={program.facultyImage} alt={program.facultyName}/>}<div><span className="pp-eyebrow">LEAD FACULTY & MENTOR</span><h3>{program.facultyName}</h3><p>{program.facultyBio}</p></div></article></section>
      <section><h2 className="pp-section-title">Schedule a Counselling Session</h2><div className="pp-counselling"><div><h3>Build your Prelims plan with us.</h3><p>Connect with iTopper Academy for batch and enrollment guidance.</p></div>{program.phone ? <a className="pp-button" href={`tel:${program.phone.replace(/[^+\d]/g,'')}`}>Call us</a> : <a className="pp-button" href="/#contact">Contact our team <ArrowUpRight size={16}/></a>}</div></section>
      <section id="faq"><h2 className="pp-section-title">Frequently Asked Questions</h2><div className="pp-faq">{program.faqs.map((faq,i) => <details key={i}><summary>{faq.question}<span>+</span></summary><p>{faq.answer}</p></details>)}</div></section>
    </main><div className="pp-purchase"><div><small>{batch === 'online' ? 'ONLINE BATCH' : 'OFFLINE • ORN CENTER'}</small><strong>{money(price)}</strong></div><span>{program.title}</span><button type="button" className="pp-button" onClick={subscribe} disabled={paying}>{paying ? "Opening payment…" : "Subscribe now"} <ArrowUpRight size={16}/></button></div>
  </div><Footer/>{checkoutPlan && <EvaluationCheckoutModal isOpen onClose={() => setCheckoutPlan(null)} plan={checkoutPlan}/>}</>;
}
