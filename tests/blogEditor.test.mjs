import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><head><title>iTopper</title><meta name="description" content="Site description"></head><body></body></html>', {url:'https://itopper.example/blog/old'});
for (const key of ['window','document','Node','Element','HTMLElement','MutationObserver','DOMParser','getComputedStyle']) {
  Object.defineProperty(globalThis,key,{configurable:true,value: key === 'getComputedStyle' ? dom.window.getComputedStyle.bind(dom.window) : dom.window[key]});
}
Object.defineProperty(globalThis,'navigator',{configurable:true,value:dom.window.navigator});
globalThis.requestAnimationFrame = callback => setTimeout(callback,0);
globalThis.cancelAnimationFrame = clearTimeout;
const { Editor } = await import('@tiptap/core');
const { blogEditorExtensions } = await import('../src/utils/blogEditorExtensions.js');
const { normalizeEditorHtml, sanitizeArticleHtml } = await import('../src/utils/blogContent.js');
const { applyBlogMetadata, normalizeBlogSlug, blogPath } = await import('../src/utils/blogSeo.js');
after(() => dom.window.close());

test('Rich text formatting survives saving and reopening, including legacy font markup', () => {
  const editor = new Editor({extensions:blogEditorExtensions,content:normalizeEditorHtml('<p>Prelims lesson</p><p><font size="5" color="#ff0000" face="Georgia">Legacy text</font></p>')});
  editor.commands.setTextSelection({from:1,to:8});
  editor.chain().setFontSize('32px').setFontFamily('Georgia').setColor('#008000').toggleBold().run();
  editor.commands.setTextAlign('center');
  let html = editor.getHTML();
  assert.match(html,/font-size: 32px/); assert.match(html,/font-family: Georgia/); assert.match(html,/text-align: center/); assert.match(html,/<strong>/);
  assert.match(html,/font-size: 24px/,'Old font size is preserved');
  editor.commands.setTextSelection('end');
  editor.commands.insertContent('<p>Table below</p>');
  editor.commands.insertTable({rows:2,cols:2,withHeaderRow:true});
  html = editor.getHTML(); assert.match(html,/<table/); assert.match(html,/<th/);
  const reopened = new Editor({extensions:blogEditorExtensions,content:html});
  assert.equal(reopened.getHTML(),html);
  editor.destroy(); reopened.destroy();
});

test('Pasted scripts and unsafe links are removed without losing text styles', () => {
  const html = sanitizeArticleHtml('<p><span style="font-size: 24px">Safe</span></p><script>alert(1)</script><img src="https://example.com/photo.jpg" onerror="alert(1)"><a href="javascript:alert(1)">unsafe</a>');
  assert.doesNotMatch(html,/<script|onerror|javascript:/i); assert.match(html,/font-size: 24px/);
});

test('Every article gets its own SEO tags, canonical URL and structured data, with cleanup on navigation', () => {
  const blog = {id:'old-id',slug:'prelims-guide',title:'Course guide',seoTitle:'Custom SEO title',seoDescription:'Custom description',excerpt:'Card excerpt',focusKeyword:'Prelims',seoKeywords:'PYQs, UPSC',image:'https://example.com/cover.jpg',imageAlt:'Study notes',noIndex:true,published:true};
  const cleanup = applyBlogMetadata(blog,'https://itopper.example');
  assert.equal(document.title,'Custom SEO title');
  assert.equal(document.querySelector('meta[name="description"]').content,'Custom description');
  assert.equal(document.querySelector('link[rel="canonical"]').href,'https://itopper.example/blog/prelims-guide');
  assert.equal(document.querySelector('meta[property="og:title"]').content,'Custom SEO title');
  assert.equal(document.querySelector('meta[name="robots"]').content,'noindex, follow');
  const schema = JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent);
  assert.equal(schema['@type'],'BlogPosting');
  cleanup();
  assert.equal(document.title,'iTopper'); assert.equal(document.querySelector('meta[name="description"]').content,'Site description');
  assert.equal(document.querySelector('link[rel="canonical"]'),null);
  assert.equal(document.querySelector('meta[property="og:title"]'),null);
  assert.equal(document.querySelector('script[type="application/ld+json"]'),null);
  const cleanup2 = applyBlogMetadata({title:'Second blog',id:'legacy-id',excerpt:'Second excerpt',published:true},'https://itopper.example');
  assert.equal(document.querySelector('meta[name="description"]').content,'Second excerpt');
  assert.equal(document.querySelector('meta[name="keywords"]').content,'');
  assert.equal(document.querySelector('meta[name="robots"]').content,'index, follow');
  cleanup2();
  assert.equal(normalizeBlogSlug('Café & UPSC Tips!'),'cafe-upsc-tips');
  assert.equal(blogPath({id:'legacy-id'}),'/blog/legacy-id');
});
