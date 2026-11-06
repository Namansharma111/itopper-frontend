import React, { useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { blogEditorExtensions } from '../../utils/blogEditorExtensions';
import { normalizeEditorHtml } from '../../utils/blogContent';
import { Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link2, Unlink, ImagePlus, Table2, Undo2, Redo2, Eraser, Quote, Minus, Upload } from 'lucide-react';
import { uploadFileToCloudinary } from '../../utils/uploadStorage';
import '../../styles/blogContent.css';

function Tool({ title, active, disabled, onClick, children }) {
  return <button type="button" aria-label={title} title={title} aria-pressed={!!active} disabled={disabled} onMouseDown={e => e.preventDefault()} onClick={onClick} className={`h-8 min-w-8 px-2 rounded-md inline-flex items-center justify-center border text-xs disabled:opacity-30 ${active ? 'bg-blue-100 text-blue-900 border-blue-300' : 'border-transparent text-slate-600 hover:bg-white hover:border-slate-200'}`}>{children}</button>;
}

export default function BlogRichTextEditor({ content, onChange }) {
  const uploadRef = useRef(null);
  const [dialog, setDialog] = useState('');
  const [url, setUrl] = useState('');
  const [alt, setAlt] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const editor = useEditor({
    extensions:blogEditorExtensions,
    content:normalizeEditorHtml(content),
    editorProps:{attributes:{class:'blog-article-content blog-rich-content',role:'textbox','aria-label':'Article body','aria-multiline':'true'}},
    onUpdate:({editor:current}) => onChange(current.isEmpty ? '' : current.getHTML()),
  });
  const state = useEditorState({editor, selector:({editor:e}) => e ? {
    bold:e.isActive('bold'),italic:e.isActive('italic'),underline:e.isActive('underline'),strike:e.isActive('strike'),
    bulletList:e.isActive('bulletList'),orderedList:e.isActive('orderedList'),blockquote:e.isActive('blockquote'),link:e.isActive('link'),table:e.isActive('table'),
    heading:[1,2,3,4].find(level => e.isActive('heading',{level})) || '',
    font:e.getAttributes('textStyle').fontFamily || '',size:e.getAttributes('textStyle').fontSize || '',
    color:e.getAttributes('textStyle').color || '#334155', background:e.getAttributes('textStyle').backgroundColor || '#fff2a8',
    align:e.getAttributes('paragraph').textAlign || e.getAttributes('heading').textAlign || 'left',
    canUndo:e.can().undo(),canRedo:e.can().redo(),words:e.getText().trim().split(/\s+/u).filter(Boolean).length,
  } : null});
  if (!editor || !state) return <p className="text-sm text-slate-500">Loading editor…</p>;
  const selectClass = 'bg-white border border-slate-200 rounded-md h-8 px-2 text-xs max-w-36';
  const showDialog = type => { setDialog(type); setUrl(type === 'link' ? editor.getAttributes('link').href || '' : ''); setAlt(''); setError(''); };
  const insert = e => {
    e.preventDefault();
    const value = url.trim();
    if (dialog === 'link') {
      if (!/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(value)) { setError('Enter a full HTTPS link, email link, phone link or a site path.'); return; }
      editor.chain().focus().extendMarkRange('link').setLink({href:value}).run();
    } else {
      if (!/^https?:\/\//i.test(value)) { setError('Enter a full http:// or https:// image URL.'); return; }
      editor.chain().focus().setImage({src:value,alt:alt.trim()}).run();
    }
    setDialog('');
  };
  return <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
    <div role="toolbar" aria-label="Article formatting" className="p-2.5 flex flex-wrap gap-1 items-center bg-slate-50 border-b border-slate-200">
      <select aria-label="Heading format" className={selectClass} value={state.heading} onChange={e => e.target.value ? editor.chain().focus().setHeading({level:Number(e.target.value)}).run() : editor.chain().focus().setParagraph().run()}><option value="">Paragraph</option>{[1,2,3,4].map(n => <option key={n} value={n}>Heading {n}</option>)}</select>
      <select aria-label="Font family" className={selectClass} value={state.font} onChange={e => e.target.value ? editor.chain().focus().setFontFamily(e.target.value).run() : editor.chain().focus().unsetFontFamily().run()}><option value="">Default font</option>{['Arial','Georgia','Verdana','Times New Roman','Courier New','sans-serif','serif'].map(font => <option key={font} value={font}>{font}</option>)}</select>
      <select aria-label="Font size" className={selectClass} value={state.size} onChange={e => e.target.value ? editor.chain().focus().setFontSize(e.target.value).run() : editor.chain().focus().unsetFontSize().run()}><option value="">Font size</option>{[12,14,16,18,20,24,28,32,36,48,64].map(n => <option key={n} value={`${n}px`}>{n}px</option>)}</select>
      <Tool title="Bold" active={state.bold} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={15}/></Tool>
      <Tool title="Italic" active={state.italic} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={15}/></Tool>
      <Tool title="Underline" active={state.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}><Underline size={15}/></Tool>
      <Tool title="Strikethrough" active={state.strike} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough size={15}/></Tool>
      <label className="text-[10px] text-slate-500 px-1">Text<input type="color" aria-label="Text colour" className="block w-7 h-5 cursor-pointer" value={state.color.startsWith('#') ? state.color : '#334155'} onChange={e => editor.chain().focus().setColor(e.target.value).run()}/></label>
      <label className="text-[10px] text-slate-500 px-1">Highlight<input type="color" aria-label="Highlight colour" className="block w-7 h-5 cursor-pointer" value={state.background.startsWith('#') ? state.background : '#fff2a8'} onChange={e => editor.chain().focus().setBackgroundColor(e.target.value).run()}/></label>
      <span className="w-px h-6 bg-slate-200 mx-1"/>
      {[[AlignLeft,'left'],[AlignCenter,'center'],[AlignRight,'right'],[AlignJustify,'justify']].map(([Icon,align]) => <Tool key={align} title={`Align ${align}`} active={state.align === align} onClick={() => editor.chain().focus().setTextAlign(align).run()}><Icon size={15}/></Tool>)}
      <Tool title="Bullet list" active={state.bulletList} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={15}/></Tool>
      <Tool title="Numbered list" active={state.orderedList} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={15}/></Tool>
      <Tool title="Quote" active={state.blockquote} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote size={15}/></Tool>
      <Tool title="Insert link" active={state.link} onClick={() => showDialog('link')}><Link2 size={15}/></Tool>
      <Tool title="Remove link" disabled={!state.link} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink size={15}/></Tool>
      <Tool title="Insert image" onClick={() => showDialog('image')}><ImagePlus size={15}/></Tool>
      <Tool title="Insert table" onClick={() => editor.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run()}><Table2 size={15}/></Tool>
      <Tool title="Horizontal divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus size={15}/></Tool>
      <Tool title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}><Eraser size={15}/></Tool>
      <Tool title="Undo" disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}><Undo2 size={15}/></Tool>
      <Tool title="Redo" disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}><Redo2 size={15}/></Tool>
    </div>
    {state.table && <div className="flex flex-wrap gap-2 p-2 bg-blue-50 border-b border-blue-100">{[['Add row','addRowAfter'],['Add column','addColumnAfter'],['Delete row','deleteRow'],['Delete column','deleteColumn'],['Delete table','deleteTable']].map(([label,command]) => <Tool key={command} title={label} onClick={() => editor.chain().focus()[command]().run()}>{label}</Tool>)}</div>}
    {dialog && <div className="p-4 bg-blue-50 border-b border-blue-100 space-y-3"><div className="flex gap-2 justify-between text-sm font-bold"><span>{dialog === 'link' ? 'Insert or edit link' : 'Insert image'}</span><button type="button" aria-label="Close insert panel" onClick={() => setDialog('')}>×</button></div><form onSubmit={insert} className="flex flex-wrap gap-2"><input aria-label={dialog === 'link' ? 'Link URL' : 'Image URL'} value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className="min-w-0 flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs"/>{dialog === 'image' && <input aria-label="Image alt text" value={alt} onChange={e => setAlt(e.target.value)} placeholder="Image description (alt text)" className="bg-white border border-slate-200 rounded-lg p-2 text-xs"/>}<button type="submit" className="rounded-lg bg-[#163F66] text-white px-4 py-2 text-xs">Insert</button></form>{dialog === 'image' && <><button type="button" disabled={uploading} onClick={() => uploadRef.current?.click()} className="text-xs inline-flex gap-2 items-center font-semibold"><Upload size={14}/>{uploading ? 'Uploading…' : 'Upload an image'}</button><input ref={uploadRef} type="file" accept="image/*" className="hidden" onChange={async e => { const file=e.target.files?.[0]; if(!file) return; setUploading(true); setError(''); try { const src=await uploadFileToCloudinary(file,'blog_content_images'); editor.chain().focus().setImage({src,alt:alt.trim()}).run(); setDialog(''); } catch(err) { setError(err.message); } finally { setUploading(false); e.target.value=''; } }}/></>}{error && <p role="alert" className="text-red-700 text-xs">{error}</p>}</div>}
    <EditorContent editor={editor}/>
    <div className="text-xs text-slate-400 px-4 py-2 border-t border-slate-100 flex justify-between gap-3"><span>{state.words} words</span><span>Ctrl+B bold · Ctrl+I italic · Ctrl+Z undo</span></div>
  </div>;
}
