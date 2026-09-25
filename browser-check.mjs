import fs from 'node:fs';
import assert from 'node:assert/strict';
const phase = Number(process.argv[2] || 5);
const pageUrl = new URL('index.html', import.meta.url).href;
const output = new URL('verification/', import.meta.url);
fs.mkdirSync(output, {recursive:true});
const results = [];
const report = result => { results.push(result); console.log(JSON.stringify(result)); };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const targets = await fetch('http://127.0.0.1:9223/json/new?' + encodeURIComponent(pageUrl), {method:'PUT'}).then(r=>r.json());
const ws = new WebSocket(targets.webSocketDebuggerUrl);
let id = 0;
const pending = new Map(), errors = [];
ws.onmessage = e => { const m=JSON.parse(e.data); if(m.method==='Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text); if(m.id) {const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);} };
await new Promise(r=>ws.onopen=r);
const send=(method,params={})=>new Promise((resolve,reject)=>{pending.set(++id,{resolve,reject});ws.send(JSON.stringify({id,method,params}));});
const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
const snap=()=>ev('Riposte.snapshot()');
async function until(fn, timeout=5000) {const end=Date.now()+timeout;while(Date.now()<end){const s=await snap();if(fn(s))return s;await sleep(8);}throw Error('Timed out '+fn);}
async function click(selector){const p=await ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return ${selector==='#item-backdrop'?'{x:r.x+10,y:r.y+10}':'{x:r.x+r.width/2,y:r.y+r.height/2}'}})()`);await send('Input.dispatchMouseEvent',{type:'mousePressed',...p,button:'left',clickCount:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',...p,button:'left',clickCount:1});}
const keys={HIGH:['w','KeyW',87],LOW:['s','KeyS',83],LEFT:['a','KeyA',65],RIGHT:['d','KeyD',68],CENTER:[' ','Space',32],ITEM:['e','KeyE',69],CANCEL:['Escape','Escape',27]};
async function key(action, arrows=false){let [key,code,n]=keys[action];if(arrows&&['HIGH','LOW','LEFT','RIGHT'].includes(action)){[key,n]={HIGH:['ArrowUp',38],LOW:['ArrowDown',40],LEFT:['ArrowLeft',37],RIGHT:['ArrowRight',39]}[action];code=key;}for(const type of ['keyDown','keyUp'])await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:n});}
async function shot(name){const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(new URL(`${name}.png`,output),Buffer.from(r.data,'base64'));}
async function nextAttack(offset=-35){await until(s=>s.mode==='ATTACK');return until(s=>s.attack&&s.clock-s.attack.impact>=offset);}
async function settle(){return until(s=>s.mode!=='ATTACK');}
await send('Page.enable');await send('Runtime.enable');
try {
for(const viewport of [{name:'desktop',width:1100,height:1000,mobile:false},{name:'phone',width:360,height:800,mobile:true}]){
 await send('Emulation.setDeviceMetricsOverride',{...viewport,deviceScaleFactor:1});
 await send('Page.navigate',{url:pageUrl+'?verify='+Date.now()});await sleep(200);
 await click('#start-game');

 if(phase>=5) {
  // Native select keyboard interaction: options change only the next attack.
  async function choosePattern(index) {
    await click('#attack-pattern');
    for (const [key,code,n] of [['Home','Home',36],...Array.from({length:index},()=>['ArrowDown','ArrowDown',40]),['Enter','Enter',13]]) {
      for(const type of ['keyDown','keyUp']) await send('Input.dispatchKeyEvent',{type,key,code,windowsVirtualKeyCode:n});
    }
  }
  for(const [index,pattern] of [[1,'feint'],[2,'dual'],[3,'fast']]) {
    await choosePattern(index);await click('#start-game');
    let a=await until(s=>s.attack);assert.equal(a.attack.pattern,pattern,'pattern select');
    assert.equal(a.attack.impact-a.attack.start,pattern==='fast'?540:800);
    if(pattern==='feint') {const initial=a.expectedDirection;a=await until(s=>s.attack?.revealed);assert.notEqual(a.expectedDirection,initial);}
    if(pattern==='dual') {
      assert.equal(await ev('document.querySelectorAll(".threatened").length'),2);
      await shot('dual-telegraph-'+viewport.name);
      a=await until(s=>s.attack?.revealed);
      assert.equal(await ev('document.querySelectorAll(".threatened").length'),1);
    }
    a=await nextAttack();await click(`[data-action="${a.expectedDirection}"]`);a=await settle();
    assert.equal(a.opponent.stamina,80);assert.equal(a.player.health,pattern==='dual'?98:100);
    assert.equal(a.player.stamina,pattern==='dual'?96:100);
  }
  await choosePattern(0);await click('#start-game');
  // Every direction must work with WASD, arrows and real coordinate clicks.
  const seen={wasd:new Set(),arrows:new Set(),mouse:new Set()};
  const windups=new Set();let steps=0,comboPaused=false,centerMouse=false;
  if(!(await snap()).ability)await click('#ability-test');
  while(steps++<160) {
    let a=await snap();
    if(a.mode==='OVER') {
      assert.equal(a.opponent.health,0,'victory');
      await shot('victory-'+viewport.name);
      if(Object.values(seen).every(set=>set.size===4)&&centerMouse)break;
      await click('#start-game');continue;
    }
    if(a.combo) {
      a=await until(s=>s.mode==='OVER'||s.combo&&s.expectedDirection);
      if(a.mode==='OVER')continue;
      if(!comboPaused) {
        await key('ITEM');const p=await snap();await sleep(120);assert.equal((await snap()).clock,p.clock);
        await ev('window.dispatchEvent(new Event("blur"))');assert.equal((await snap()).pause,'FOCUS_PAUSE');
        await click('#focus-pause');assert.equal((await snap()).pause,'ITEM_PAUSE');await key('CANCEL');comboPaused=true;
      }
      const i=a.combo.index;
      if(a.expectedDirection==='CENTER'){await click('[data-action="CENTER"]');centerMouse=true;}else await key(a.expectedDirection);
      await until(s=>!s.combo||s.combo.index!==i);continue;
    }
    a=await nextAttack(-45);
    const direction=a.expectedDirection;
    if(!windups.has(direction)){await shot('windup-'+direction.toLowerCase()+'-'+viewport.name);windups.add(direction);}
    const method=!seen.wasd.has(direction)?'wasd':!seen.arrows.has(direction)?'arrows':'mouse';
    if(method==='mouse')await click(`[data-action="${direction}"]`);else await key(direction,method==='arrows');
    const after=await settle();
    assert(['perfect','success'].includes(after.history[0].result),'mapped response');
    seen[method].add(direction);
  }
  assert(Object.values(seen).every(set=>set.size===4),'all 12 direction mappings');assert(centerMouse);assert(comboPaused);
  await click('#start-game');await until(s=>s.mode==='OVER',30000);
  assert.equal((await snap()).player.health,0);await shot('defeat-'+viewport.name);
  await click('#start-game');let a=await snap();assert.equal(a.player.health,100);assert.equal(a.itemCount,2);assert.equal(a.player.broken,false);
  await click('[data-action="CENTER"]');assert.equal((await snap()).stance,'DEFENSIVE');await key('CENTER');assert.equal((await snap()).stance,'OFFENSIVE');
  // Repeat suppression remains valid during active combat.
  await until(s=>s.mode==='ATTACK');
  for(let i=0;i<3;i++)await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87,autoRepeat:i>0});
  assert.equal((await snap()).heldKeys.length,1);
  await send('Input.dispatchKeyEvent',{type:'keyUp',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
  assert.equal((await snap()).heldKeys.length,0);
  report({phase,viewport:viewport.name,patterns:'PASS',allTwelveMappings:'PASS',victoryDefeatRestart:'PASS',comboPauseFocusReturn:'PASS',centerMouse:'PASS'});
  await click('#start-game');
 }

 if(phase>=4){
  await until(s=>s.mode==='ATTACK');await settle();
  await nextAttack(-100);await click('#item-control');let p=await snap();assert.equal(p.pause,'ITEM_PAUSE');
  await shot('items-'+viewport.name);await sleep(550);let q=await snap();assert.equal(q.clock,p.clock);assert.equal(q.player.health,p.player.health);assert.equal(q.itemCount,2);
  await key('CANCEL');assert.equal((await snap()).itemCount,2);await settle();
  await until(s=>s.mode==='ATTACK');await key('ITEM');await click('#item-backdrop');assert.equal((await snap()).pause,null);
  await key('ITEM');await click('#item-cancel');assert.equal((await snap()).itemCount,2);
  for(const code of ['ShiftLeft','ShiftRight']) {await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Shift',code,windowsVirtualKeyCode:16});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Shift',code,windowsVirtualKeyCode:16});assert.equal((await snap()).pause,code==='ShiftLeft'?'ITEM_PAUSE':null);}
  await settle();await nextAttack(-100);await key('ITEM');p=await snap();await key('CENTER');
  q=await snap();assert.equal(q.itemCount,1);assert.equal(q.player.health,p.player.health);assert(q.itemUseEndsAt!==null);
  await key(q.expectedDirection);await sleep(150);assert.equal((await snap()).player.health,p.player.health);
  q=await until(s=>s.itemUseEndsAt===null);assert.equal(q.player.health,Math.min(100,p.player.health-8+25),'exposure damage then heal');
  await key('ITEM');await key('HIGH');await click('.item-choice');q=await until(s=>s.itemUseEndsAt===null);assert.equal(q.itemCount,0);assert(await ev('document.querySelector("#item-control").disabled'));
  await key('ITEM');assert.equal((await snap()).pause,null);
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'w',code:'KeyW',windowsVirtualKeyCode:87});
  await ev('window.dispatchEvent(new Event("blur"))');p=await snap();assert.equal(p.pause,'FOCUS_PAUSE');assert.equal(p.heldKeys.length,0);await sleep(200);assert.equal((await snap()).clock,p.clock);await click('#focus-pause');
  report({phase,viewport:viewport.name,items:'PASS',pauseAndExposure:'PASS',bothShifts:'PASS',focusHandler:'PASS'});
  await click('#start-game');
 }
 if(phase>=3){
  if(!(await snap()).ability)await click('#ability-test');
  for(let i=0;i<5;i++){let a=await nextAttack();await key(a.expectedDirection,i%2===0);await settle();}
  let c=await until(s=>s.combo&&s.expectedDirection);
  assert.equal(c.combo.broken,'opponent');assert.equal(c.opponent.stamina,0);
  assert(c.combo.prompts.includes('CENTER'));
  await shot('combo-'+viewport.name);
  // Wrong, center correct, timeout, mouse correct: all four portions must play.
  await key(['HIGH','LOW'].find(d=>d!==c.expectedDirection));
  c=await until(s=>s.combo?.index===1&&s.expectedDirection==='CENTER');await key('CENTER');
  await until(s=>s.combo?.index===2&&s.expectedDirection);
  c=await until(s=>s.combo?.index===3&&s.expectedDirection);await click(`[data-action="${c.expectedDirection}"]`);
  c=await until(s=>!s.combo);assert.equal(c.opponent.health,84);assert.equal(c.opponent.stamina,60);assert.equal(c.stance,'OFFENSIVE');
  await click('#start-game');
  c=await until(s=>s.combo?.broken==='player',15000);assert.equal(c.player.health,52);
  for(let i=0;i<4;i++){c=await until(s=>s.combo?.index===i&&s.expectedDirection);if(i%2)await click(`[data-action="${c.expectedDirection}"]`);else await key(c.expectedDirection);await until(s=>!s.combo||s.combo.index>i);}
  c=await snap();assert.equal(c.player.health,44);assert.equal(c.player.stamina,60);assert.equal(c.player.broken,false);
  report({phase,viewport:viewport.name,breaksAndCombos:'PASS',center:'PASS',continueAfterWrongAndMiss:'PASS'});
  await click('#start-game');
 }
 let s=await nextAttack();await key(s.expectedDirection);s=await settle();assert.equal(s.opponent.stamina,80,'perfect offense');
 await nextAttack(-750);await key('HIGH');s=await settle();assert.equal(s.player.stamina,82,'early penalty');assert.equal(s.player.health,92);
 await key('CENTER');s=await nextAttack();await key(s.expectedDirection,true);s=await settle();assert.equal(s.player.stamina,100,'perfect recovery');assert.equal(s.opponent.stamina,80,'defense not offense');
 s=await nextAttack(130);await click(`[data-action="${s.expectedDirection}"]`);s=await settle();assert.equal(s.history[0].result,'success','late window mouse');
 s=await nextAttack();await key(['HIGH','LOW','LEFT','RIGHT'].find(d=>d!==s.expectedDirection));s=await settle();assert.equal(s.history[0].result,'wrong');
 await until(s=>s.mode==='ATTACK');await settle();s=await snap();assert.equal(s.history[0].result,'missed');
 await until(s=>s.mode==='ATTACK');await shot('m'+phase+'-'+viewport.name);
 const layout=await ev(`(()=>{const boxes=[...document.querySelectorAll('[data-action]')].map(e=>{const r=e.getBoundingClientRect();return {action:e.dataset.action,x:r.x,y:r.y,w:r.width,h:r.height}});return {width:innerWidth,scroll:document.body.scrollWidth,boxes}})()`);
 assert.equal(layout.scroll,layout.width,'horizontal overflow');for(const b of layout.boxes){assert(b.x>=0&&b.x+b.w<=layout.width,'control in bounds '+b.action);assert(b.w>=44&&b.h>=44,'touch size '+b.action);}
 report({phase,viewport:viewport.name,ordinary:'PASS',layout,errors});
}
assert.equal(errors.length,0,'browser errors');
} finally {fs.writeFileSync(new URL('results.json',output), JSON.stringify({checkedAt:new Date().toISOString(),results,errors},null,2));await send('Page.close');ws.close();}
