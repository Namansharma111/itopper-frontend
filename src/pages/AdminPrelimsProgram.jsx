import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { defaultProgram, loadPrelimsProgram, savePrelimsProgram } from '../utils/prelimsProgram';
import axios from 'axios';
import { getApiUrl } from '../config/api';
import PrelimsAssetField from '../components/admin/PrelimsAssetField';
import { toast } from 'react-toastify';

const inputClass = 'w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-800';
function Field({ label, value, onChange, type = 'text', multiline = false, required = false }) {
  const props = { className: inputClass, value: value ?? '', onChange: e => onChange(e.target.value), required };
  return <label className="block text-xs font-bold text-slate-600"><span className="block mb-2">{label}</span>{multiline ? <textarea {...props} rows={4}/> : <input {...props} type={type} min={type === 'number' ? 0 : undefined}/>}</label>;
}
export default function AdminPrelimsProgram() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingAssets, setUploadingAssets] = useState({});
  const uploadInProgress = Object.values(uploadingAssets).some(Boolean);
  const [sales, setSales] = useState([]);
  const [salesError, setSalesError] = useState('');
  const loadSales = () => {
    setSalesError('');
    axios.get(getApiUrl('/api/prelims-program/sales'), { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .then(({ data }) => setSales(data)).catch(() => setSalesError('Sales could not be loaded. Please refresh sales.'));
  };
  useEffect(loadSales, []);
  const load = () => { setError(''); loadPrelimsProgram().then(setData).catch(e => setError(e.message)); };
  useEffect(load, []);
  const update = (key, value) => { setNotice(''); setData(prev => ({ ...prev, [key]: value })); };
  const updateRow = (key, index, field, value) => update(key, data[key].map((row,i) => i === index ? { ...row, [field]: value } : row));
  const save = async e => {
    e.preventDefault();
    if (uploadInProgress || saving) return;
    setSaving(true); setError(''); setNotice('');
    const notification = toast.loading('Saving Prelims program…', { position: 'top-right' });
    try {
      setData({ ...defaultProgram, ...await savePrelimsProgram(data) });
      const message = 'Saved successfully. The public Prelims page now uses these updates.';
      setNotice(message);
      toast.update(notification, { render: message, type: 'success', isLoading: false, autoClose: 4000, closeButton: true });
    } catch (err) {
      const message = err.message || 'Unable to save the program. Please try again.';
      setError(message);
      toast.update(notification, { render: message, type: 'error', isLoading: false, autoClose: 6000, closeButton: true });
    } finally { setSaving(false); }
  };
  return <div className="max-w-6xl mx-auto"><div className="flex flex-wrap justify-between gap-4 mb-6"><div><h1 className="text-2xl font-black text-[#163F66]">Prelims PLUS Program</h1><p className="text-sm text-slate-500 mt-2">Manage the course page, classes, links and schedule. Class times use IST.</p></div><Link className="text-sm font-bold text-blue-700 underline" to="/programs/prelims" target="_blank">Preview public page ↗</Link></div>
    <section className="p-5 mb-6 rounded-xl border border-slate-200 bg-white"><div className="flex justify-between gap-4"><h2 className="font-bold">Prelims purchases</h2><button type="button" onClick={loadSales} className="text-sm text-blue-700 underline">Refresh sales</button></div>
      {salesError ? <p role="alert" className="text-red-700 text-sm mt-4">{salesError}</p> : <>
        <div className="grid sm:grid-cols-4 gap-4 my-5">{[['Online batches',sales.filter(s => s.courseId.endsWith('-online')).length],['Offline batches',sales.filter(s => s.courseId.endsWith('-offline')).length],['Students',new Set(sales.map(s => s.studentEmail)).size],['Revenue',`₹${sales.reduce((total,s) => total + Number(s.pricePaid || 0),0).toLocaleString('en-IN')}`]].map(([label,value]) => <div key={label} className="p-4 rounded-lg bg-slate-50"><p className="text-xs text-slate-500">{label}</p><strong className="text-xl text-[#163F66]">{value}</strong></div>)}</div>
        {sales.length ? <div className="overflow-x-auto max-h-96"><table className="w-full text-left text-xs"><thead><tr>{['Student','Batch / course','Amount','Payment ID','Purchased'].map(t => <th key={t} className="p-3 border-b">{t}</th>)}</tr></thead><tbody>{sales.map(s => <tr key={s._id}><td className="p-3 border-b">{s.studentName}<br/>{s.studentEmail}</td><td className="p-3 border-b">{s.courseName}</td><td className="p-3 border-b">₹{Number(s.pricePaid || 0).toLocaleString('en-IN')}</td><td className="p-3 border-b">{s.paymentId}</td><td className="p-3 border-b">{new Date(s.createdAt).toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</td></tr>)}</tbody></table></div> : <p className="text-sm text-slate-500">No confirmed Prelims purchases yet.</p>}
      </>}
    </section>
    {error && <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 mb-5">{error}{!data && <button className="ml-4 underline" onClick={load}>Retry</button>}</div>}
    {notice && <p role="status" className="bg-green-50 text-green-800 p-4 rounded-xl mb-5">{notice}</p>}
    {!data ? !error && <p>Loading program…</p> : <form onSubmit={save} className="space-y-6">
      <section className="p-5 bg-white rounded-xl border border-slate-200"><h2 className="font-bold mb-5">Overview & enrollment</h2><div className="grid md:grid-cols-2 gap-4">{[['title','Course title'],['tagline','Tagline'],['startDate','Start date','date'],['timings','Class timings (IST)'],['format','Format'],['totalClasses','Total classes','number'],['onlinePrice','Online price (₹)','number'],['onlineMrp','Online MRP (₹)','number'],['offlinePrice','Offline price (₹)','number'],['offlineMrp','Offline MRP (₹)','number'],['phone','Counselling phone'],['facultyName','Faculty name']].map(([key,label,type]) => <Field key={key} label={label} type={type} value={data[key]} required={key === 'title'} onChange={value => update(key, type === 'number' ? Number(value) : value)}/>)}<Field label="Course description" value={data.description} multiline onChange={v => update('description',v)}/><Field label="Faculty bio / subjects" value={data.facultyBio} multiline onChange={v => update('facultyBio',v)}/></div></section>
      <section className="p-5 bg-white rounded-xl border border-slate-200"><h2 className="font-bold mb-2">Images & brochure</h2><p className="text-xs text-slate-500 mb-5">Upload from your device to Cloudinary, or paste an existing URL. Replace or remove any file, then save the program to update the public page and student dashboard.</p><div className="grid md:grid-cols-2 gap-4">{[
        ['image', 'Course poster', 'image', 'prelims_images'],
        ['brochure', 'Course brochure', 'pdf', 'prelims_brochures'],
        ['facultyImage', 'Faculty photo', 'image', 'prelims_faculty']
      ].map(([key, label, kind, folder]) => <PrelimsAssetField key={key} label={label} value={data[key]} kind={kind} folder={folder} onChange={url => update(key,url)} disabled={saving} onUploadingChange={busy => setUploadingAssets(prev => ({...prev,[key]:busy}))}/>)}</div></section>
      <section className="p-5 bg-white rounded-xl border border-slate-200"><h2 className="font-bold mb-5">Course content</h2><div className="grid md:grid-cols-2 gap-4">{[['features','Advantages (one per line; Title: description)'],['subjects','Curriculum subjects (one per line)'],['questionTypes','Question formats (one per line)']].map(([key,label]) => <Field key={key} label={label} multiline value={data[key].join('\n')} onChange={v => update(key,v.split('\n'))}/>)}</div></section>
      <section className="p-5 bg-white rounded-xl border border-slate-200"><div className="flex justify-between gap-3 mb-4"><h2 className="font-bold">Classes & demo resources</h2><button type="button" className="text-sm font-bold text-blue-700" onClick={() => update('sessions',[...data.sessions,{title:'',subject:data.subjects[0] || '',date:'',time:'',duration:'',link:'',note:'',isDemo:false}])}>+ Add class</button></div><p className="text-xs text-slate-500 mb-5">Paste any full YouTube, Zoom, Google Drive or other HTTPS link. Links open directly; provider permissions still apply. Leave links blank until ready. Dates and times are displayed in IST.</p><div className="space-y-4">{data.sessions.map((s,i) => <div key={i} className="p-4 border border-slate-200 bg-slate-50 rounded-xl"><div className="flex justify-between mb-4"><strong className="text-sm">Class {i+1}</strong><button type="button" className="text-xs text-red-600 font-bold" onClick={() => update('sessions',data.sessions.filter((_,idx) => idx !== i))}>Remove class</button></div><div className="grid md:grid-cols-2 gap-4">{[['title','Class title','text'],['subject','Subject','text'],['date','Class date','date'],['time','Class time (IST)','time'],['duration','Duration (e.g. 3 hours)','text'],['link','Class link (YouTube / Zoom / Drive)','url'],['note','Class instructions / note','text']].map(([key,label,type]) => <Field key={key} label={label} type={type} value={s[key]} required={key === 'title'} onChange={v => updateRow('sessions',i,key,v)}/>)}</div><label className="flex gap-2 items-center text-sm mt-4"><input type="checkbox" checked={!!s.isDemo} onChange={e => updateRow('sessions',i,'isDemo',e.target.checked)}/>Also show in Demo Resources</label></div>)}{!data.sessions.length && <p className="text-sm text-slate-500">No classes added yet. Add a class to publish its date, time and joining link.</p>}</div></section>
      <section className="p-5 bg-white rounded-xl border border-slate-200"><div className="flex justify-between mb-5"><h2 className="font-bold">Frequently asked questions</h2><button className="text-blue-700 text-sm font-bold" type="button" onClick={() => update('faqs',[...data.faqs,{question:'',answer:''}])}>+ Add FAQ</button></div>{data.faqs.map((faq,i) => <div key={i} className="border-t py-4 space-y-3"><Field label="Question" required value={faq.question} onChange={v => updateRow('faqs',i,'question',v)}/><Field label="Answer" required multiline value={faq.answer} onChange={v => updateRow('faqs',i,'answer',v)}/><button className="text-red-600 text-xs" type="button" onClick={() => update('faqs',data.faqs.filter((_,idx) => idx !== i))}>Remove FAQ</button></div>)}</section>
      <button disabled={saving || uploadInProgress} className="px-7 py-3 bg-[#163F66] text-white rounded-xl font-bold disabled:opacity-50" type="submit">{uploadInProgress ? 'Wait for uploads to finish…' : saving ? 'Saving…' : 'Save Prelims program'}</button>
    </form>}
  </div>;
}
