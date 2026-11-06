import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React, { act, useState } from 'react';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:'http://localhost'});
globalThis.window=dom.window; globalThis.document=dom.window.document;
Object.defineProperty(globalThis,'navigator',{configurable:true,value:dom.window.navigator});
globalThis.IS_REACT_ACT_ENVIRONMENT=true;
const { createRoot } = await import('react-dom/client');
let resolveUpload, rejectUpload, currentValue, uploadStates = [], requests = [];
const compiled = await build({
  stdin:{contents:"export {default as AssetField, validatePrelimsFile} from './src/components/admin/PrelimsAssetField.jsx';",resolveDir:process.cwd()},
  bundle:true,write:false,platform:'node',format:'cjs',packages:'external',define:{'import.meta.env':'{}'},
  plugins:[{name:'mock-upload-axios',setup(b){b.onResolve({filter:/^axios$/},()=>({path:'axios',namespace:'test'}));b.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export default globalThis.mockAxios;'}));}}]
});
const module={exports:{}};
vm.runInNewContext(compiled.outputFiles[0].text,{
  module,exports:module.exports,require:createRequire(import.meta.url),window:dom.window,document:dom.window.document,
  localStorage:{getItem:()=> 'admin-token'},FormData:dom.window.FormData,
  console:{...console,error:()=>{}},
  mockAxios:{post:(url,form,options)=>{requests.push({url,form,options});return new Promise((resolve,reject)=>{resolveUpload=resolve;rejectUpload=reject;});}}
});
const {AssetField,validatePrelimsFile}=module.exports;
const root=createRoot(document.getElementById('root'));
after(async()=>{await act(async()=>root.unmount());dom.window.close();});
function Wrapper({kind='image'}) {
  const [value,setValue]=useState('https://example.com/old-image.jpg');
  currentValue=value;
  return React.createElement(AssetField,{label:kind === 'pdf' ? 'Course brochure' : 'Course poster',kind,folder:kind === 'pdf' ? 'prelims_brochures' : 'prelims_images',value,onChange:setValue,onUploadingChange:busy=>uploadStates.push(busy)});
}
const fileChange=async file=>{
  const input=document.querySelector('input[type="file"]');
  Object.defineProperty(input,'files',{configurable:true,value:[file]});
  await act(async()=>input.dispatchEvent(new dom.window.Event('change',{bubbles:true})));
};

test('Prelims image uploads to Cloudinary, locks controls, updates its URL and can be removed',async()=>{
  await act(async()=>root.render(React.createElement(Wrapper,{key:'success'})));
  await fileChange(new dom.window.File(['image'],'poster.png',{type:'image/png'}));
  assert.equal(currentValue,'https://example.com/old-image.jpg');
  assert.equal(requests.length,1);
  assert.equal(requests[0].form.get('folder'),'prelims_images');
  assert.equal(requests[0].options.headers.Authorization,'Bearer admin-token');
  assert.match(document.body.textContent,/Uploading to Cloudinary/);
  assert.equal(document.querySelector('input:not([type="file"])').disabled,true);
  await act(async()=>resolveUpload({data:{url:'https://res.cloudinary.com/test/image/upload/poster.png'}}));
  assert.equal(currentValue,'https://res.cloudinary.com/test/image/upload/poster.png');
  assert.equal(document.querySelector('img').src,currentValue);
  assert.deepEqual(uploadStates,[true,false]);
  const remove=[...document.querySelectorAll('button')].find(b=>b.textContent.includes('Remove'));
  await act(async()=>remove.click());
  assert.equal(currentValue,''); assert.equal(document.querySelector('img'),null);
});

test('Upload failures preserve the previous link and leave editing available',async()=>{
  await act(async()=>root.render(React.createElement(Wrapper,{key:'failure'})));
  await fileChange(new dom.window.File(['image'],'poster.png',{type:'image/png'}));
  await act(async()=>rejectUpload({response:{data:{message:'Cloudinary is unavailable'}}}));
  assert.equal(currentValue,'https://example.com/old-image.jpg');
  assert.match(document.querySelector('[role="alert"]').textContent,/Cloudinary is unavailable/);
  assert.equal(document.querySelector('input:not([type="file"])').disabled,false);
  const urlInput=document.querySelector('input:not([type="file"])');
  assert.equal(urlInput.value,currentValue);
});

test('Brochure and image validation rejects wrong, empty and oversized files',()=>{
  assert.match(validatePrelimsFile({name:'bad.exe',size:10,type:'application/octet-stream'},'image'),/Choose a JPG/);
  assert.match(validatePrelimsFile({name:'photo.png',size:10,type:'image/png'},'pdf'),/Choose a PDF/);
  assert.match(validatePrelimsFile({name:'brochure.pdf',size:26*1024*1024,type:'application/pdf'},'pdf'),/25 MB/);
  assert.match(validatePrelimsFile({name:'empty.pdf',size:0,type:'application/pdf'},'pdf'),/non-empty/);
  assert.equal(validatePrelimsFile({name:'brochure.pdf',size:100,type:'application/pdf'},'pdf'),'');
});

test('Brochure upload uses the PDF folder and offers the new link for users',async()=>{
  await act(async()=>root.render(React.createElement(Wrapper,{key:'pdf',kind:'pdf'})));
  await fileChange(new dom.window.File(['%PDF-1.7 test'],'brochure.pdf',{type:'application/pdf'}));
  assert.equal(requests.at(-1).form.get('folder'),'prelims_brochures');
  await act(async()=>resolveUpload({data:{url:'https://res.cloudinary.com/test/raw/upload/brochure.pdf'}}));
  assert.equal(currentValue,'https://res.cloudinary.com/test/raw/upload/brochure.pdf');
  assert.equal(document.querySelector('a').href,currentValue);
  assert.equal(document.querySelector('img'),null);
  const input=document.querySelector('input:not([type="file"])');
  const setValue=Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set;
  await act(async()=>{setValue.call(input,'https://example.com/edited-brochure.pdf');input.dispatchEvent(new dom.window.Event('input',{bubbles:true}));});
  assert.equal(currentValue,'https://example.com/edited-brochure.pdf');
});
