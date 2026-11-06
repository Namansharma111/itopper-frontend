export const emptyBlogSeo = { seoTitle: '', seoDescription: '', slug: '', focusKeyword: '', seoKeywords: '', canonicalUrl: '', noIndex: false, imageAlt: '' };
export const normalizeBlogSlug = value => {
  const slug = String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '').slice(0,120).replace(/-+$/g, '');
  return /^[a-f\d]{24}$/i.test(slug) ? `article-${slug}` : slug;
};
export const blogPath = blog => `/blog/${encodeURIComponent(blog.slug || blog._id || blog.id)}`;
export const blogSeoValues = blog => Object.fromEntries(Object.keys(emptyBlogSeo).map(key => [key, blog[key] ?? emptyBlogSeo[key]]));

export function applyBlogMetadata(blog, origin = window.location.origin) {
  const title = blog.seoTitle || `${blog.title} | iTopper`;
  const description = blog.seoDescription || blog.excerpt || '';
  const canonical = blog.canonicalUrl || new URL(blogPath(blog), origin).href;
  const previousTitle = document.title;
  const restore = [];
  const setTag = (selector, tag, attributes) => {
    let element = document.head.querySelector(selector);
    const previous = element ? [...element.attributes].map(attr => [attr.name, attr.value]) : null;
    if (!element) { element = document.createElement(tag); document.head.appendChild(element); }
    Object.entries(attributes).forEach(([key,value]) => element.setAttribute(key,value));
    restore.push(() => {
      if (!previous) element.remove();
      else { [...element.attributes].forEach(attr => element.removeAttribute(attr.name)); previous.forEach(([key,value]) => element.setAttribute(key,value)); }
    });
  };
  const meta = (name, content, property = false) => setTag(`meta[${property ? 'property' : 'name'}="${name}"]`, 'meta', { [property ? 'property' : 'name']:name, content });
  document.title = title;
  meta('description',description);
  meta('keywords',[blog.focusKeyword,blog.seoKeywords].filter(Boolean).join(', '));
  meta('robots',blog.noIndex || blog.published === false ? 'noindex, follow' : 'index, follow');
  setTag('link[rel="canonical"]','link',{rel:'canonical',href:canonical});
  for (const [name,value] of Object.entries({ 'og:type':'article','og:title':title,'og:description':description,'og:url':canonical,'og:image':blog.image || '', 'og:image:alt':blog.imageAlt || blog.title })) meta(name,value,true);
  for (const [name,value] of Object.entries({ 'twitter:card':blog.image ? 'summary_large_image' : 'summary','twitter:title':title,'twitter:description':description,'twitter:image':blog.image || '' })) meta(name,value);
  const structured = document.createElement('script');
  structured.type = 'application/ld+json';
  structured.textContent = JSON.stringify({ '@context':'https://schema.org','@type':'BlogPosting',headline:blog.title,description,image:blog.image ? [blog.image] : undefined,datePublished:blog.createdAt,dateModified:blog.updatedAt,mainEntityOfPage:canonical,publisher:{'@type':'Organization',name:'iTopper Academy',url:origin},author:{'@type':'Organization',name:'iTopper Academy'} });
  document.head.appendChild(structured);
  return () => { document.title = previousTitle; restore.reverse().forEach(fn => fn()); structured.remove(); };
}
