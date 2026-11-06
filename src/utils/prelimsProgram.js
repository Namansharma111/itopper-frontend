import { getApiUrl } from '../config/api';
import axios from 'axios';

export const defaultProgram = {
  title: 'iTopper Prelims PLUS 2027',
  tagline: 'Every PYQ Has a Lesson: Patterns, Logic, Understanding & Strategy',
  description: '150 interactive daily classes covering conceptually dense areas in depth, with concise thematic workbooks. Learn to solve questions through conceptual logic and theme-wise PYQ analysis.',
  startDate: '2026-11-16', timings: '2:00 PM – 5:00 PM (Daily)', format: 'Hybrid', totalClasses: 150,
  onlinePrice: 4999, onlineMrp: 14999, offlinePrice: 9999, offlineMrp: 24999,
  brochure: '/programs/itopper_prelims_plus_2027_course.pdf', image: '',
  enrollmentUrl: '/#contact', phone: '',
  facultyName: 'Amit Sir', facultyBio: 'Geography, Environment, Disaster Management & Ethics (GS-I, III, IV)', facultyImage: '/images/Amit Kumar.jpeg',
  features: [
    'Comprehensive Coverage: 150 interactive daily classes covering conceptually dense areas in depth with concise thematic workbooks.',
    'Theme-Wise PYQ Analysis: Subjects are divided into distinct themes so every PYQ from the past 10 years is analyzed and solved in the same session.',
    'Thematic Discussion Framework: Deconstruct PYQs asked, examiner traps and repeated conceptual threads; then discuss probable questions from the same theme.',
    '“Can’t Skip” Content: Non-negotiable facts and core concepts that must be mastered, even where UPSC has not yet asked a question.',
    'Skill-First Problem Solving: Brainstorm questions and deduce the right option using conceptual logic rather than memory alone.'
  ],
  questionTypes: ['Fact-Based', 'Concept-Based', 'Assertion-Reason Type', 'Inference Type', 'Statement Based', 'Match 2 & 3 Column', 'Other Probable Topics'],
  subjects: ['Geography', 'Environment', 'Disaster Management', 'Ethics'], sessions: [],
  faqs: [
    { question: 'When does Prelims PLUS 2027 start?', answer: 'The program starts on 16 November 2026. Daily class timings are 2:00 PM to 5:00 PM.' },
    { question: 'Is the course online or offline?', answer: 'The program is hybrid, with an online batch and an offline batch at the ORN Center.' },
    { question: 'How many classes are included?', answer: 'The course includes 150 interactive daily classes and concise thematic workbooks.' },
    { question: 'How are previous year questions covered?', answer: 'PYQs from the past 10 years are analyzed theme by theme, followed by probable questions, examiner traps and conceptual problem solving.' }
  ]
};
export const safeProgramLink = value => typeof value === 'string' && (/^https?:\/\//i.test(value) || /^\/(?!\/)/.test(value)) ? value : '';
export const prelimsPurchasePlan = (program, batch) => ({
  id: `prelims-plus-2027-${batch}`,
  title: `${program.title} — ${batch === 'online' ? 'Online Batch' : 'Offline Batch (ORN Center)'}`,
  category: 'Prelims', batch,
  paperTag: batch === 'online' ? 'Prelims • Online' : 'Prelims • Offline ORN',
  finalPrice: batch === 'online' ? program.onlinePrice : program.offlinePrice,
  duration: `${program.totalClasses} classes`,
  description: program.description, sessions: program.sessions || [],
  timings: program.timings, planPdf: program.brochure, planPdfTitle: 'Prelims PLUS Course Brochure',
});
export async function loadPrelimsPurchases() {
  const { data } = await axios.get(getApiUrl('/api/prelims-program/purchases'), { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } });
  const program = { ...defaultProgram, ...(data.program || {}) };
  return (data.enrollments || []).map(enrollment => ({
    ...prelimsPurchasePlan(program, enrollment.courseId.endsWith('-offline') ? 'offline' : 'online'),
    purchasedAt: enrollment.createdAt, receiptId: enrollment.paymentId,
    finalPaid: enrollment.pricePaid, enrollmentId: enrollment._id
  }));
}
export async function loadPrelimsProgram() {
  const response = await fetch(getApiUrl('/api/prelims-program'));
  if (!response.ok) throw new Error('Program could not be loaded. Please try again.');
  return { ...defaultProgram, ...(await response.json() || {}) };
}
export async function savePrelimsProgram(data) {
  const response = await fetch(getApiUrl('/api/prelims-program'), { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') || ''}` }, body: JSON.stringify(data) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || 'Program could not be saved');
  return result;
}
