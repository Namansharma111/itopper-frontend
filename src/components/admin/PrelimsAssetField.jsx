import React, { useRef, useState } from 'react';
import { Upload, ExternalLink, Trash2, Loader2, FileText } from 'lucide-react';
import { uploadFileToCloudinary } from '../../utils/uploadStorage';
import { safeProgramLink } from '../../utils/prelimsProgram';

export const MAX_PRELIMS_UPLOAD_BYTES = 25 * 1024 * 1024;
export function validatePrelimsFile(file, kind) {
  if (!file || file.size === 0) return 'Choose a non-empty file to upload.';
  if (file.size > MAX_PRELIMS_UPLOAD_BYTES) return 'File size must be 25 MB or less.';
  if (kind === 'pdf' && !(file.type === 'application/pdf' || (!file.type && /\.pdf$/i.test(file.name)))) return 'Choose a PDF file for the brochure.';
  if (kind === 'image' && !['image/jpeg','image/png','image/webp','image/gif','image/avif'].includes(file.type) && !(!file.type && /\.(jpe?g|png|webp|gif|avif)$/i.test(file.name))) return 'Choose a JPG, PNG, WEBP, GIF or AVIF image.';
  return '';
}

export default function PrelimsAssetField({ label, value, kind, folder, onChange, onUploadingChange, disabled = false }) {
  const fileRef = useRef(null);
  const uploadLock = useRef(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const link = safeProgramLink(value);
  const busy = disabled || uploading;
  const upload = async event => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || uploadLock.current || disabled) return;
    const validation = validatePrelimsFile(file, kind);
    if (validation) { setError(validation); return; }
    uploadLock.current = true; setUploading(true); setError(''); onUploadingChange?.(true);
    try {
      const url = await uploadFileToCloudinary(file, folder);
      if (!url) throw new Error('Upload did not return a file URL. Please try again.');
      onChange(url);
    } catch (err) { setError(err.message || 'Upload failed. Please try again.'); }
    finally { uploadLock.current = false; setUploading(false); onUploadingChange?.(false); }
  };
  return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
    <label className="block text-xs font-bold text-slate-600"><span className="block mb-2">{label}</span><input className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white text-slate-800 disabled:opacity-60" value={value || ''} disabled={busy} placeholder={kind === 'pdf' ? 'Paste brochure URL or upload a PDF below' : 'Paste image URL or upload an image below'} onChange={e => { setError(''); onChange(e.target.value); }}/></label>
    {link && (kind === 'image' ? <img src={link} alt={`${label} preview`} className="w-full h-40 object-contain rounded-lg bg-white border border-slate-200"/> : <div className="flex gap-2 items-center bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600"><FileText size={20} className="shrink-0"/><span className="break-all">{value.split('/').pop() || 'Current brochure'}</span></div>)}
    <div className="flex flex-wrap gap-3 items-center">
      <input ref={fileRef} type="file" accept={kind === 'pdf' ? '.pdf,application/pdf' : '.jpg,.jpeg,.png,.webp,.gif,.avif,image/jpeg,image/png,image/webp,image/gif,image/avif'} aria-label={`Choose ${label} file`} disabled={busy} className="hidden" onChange={upload}/>
      <button type="button" disabled={busy} onClick={() => fileRef.current?.click()} className="inline-flex gap-2 items-center rounded-lg px-3 py-2 text-xs font-bold bg-[#163F66] text-white disabled:opacity-50">{uploading ? <Loader2 size={14} className="animate-spin"/> : <Upload size={14}/>} {uploading ? 'Uploading to Cloudinary…' : value ? 'Replace file' : kind === 'pdf' ? 'Upload PDF' : 'Upload image'}</button>
      {link && <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex gap-1 items-center text-xs font-semibold text-blue-700">{kind === 'pdf' ? 'Open brochure' : 'View image'} <ExternalLink size={13}/></a>}
      {!!value && <button type="button" disabled={busy} onClick={() => { setError(''); onChange(''); }} className="inline-flex gap-1 items-center text-xs text-red-700 font-semibold disabled:opacity-50"><Trash2 size={13}/>Remove</button>}
    </div>
    <p className="text-[11px] text-slate-500">{kind === 'pdf' ? 'PDF' : 'JPG, PNG, WEBP, GIF or AVIF'} • Maximum 25 MB. Save the program to publish an upload, URL change or removal.</p>
    {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
  </div>;
}
