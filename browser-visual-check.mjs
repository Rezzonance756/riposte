import fs from 'node:fs';
import assert from 'node:assert/strict';
const output = new URL('verification/', import.meta.url);
const target=await fetch('http://127.0.0.1:9223/json/new?'+encodeURIComponent(new URL('index.html',import.meta.url).href),{method:'PUT'}).then(r=>r.json());
const ws=new WebSocket(target.webSocketDebuggerUrl);let id=0;const jobs=new Map();
ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const j=jobs.get(m.id);jobs.delete(m.id);m.error?j.reject(m.error):j.resolve(m.result);}};
await new Promise(r=>ws.onopen=r);
const send=(method,params={})=>new Promise((resolve,reject)=>{jobs.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>(await send('Runtime.evaluate',{expression,returnByValue:true})).result.value;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const snap=()=>ev('Riposte.snapshot()');
async function until(f){for(let i=0;i<1200;i++){const s=await snap();if(f(s))return s;await sleep(10);}throw Error('timed out '+f);}
const point=selector=>ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
async function click(selector,touch=false){const p=await point(selector);if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}else{for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',clickCount:1});}}
async function key(action){const [key,code,n]={HIGH:['w','KeyW',87],LOW:['s','KeyS',83],LEFT:['a','KeyA',65],RIGHT:['d','KeyD',68],CENTER:[' ','Space',32]}[action];for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:n});}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(new URL(name+'.png',output),Buffer.from(r.data,'base64'));}
await send('Page.enable');await send('Runtime.enable');
const results=[];
try{
 for(const viewport of [{name:'desktop',width:1100,height:1000,mobile:false},{name:'phone',width:360,height:800,mobile:true}]){
  await send('Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1});
  await send('Page.navigate',{url:new URL('index.html',import.meta.url).href});await sleep(150);await click('#start-game');await key('CENTER');
  const poses=new Set();
  while(poses.size<4){
   let s=await until(s=>s.attack&&s.clock-s.attack.start<250);
   assert.equal(await ev('document.querySelector("#opponent-fighter").dataset.pose'),s.expectedDirection.toLowerCase());
   if(!poses.has(s.expectedDirection)){await shot('pose-'+s.expectedDirection.toLowerCase()+'-'+viewport.name);poses.add(s.expectedDirection);}
   s=await until(s=>s.attack&&s.clock-s.attack.impact>=-35);await key(s.expectedDirection);await until(s=>!s.attack);
  }
  await shot('perfect-'+viewport.name);
  await until(s=>s.attack);await until(s=>s.effect?.kind==='hit');await shot('hit-'+viewport.name);
  await click('#item-control',viewport.mobile);assert.equal((await snap()).pause,'ITEM_PAUSE');
  await shot('menu-final-'+viewport.name);await click('.item-choice',viewport.mobile);
  assert.equal(await ev('document.querySelector("#player-fighter").dataset.pose'),'healing');await shot('healing-'+viewport.name);
  await until(s=>s.itemUseEndsAt===null);
  const other=await send('Target.createTarget',{url:'about:blank'});await send('Target.activateTarget',{targetId:other.targetId});await sleep(150);
  const naturalFocus=(await snap()).pause;
  await send('Target.closeTarget',{targetId:other.targetId});await send('Target.activateTarget',{targetId:target.id});
  if((await snap()).pause==='FOCUS_PAUSE')await click('#focus-pause');
  assert(await ev('document.querySelector("#debug-panel").hidden'));
  await click('#debug-toggle');assert(!(await ev('document.querySelector("#debug-panel").hidden')));
  await click('#debug-toggle');assert(await ev('document.querySelector("#debug-panel").hidden'));
  await click('#keyboard-help');assert(await ev('getComputedStyle(document.querySelector(".key-help")).visibility==="hidden"'));
  assert(await ev(`[...document.querySelectorAll('.zone-icon')].every(e => getComputedStyle(e).visibility === 'visible' && e.textContent.trim().length > 0)`),'direction symbols remain visible without key help');
  if(viewport.mobile){const s=await until(s=>s.attack&&s.clock-s.attack.impact>=-40);await click(`[data-action="${s.expectedDirection}"]`,true);const end=await until(s=>!s.attack);assert(['perfect','success'].includes(end.history[0].result));}
  await shot('clean-'+viewport.name);
  const boxes=await ev(`(()=>{const f=document.querySelector('#battlefield').getBoundingClientRect();const boxes=[...document.querySelectorAll('[data-action]')].map(e=>{const r=e.getBoundingClientRect();return {action:e.dataset.action,x:r.x,y:r.y,w:r.width,h:r.height}});return {height:innerHeight,width:innerWidth,scroll:document.body.scrollWidth,field:{top:f.top,bottom:f.bottom},boxes}})()`);
  for(const a of boxes.boxes){assert(a.y>=boxes.field.top&&a.y+a.h<=boxes.field.bottom);for(const b of boxes.boxes){if(a.action===b.action)continue;assert(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y),'overlap '+a.action+'/'+b.action);}}
  results.push({viewport:viewport.name,windupPoses:[...poses],touch:viewport.mobile?'PASS':'not applicable',diagnosticToggle:'PASS',keyHelp:'PASS',noControlOverlap:'PASS',naturalTabFocus:naturalFocus,boxes});
 }
 console.log(JSON.stringify(results,null,2));
}finally{fs.writeFileSync(new URL('visual-results.json',output),JSON.stringify(results,null,2));await send('Page.close');ws.close();}
