import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: ['src/utils/razorpay.js'], bundle: true, write: false, format: 'iife', globalName: 'checkout',
  define: { 'import.meta.env': '{}' },
  plugins: [{ name: 'test-axios', setup(builder) {
    builder.onResolve({filter:/^axios$/}, () => ({path:'axios',namespace:'test'}));
    builder.onLoad({filter:/.*/,namespace:'test'}, () => ({contents:'export default globalThis.mockAxios;'}));
  } }]
});

function harness(verification = { success:true, enrollment:{courseId:'prelims-plus-2027-offline'} }) {
  let gateway, success = [], errors = [], cancels = 0;
  const calls = [], values = new Map([['token','registered-token']]);
  const respond = (url, body) => {
    calls.push({url,body});
    return url.endsWith('/create-order') ? {orderId:'order_test',amount:999900,currency:'INR',key:'test-key'} : verification;
  };
  const context = vm.createContext({
    console, alert: () => {},
    mockAxios: {post:async (url,body,options) => {assert.equal(options.headers.Authorization,'Bearer registered-token'); return {data:respond(url,body)};}},
    fetch:async (url,options) => ({ok:true,json:async () => respond(url,JSON.parse(options.body))}),
    localStorage:{getItem:key => values.get(key) ?? null,setItem:(key,value) => values.set(key,value)},
    window:{location:{hostname:'localhost'},Razorpay:class {constructor(options){gateway=options;}on(){}open(){}}}
  });
  vm.runInContext(compiled.outputFiles[0].text,context);
  const start = category => context.checkout.launchRazorpayCheckout({
    item:{id:'prelims-plus-2027-offline',title:'Prelims Offline Batch',category,finalPrice:9999},
    user:{id:'student-1',name:'Student',email:'student@example.com'},amount:9999,
    onSuccess:(...args) => success.push(args),onError:error => errors.push(error),onCancel:() => cancels++
  });
  return {start,calls,values,success,errors,get gateway(){return gateway;},get cancels(){return cancels;}};
}

test('Prelims gateway retains offline selection, verifies before success, and handles dismissal', async () => {
  const h = harness();
  await h.start('Prelims');
  assert.match(h.calls[0].url,/\/api\/payment\/prelims\/create-order$/);
  assert.equal(h.calls[0].body.courseId,'prelims-plus-2027-offline');
  assert.equal(h.gateway.amount,999900);
  assert.equal(h.success.length,0);
  await h.gateway.handler({razorpay_order_id:'order_test',razorpay_payment_id:'pay_test',razorpay_signature:'signed'});
  assert.match(h.calls[1].url,/\/api\/payment\/prelims\/verify$/);
  assert.deepEqual(h.success,[['pay_test',9999]]);
  assert.equal(h.values.size,1,'Prelims must not grant purchases through local storage');
  h.gateway.modal.ondismiss();
  assert.equal(h.cancels,1);
});

test('Unconfirmed Prelims payment never grants local access or reports success', async () => {
  const h = harness({success:false,message:'Payment confirmation pending'});
  await h.start('Prelims');
  await h.gateway.handler({razorpay_order_id:'order_test',razorpay_payment_id:'pay_pending',razorpay_signature:'signed'});
  assert.equal(h.success.length,0);
  assert.match(h.errors[0],/pay_pending/);
  assert.equal(h.values.size,1);
});

test('Existing GS checkout continues to use the original payment endpoint and local purchase record', async () => {
  const h = harness();
  await h.start('GS');
  assert.match(h.calls[0].url,/\/api\/payment\/create-order$/);
  assert.equal(h.gateway.modal,undefined);
  await h.gateway.handler({razorpay_order_id:'order_test',razorpay_payment_id:'pay_gs',razorpay_signature:'signed'});
  assert.deepEqual(h.success,[['pay_gs',9999]]);
  assert.ok(h.values.has('itopper_purchased_evals_student@example.com'));
});
