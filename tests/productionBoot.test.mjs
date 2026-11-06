import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { SourceTextModule } from 'node:vm';
import { JSDOM, VirtualConsole } from 'jsdom';

// Execute the actual Vite output: a successful compilation alone cannot detect
// circular chunk initialization failures in React's production runtime.
test('Production bundle initializes React and renders a public route', async () => {
  const output = resolve('dist');
  const html = await readFile(resolve(output,'index.html'),'utf8');
  const entry = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/);
  assert.ok(entry,'Built HTML must have a module entry');
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on('jsdomError', error => { if (!error.message.includes('Not implemented: Window\'s scrollTo()')) errors.push(error); });
  const dom = new JSDOM(html,{url:'https://itopper.example/privacy',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole});
  const { window } = dom;
  window.scrollTo = () => {};
  window.matchMedia = () => ({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  window.fetch = async () => ({ok:true,json:async () => [],headers:new Headers()});
  window.TextEncoder = TextEncoder; window.TextDecoder = TextDecoder;
  const modules = new Map();
  const context = dom.getInternalVMContext();
  async function load(file) {
    if (modules.has(file)) return modules.get(file);
    const pending = readFile(file,'utf8').then(code => new SourceTextModule(code,{context,identifier:file}));
    modules.set(file,pending);
    return pending;
  }
  try {
    const main = await load(resolve(output,entry[1].replace(/^\//,'')));
    await main.link((specifier,importer) => load(resolve(dirname(importer.identifier),specifier)));
    await main.evaluate();
    // Allow React's scheduled root render to finish.
    for (let attempts=0;attempts<30 && !window.document.querySelector('#root')?.textContent.trim();attempts++) await new Promise(done => setTimeout(done,20));
    assert.equal(errors.length,0,errors.map(error=>error.stack).join('\n'));
    assert.match(window.document.getElementById('root').textContent,/Privacy/i);
  } finally { window.close(); }
});
