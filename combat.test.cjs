// Run with Node.js. No packages needed; tests exercise the real combat module.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const context = vm.createContext({window:{}});
for (const file of ['config.js','combat.js']) vm.runInContext(fs.readFileSync(path.join(__dirname,'src',file),'utf8'),context);
const {config,combat}=context.window.Riposte;
for(const [offset,expected] of [[-261,'early'],[-260,'success'],[-91,'success'],[-90,'perfect'],[0,'perfect'],[90,'perfect'],[91,'success'],[260,'success']]){
 const e=combat.createEngine(config,()=>0);e.start();e.tick(650);e.tick(800+offset);e.action('HIGH','keyboard');
 assert.equal(e.state.history[0].result,expected,`timing ${offset}`);
 e.tick(Math.max(0,-offset));
 assert.equal(e.state.opponent.stamina,expected==='perfect'?80:expected==='success'?88:100);
}
{
 const e=combat.createEngine(config,()=>0);e.start();e.tick(650);e.tick(1061);
 assert.equal(e.state.history[0].result,'missed');assert.equal(e.state.player.health,92);
 e.tick(650);e.openItems('keyboard');const clock=e.state.clock;e.tick(5000);assert.equal(e.state.clock,clock);
 e.cancelItems('keyboard');assert.equal(e.state.itemCount,2);
 e.useItem('keyboard');assert.equal(e.state.itemCount,2,'cannot use outside menu');
}
console.log('PASS: inclusive timing boundaries, penalties, pause clock, cancel count, invalid item use');
{
 const e=combat.createEngine(config,()=>0);e.start();e.action('CENTER','keyboard');let last=null,run=0;
 for(let i=0;i<20;i++){
  e.tick(650);const d=e.state.expectedDirection;run=d===last?run+1:1;last=d;assert(run<=2,'no triple ordinary direction');
  e.tick(800);e.action(d,'keyboard');e.tick(config.perfectFreezeMs);
 }
 console.log('PASS: no ordinary direction repeats more than twice');
}
