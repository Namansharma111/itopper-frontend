import DOMPurify from 'dompurify';

export const sanitizeArticleHtml = html => DOMPurify.sanitize(html || '');

// Keep formatting from articles written with the previous browser-based editor.
export function normalizeEditorHtml(html) {
  const container = document.createElement('div');
  container.innerHTML = sanitizeArticleHtml(html);
  const sizes = { 1:'12px',2:'14px',3:'16px',4:'18px',5:'24px',6:'32px',7:'48px' };
  container.querySelectorAll('font').forEach(font => {
    const span = document.createElement('span');
    span.setAttribute('style',font.getAttribute('style') || '');
    if (sizes[font.getAttribute('size')]) span.style.fontSize = sizes[font.getAttribute('size')];
    if (font.getAttribute('face')) span.style.fontFamily = font.getAttribute('face');
    if (font.getAttribute('color')) span.style.color = font.getAttribute('color');
    span.append(...font.childNodes); font.replaceWith(span);
  });
  return container.innerHTML;
}
