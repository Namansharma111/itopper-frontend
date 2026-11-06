import React from 'react';
import { normalizeBlogSlug } from '../../utils/blogSeo';

export default function BlogSeoSettings({ value, onChange, title, excerpt }) {
  const update = (key, next) => onChange({ ...value, [key]:next });
  const seoTitle = value.seoTitle || title;
  const description = value.seoDescription || excerpt;
  const slug = value.slug || normalizeBlogSlug(title);
  const fieldClass = 'w-full bg-white border border-slate-200 focus:border-[#163F66] rounded-xl px-4 py-3 text-sm outline-none';
  const checks = [
    ['Meta title',seoTitle.length >= 30 && seoTitle.length <= 60],
    ['Meta description',description.length >= 100 && description.length <= 160],
    ['URL slug',!!slug],
    ['Focus keyword in title',!!value.focusKeyword && seoTitle.toLowerCase().includes(value.focusKeyword.toLowerCase())]
  ];
  return <div className="grid lg:grid-cols-3 gap-6">
    <section className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5">
      <div><h3 className="font-bold text-lg text-[#163F66]">Blog SEO Manager</h3><p className="text-xs text-slate-500 mt-1">These settings belong to this article and save together with its content.</p></div>
      <label className="block text-sm font-semibold">SEO Meta Title<input className={`${fieldClass} mt-2`} value={value.seoTitle} placeholder={title || 'Enter SEO title'} onChange={e => update('seoTitle',e.target.value)}/><span className="block text-xs font-normal text-slate-500 mt-1">{seoTitle.length} characters • Aim for around 50–60. Uses the article title when blank.</span></label>
      <label className="block text-sm font-semibold">Meta Description<textarea className={`${fieldClass} mt-2`} rows={4} value={value.seoDescription} placeholder={excerpt || 'Write a relevant search result summary'} onChange={e => update('seoDescription',e.target.value)}/><span className="block text-xs font-normal text-slate-500 mt-1">{description.length} characters • Aim for around 150–160. Uses the excerpt when blank.</span></label>
      <label className="block text-sm font-semibold">SEO URL Slug<div className="flex items-center mt-2 rounded-xl border border-slate-200 bg-white overflow-hidden"><span className="px-3 text-slate-400 text-xs">/blog/</span><input className="w-full py-3 pr-3 text-sm outline-none" value={value.slug} placeholder={normalizeBlogSlug(title) || 'your-article-title'} onChange={e => update('slug',e.target.value)} onBlur={e => update('slug',normalizeBlogSlug(e.target.value))}/></div><span className="block text-xs font-normal text-slate-500 mt-1">Leave blank to generate from the title. Previous URLs continue to open this article after a slug change.</span></label>
      <label className="block text-sm font-semibold">Focus Keyword<input className={`${fieldClass} mt-2`} value={value.focusKeyword} placeholder="e.g. UPSC Prelims preparation" onChange={e => update('focusKeyword',e.target.value)}/></label>
      <label className="block text-sm font-semibold">Secondary Keywords<input className={`${fieldClass} mt-2`} value={value.seoKeywords} placeholder="prelims strategy, UPSC PYQs, study plan" onChange={e => update('seoKeywords',e.target.value)}/><span className="block text-xs font-normal text-slate-500 mt-1">Separate keywords with commas. Keywords help you plan content; they do not guarantee search rankings.</span></label>
      <label className="block text-sm font-semibold">Cover Image Alt Text<input className={`${fieldClass} mt-2`} value={value.imageAlt} placeholder="Describe the cover image" onChange={e => update('imageAlt',e.target.value)}/></label>
      <details className="border-t pt-4"><summary className="font-semibold text-sm cursor-pointer">Advanced SEO</summary><div className="mt-4 space-y-4"><label className="block text-sm font-semibold">Canonical URL (optional)<input className={`${fieldClass} mt-2`} type="url" value={value.canonicalUrl} placeholder="https://example.com/blog/original-article" onChange={e => update('canonicalUrl',e.target.value)}/><span className="block text-xs font-normal text-slate-500 mt-1">Usually leave blank. The current article URL is used automatically.</span></label><label className="flex gap-3 text-sm"><input type="checkbox" checked={value.noIndex} onChange={e => update('noIndex',e.target.checked)}/>Ask search engines not to index this article (noindex)</label></div></details>
    </section>
    <aside className="space-y-5"><div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-sm mb-4">Search result preview</h3><p className="text-xs text-slate-500 break-all">{window.location.origin}/blog/{slug || 'your-article'}</p><p className="text-xl text-blue-800 mt-2 break-words">{seoTitle || 'Your article SEO title'}</p><p className="text-sm text-slate-600 mt-2 break-words">{description || 'Your search description will appear here.'}</p><p className="text-[11px] text-slate-400 mt-4">Preview only. Search engines may display different text.</p></div><div className="rounded-2xl border border-slate-200 p-5"><h3 className="font-bold text-sm mb-4">Writing checklist</h3>{checks.map(([label,ok]) => <p key={label} className="text-xs flex justify-between py-2 gap-2"><span>{label}</span><span className={ok ? 'text-green-700' : 'text-amber-700'}>{ok ? 'Ready' : 'Review'}</span></p>)}</div></aside>
  </div>;
}
