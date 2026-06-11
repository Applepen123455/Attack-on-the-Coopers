const C=document.getElementById('c'),X=C.getContext('2d'),M=document.getElementById('m'),MX=M.getContext('2d'),$=id=>document.getElementById(id);let W=0,H=0,DPR=Math.min(2,devicePixelRatio||1);function size(){C.width=innerWidth*DPR;C.height=innerHeight*DPR;C.style.width=innerWidth+'px';C.style.height=innerHeight+'px';X.setTransform(DPR,0,0,DPR,0,0);W=innerWidth;H=innerHeight}onresize=size;size();
const R=(a,b=0)=>Math.random()*(a-b)+b,cl=(v,a,b)=>Math.max(a,Math.min(b,v)),di=(a,b,c,d)=>Math.hypot(a-c,b-d),pick=a=>a[Math.random()*a.length|0];class RNG{constructor(s){this.s=s>>>0}n(){let t=this.s+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}r(a,b){return this.n()*(b-a)+a}i(a,b){return this.r(a,b+1)|0}p(a){return a[this.i(0,a.length-1)]}}
let K=new Set,ms={x:0,y:0,d:0},P=null,G={run:0,pause:0,over:0,t:0,seed:0,rng:null,rooms:new Map,rx:0,ry:0,cur:null,en:[],bs:[],eb:[],lt:[],pt:[],txt:[],rings:[],mines:[],sentries:[],decoys:[],barriers:[],links:[],keys:0,core:0,kills:0,drones:0,rift:1,combo:0,comboT:0,shake:0,flash:0,art:[],cam:{x:0,y:0}};
const DEFAULT_BINDINGS={up:'KeyW',down:'KeyS',left:'KeyA',right:'KeyD',dash:'Space',shock:'KeyQ',repair:'KeyC',lightning:'KeyZ',interact:'KeyE',pause:'KeyP',codex:'KeyI',save:'F5',load:'F9',weapon1:'Digit1',weapon2:'Digit2',weapon3:'Digit3'};
const BIND_LABELS={up:'Move up',down:'Move down',left:'Move left',right:'Move right',dash:'Dash',shock:'Shockwave',repair:'Repair',lightning:'Chain lightning',interact:'Interact',pause:'Pause',codex:'Codex',save:'Quick save',load:'Quick load',weapon1:'Weapon 1',weapon2:'Weapon 2',weapon3:'Weapon 3'};
let settings={sens:1,binds:{...DEFAULT_BINDINGS}},rebinding=null;
try{let saved=JSON.parse(localStorage.ATTACK_COOPERS_SETTINGS||'{}');settings.sens=Number(saved.sens)||1;settings.binds={...DEFAULT_BINDINGS,...(saved.binds||{})}}catch(e){console.warn('Failed to load settings, using defaults:',e)}

function openPause(){if(!P||!G.run)return;G.pause=1;renderSettings();$('pausePanel').style.display='flex'}
function closePause(){G.pause=0;$('pausePanel').style.display='none'}

function saveSettings(){try{localStorage.ATTACK_COOPERS_SETTINGS=JSON.stringify(settings)}catch(e){console.warn('Failed to save settings:',e);toast('Could not save settings')}}
function keyLabel(code){return code.replace('Key','').replace('Digit','').replace('Arrow','Arrow ').replace('Space','Spacebar')}
function isDown(action){return K.has(settings.binds[action])}
function angleDelta(a,b){return Math.atan2(Math.sin(b-a),Math.cos(b-a))}
function renderSettings(){
  let renderHost=(hostId)=>{
    let host=$(hostId); if(!host)return;
    host.innerHTML=Object.keys(DEFAULT_BINDINGS).map(a=>`<div class="settingitem"><div class="row"><b>${BIND_LABELS[a]}</b></div><button class="bindbtn ${rebinding==a?'listening':''}" data-bind="${a}">${rebinding==a?'Press a key...':keyLabel(settings.binds[a])}</button></div>`).join('');
    host.querySelectorAll('[data-bind]').forEach(b=>b.onclick=()=>{rebinding=b.dataset.bind;renderSettings();toast('Press a key for '+BIND_LABELS[rebinding])});
  };
  let s=$('sens'),sl=$('sensLabel');
  if(s){s.value=settings.sens;sl.textContent=Number(settings.sens).toFixed(2);s.oninput=e=>{settings.sens=parseFloat(e.target.value);sl.textContent=settings.sens.toFixed(2);if($('pauseSens')){$('pauseSens').value=settings.sens;$('pauseSensLabel').textContent=settings.sens.toFixed(2)}saveSettings()}}
  let ps=$('pauseSens'),psl=$('pauseSensLabel');
  if(ps){ps.value=settings.sens;psl.textContent=Number(settings.sens).toFixed(2);ps.oninput=e=>{settings.sens=parseFloat(e.target.value);psl.textContent=settings.sens.toFixed(2);if($('sens')){$('sens').value=settings.sens;$('sensLabel').textContent=settings.sens.toFixed(2)}saveSettings()}}
  renderHost('bindSettings'); renderHost('pauseBindSettings');
}
function resetKeybinds(){settings.binds={...DEFAULT_BINDINGS};settings.sens=1;saveSettings();renderSettings();toast('Settings reset')}

onkeydown=e=>{let typing=e.target&&['INPUT','TEXTAREA'].includes(e.target.tagName);if(typing){if(e.key=='Enter'&&e.target.id=='puzzleAnswer')submitPuzzle();return}if(rebinding){e.preventDefault();settings.binds[rebinding]=e.code;rebinding=null;saveSettings();renderSettings();toast('Keybind updated');return}if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)||e.code==settings.binds.save||e.code==settings.binds.load)e.preventDefault();K.add(e.code);if(e.code==settings.binds.pause){if($('pausePanel').style.display=='flex')closePause();else openPause();}if(e.code==settings.binds.codex)codex();if(e.code=='Escape'){if($('pausePanel').style.display=='flex'){e.preventDefault();closePause();return}if($('forgeResult').style.display=='flex'){e.preventDefault();skipForgedGun();return}if($('shopPanel').style.display=='flex'){e.preventDefault();closeShop();return}if($('decodePanel').style.display=='flex'){e.preventDefault();closePuzzle();return}if(P&&G.run){e.preventDefault();openPause();return}}if(e.code==settings.binds.save){e.preventDefault();save()}if(e.code==settings.binds.load){e.preventDefault();load()}if(P){if(e.code==settings.binds.weapon1&&weps[0])P.w=0;if(e.code==settings.binds.weapon2&&weps[1])P.w=1;if(e.code==settings.binds.weapon3&&weps[2])P.w=2}};onkeyup=e=>K.delete(e.code);onmousemove=e=>{ms.x=e.clientX;ms.y=e.clientY};onmousedown=()=>ms.d=1;onmouseup=()=>ms.d=0;
let puzzle=null,craftedGun=null;
let runStats={damage:0,shots:0,rooms:0,startTime:0,fav:{},bestWeapon:'Pulse'};
let meta={wins:0,hardWins:0,epsteinWins:0,unlocks:[]};
try{meta={...meta,...JSON.parse(localStorage.ATTACK_COOPERS_META||'{}')}}catch(e){console.warn('Failed to load meta progress, using defaults:',e)}
function saveMeta(){try{localStorage.ATTACK_COOPERS_META=JSON.stringify(meta)}catch(e){console.warn('Failed to save meta:',e)}}
function recordShot(w){runStats.shots++;runStats.fav[w[0]]=(runStats.fav[w[0]]||0)+1;runStats.bestWeapon=Object.entries(runStats.fav).sort((a,b)=>b[1]-a[1])[0]?.[0]||w[0]}
function rarityForGun(g){if(g[9]=='bad')return 'cursed';let dmg=g[3],shots=g[6],pierce=g[7],rate=g[1];let score=dmg+shots*3+pierce*8+(rate<.08?14:0);return score>95?'legendary':score>55?'epic':score>25?'rare':'common'}
function rarityClass(r){return 'rarity-'+String(r).toLowerCase()}
function unlockReward(name){if(!meta.unlocks.includes(name)){meta.unlocks.push(name);saveMeta();let d=document.createElement('div');d.className='unlockToast';d.textContent='UNLOCKED: '+name;document.body.appendChild(d);setTimeout(()=>d.remove(),2400)}}

const T=56,RW=18,RH=12,PW=RW*T,PH=RH*T,PLAYER_DAMAGE_MULT=.78,TARGET_ROOM_COUNT=37,MINI_BOSS_ROOM_COUNT=3,BOSS_ROOM_COUNT=3,STARTER_WEAPON=['Pulse',.11,780,14,.04,2,1,0,'#62e3ff'],weps=[STARTER_WEAPON.slice()];
const FORGE_GUNS=[
['Sunspike Carbine',.09,900,18,.035,3,1,1,'#fff08a','good','Fast, accurate, and efficient.'],
['Void Choir',.34,650,13,.28,10,9,0,'#b28dff','good','Huge spread burst. Great close-range damage.'],
['Rust Pipe Mk.I',.42,520,9,.2,8,1,0,'#9aa3a8','bad','A weak, ugly weapon. Probably worse than Pulse.'],
['Glass Cannon',.72,1250,68,.015,20,1,4,'#ff8fab','good','Very high damage, very expensive to fire.'],
['Leaky Blaster',.2,620,7,.18,9,2,0,'#6bff9e','bad','Shoots often, but the damage is terrible.'],
['Brisket Launcher',.55,500,44,.1,16,2,1,'#ffd166','mid','Slow but chunky double shots.'],
['Needle Printer',.045,860,6,.055,2,1,0,'#62e3ff','mid','Extremely fast, low damage, easy to control.'],
['Chaos Hose',.08,700,10,.75,6,3,0,'#ff6bcb','bad','Wild and inaccurate, but funny.'],
['Royal Railgun',.9,1400,92,.005,25,1,6,'#ffffff','good','Rare, brutal, and piercing.'],
['Wet Cardboard Gun',.5,430,5,.5,7,1,0,'#c0a070','bad','It technically fires.']
];

function resetWeapons(){weps.splice(0,weps.length,STARTER_WEAPON.slice())}
function ensureWeaponIndex(){if(!weps.length)resetWeapons();if(!P)return 0;P.w=Math.max(0,Math.min((P.w|0),weps.length-1));return P.w}
function gunProfile(w){
  let name=(w&&w[0]||'Pulse').toLowerCase(), accent=(w&&w[8])||'#62e3ff';
  let p={name:w&&w[0]||'Pulse',accent,body:'#284255',metal:'#dff7ff',trim:'#11202b',grip:'#0b1218',stock:'#223442',len:44,height:12,stockLen:14,barrel:16,muzzle:5,scope:0,scatter:0,launcher:0,scrap:0,needle:0,rail:0};
  if(name.includes('sunspike')){p.body='#5f5a24';p.metal='#fff6b2';p.stock='#49462d';p.len=46;p.barrel=18;p.scope=1}
  else if(name.includes('void choir')||name.includes('shard')){p.body='#4f355d';p.metal='#ead7ff';p.stock='#362241';p.len=39;p.height=14;p.barrel=10;p.scatter=1}
  else if(name.includes('rust pipe')){p.body='#5e5d5a';p.metal='#b8b4ae';p.stock='#4a3b34';p.trim='#2f2b28';p.len=40;p.height=11;p.barrel=14;p.scrap=1}
  else if(name.includes('glass cannon')){p.body='#5c2435';p.metal='#ffd7e6';p.stock='#391321';p.len=54;p.height=15;p.barrel=18;p.launcher=1}
  else if(name.includes('leaky blaster')){p.body='#355444';p.metal='#c7ffe5';p.stock='#22372d';p.len=43;p.height=12;p.barrel=14;p.scrap=1}
  else if(name.includes('brisket launcher')){p.body='#6a4125';p.metal='#ffd89d';p.stock='#4e2912';p.len=48;p.height=16;p.barrel=14;p.launcher=1}
  else if(name.includes('needle printer')){p.body='#234a58';p.metal='#d5fbff';p.stock='#17323c';p.len=52;p.height=8;p.barrel=24;p.needle=1}
  else if(name.includes('chaos hose')){p.body='#5b2146';p.metal='#ffb2e6';p.stock='#3b1230';p.len=45;p.height=11;p.barrel=14;p.scrap=1}
  else if(name.includes('royal railgun')||name.includes('rail')){p.body='#3c3f64';p.metal='#ffffff';p.stock='#242842';p.len=58;p.height=10;p.barrel=26;p.scope=1;p.rail=1}
  else if(name.includes('wet cardboard')){p.body='#7b6540';p.metal='#d0bf95';p.stock='#5e4727';p.trim='#4b3a22';p.len=41;p.height=11;p.barrel=12;p.scrap=1}
  else if(name.includes('pulse')){p.body='#244a58';p.metal='#c8fdff';p.stock='#1b313d';p.len=44;p.height=11;p.barrel=16;p.scope=1}
  return p;
}
function drawHeldWeapon(w,recoil,frameR,bob){
  let g=gunProfile(w),x=frameR*.52-recoil*.55,y=frameR*.15+bob*.12,shoulderX=-frameR*.08,shoulderY=frameR*.32+bob*.1;
  let rearHandX=x+8,rearHandY=y+g.height*.78,frontHandX=x+Math.min(g.len-10,g.len*.58),frontHandY=y+g.height*.58;
  X.save();
  X.lineCap='round';
  X.strokeStyle='rgba(219,188,160,.95)';
  X.lineWidth=8;
  X.beginPath();X.moveTo(shoulderX,shoulderY);X.lineTo(rearHandX-4,rearHandY+4);X.stroke();
  X.strokeStyle='rgba(206,176,150,.88)';
  X.lineWidth=7;
  X.beginPath();X.moveTo(shoulderX+6,shoulderY-6);X.lineTo(frontHandX-2,frontHandY+3);X.stroke();

  X.fillStyle=g.stock;rr(x-g.stockLen,y+3,g.stockLen,Math.max(8,g.height-2),3);X.fill();

  let body=X.createLinearGradient(x,y,x+g.len,y+g.height);
  body.addColorStop(0,g.metal);body.addColorStop(.18,g.accent);body.addColorStop(.58,g.body);body.addColorStop(1,g.trim);
  X.fillStyle=body;rr(x,y,g.len,g.height,4);X.fill();
  X.fillStyle='rgba(255,255,255,.16)';rr(x+2,y+2,g.len*.62,2,1.2);X.fill();

  if(g.scope){
    X.fillStyle='#d8f8ff';rr(x+g.len*.2,y-6,g.len*.22,5,2);X.fill();
    X.fillStyle='#1c2d37';rr(x+g.len*.22,y-4,g.len*.18,7,2);X.fill();
  }
  if(g.rail){
    X.fillStyle='rgba(255,255,255,.82)';rr(x+g.len*.18,y-4,g.len*.56,2,1);X.fill();
    X.fillStyle='#8ea0ff';rr(x+g.len*.62,y+3,10,4,1.6);X.fill();
  }
  if(g.launcher){
    X.fillStyle='rgba(255,255,255,.12)';
    X.beginPath();X.ellipse(x+g.len*.48,y+g.height*.5,g.len*.2,g.height*.46,0,0,7);X.fill();
  }
  if(g.scatter){
    X.fillStyle=g.metal;
    for(let i=0;i<3;i++){rr(x+g.len-2,y+2+i*3,14,2,1);X.fill()}
  }else if(g.needle){
    X.fillStyle=g.metal;rr(x+g.len-1,y+g.height*.38,g.barrel+8,2.4,1);X.fill();
    X.fillStyle='rgba(255,255,255,.5)';rr(x+g.len+g.barrel+5,y+g.height*.38,4,2.2,1);X.fill();
  }else if(g.launcher){
    X.fillStyle='#2e2018';rr(x+g.len-3,y+1,g.barrel+8,g.height-2,5);X.fill();
    X.strokeStyle='rgba(255,255,255,.22)';X.lineWidth=2;X.beginPath();X.arc(x+g.len+g.barrel+3,y+g.height*.5,g.height*.38,-1.3,1.3);X.stroke();
  }else{
    X.fillStyle=g.metal;rr(x+g.len-2,y+g.height*.3,g.barrel,Math.max(3,g.height*.38),2);X.fill();
  }

  X.fillStyle=g.grip;rr(x+g.len*.24,y+g.height-2,7,16,2);X.fill();
  X.fillStyle='rgba(0,0,0,.24)';rr(x+g.len*.32,y+g.height-1,4,10,1.5);X.fill();

  if(g.scrap){
    X.save();X.translate(x+g.len*.58,y+g.height*.18);X.rotate(-.16);
    X.fillStyle='rgba(208,188,108,.45)';rr(-5,0,14,4,1.4);X.fill();
    X.restore();
    X.fillStyle='rgba(255,255,255,.16)';rr(x+g.len*.05,y+g.height*.72,12,2,1);X.fill();
  }

  X.fillStyle='rgba(255,255,255,.86)';rr(x+g.len+g.barrel-1,y+g.height*.32,g.muzzle,Math.max(3,g.height*.34),1.6);X.fill();
  X.fillStyle='rgba(0,0,0,.28)';rr(x+g.len+g.barrel-2,y+g.height*.42,Math.max(2,g.muzzle-1),1.5,1);X.fill();

  X.fillStyle='rgba(233,206,178,.98)';
  X.beginPath();X.arc(rearHandX,rearHandY,4.6,0,7);X.fill();
  X.beginPath();X.arc(frontHandX,frontHandY,4.3,0,7);X.fill();
  X.restore();
}


function hexRgb(h){h=(h||'#ffffff').replace('#','');if(h.length===3)h=h.split('').map(x=>x+x).join('');let n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
function rgba(h,a){let r=hexRgb(h);return`rgba(${r[0]},${r[1]},${r[2]},${a})`}
function rr(x,y,w,h,r){X.beginPath();X.roundRect(x,y,w,h,r)}
function softShadow(x,y,r,a=.28){X.save();X.fillStyle=`rgba(0,0,0,${a})`;X.beginPath();X.ellipse(x,y+r*.78,r*1.15,r*.45,0,0,7);X.fill();X.restore()}
function glow(x,y,r,c,a=.16){X.save();let g=X.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(c,a));g.addColorStop(1,rgba(c,0));X.fillStyle=g;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.restore()}
function drawMicroDust(){X.save();X.globalCompositeOperation='screen';for(let i=0;i<42;i++){let x=(i*149+G.t*18)%W,y=(i*263+G.t*9)%H;X.fillStyle='rgba(180,230,255,.035)';X.beginPath();X.arc(x,y,1+(i%3)*.35,0,7);X.fill()}X.restore()}function drawScanlines(){X.save();X.globalAlpha=.03;X.fillStyle='#dff7ff';for(let y=(G.t*18)%7;y<H;y+=7)X.fillRect(0,y,W,1);X.restore()}
function drawScanlines(){X.save();X.globalAlpha=.035;X.fillStyle='#dff7ff';for(let y=(G.t*18)%6;y<H;y+=6)X.fillRect(0,y,W,1);X.restore()}

const CHARACTERS=[{id:'char0',name:'Sheldon Cooper',role:'Precision Controller',summary:'Stronger shockwave, higher crit chance, and a calmer reactor for accurate play.',focus:'Shockwave focus',passive:'Pulse Etiquette: crit-focused controller with extended shockwave reach.',img:'images/sheldon-cooper.png',apply:p=>{p.qc*=0.82;p.qr+=55;p.cr+=0.08;p.cm+=0.25;p.er+=1;}},{id:'char1',name:'Georgie Cooper',role:'Skirmisher',summary:'Faster movement, stronger damage, and shorter dash cooldowns for aggressive play.',focus:'Mobility & overdrive',passive:'Kinetic Surge: gains extra speed and dash efficiency.',img:'images/georgie-cooper.png',apply:p=>{p.sp*=1.14;p.dcMax*=0.78;p.dm*=1.12;p.heat=18;}},{id:'char2',name:'Missy Cooper',role:'Tech Specialist',summary:'Larger energy pool plus boosted chain lightning and sentry tools.',focus:'Energy tech',passive:'Arc Buddy: enhanced energy economy and deployables.',img:'images/missy-cooper.png',apply:p=>{p.me+=24;p.e=p.me;p.er+=3;p.chainPow+=0.55;p.sentryPow+=0.45;}},{id:'char3',name:'Mary Cooper',role:'Support',summary:'Improved repair pulse, passive regeneration, and one extra mercy revive.',focus:'Healing support',passive:'Restoration Field: starts with passive regen and stronger repair pulse.',img:'images/mary-cooper.png',apply:p=>{p.mh+=8;p.h=p.mh;p.ms+=6;p.s=p.ms;p.repairPow+=0.6;p.passive+=0.45;p.mercy+=1;}},{id:'char4',name:'Meemaw',role:'Tank',summary:'Extra hull, armor, and stronger barriers and mines for area control.',focus:'Defense & area control',passive:'Fortress Protocol: tougher frame with stronger barriers and mine damage.',img:'images/meemaw.png',apply:p=>{p.mh+=22;p.h=p.mh;p.ms+=8;p.s=p.ms;p.armor+=2;p.barrierPow+=0.6;p.minePow+=0.45;}},{id:'char5',name:'George Cooper',role:'Frontline Veteran',summary:'A durable all-rounder with extra hull, sturdier armor, and faster shield recovery for steady runs.',focus:'Survivability & steady pressure',passive:'Steady Presence: starts tougher, regenerates shields faster, and gets a small damage boost.',img:'images/george-cooper.png',apply:p=>{p.mh+=14;p.h=p.mh;p.ms+=5;p.s=p.ms;p.armor+=1;p.sr+=2;p.dm*=1.05;}}];
let selectedCharacter=Math.max(0,Math.min(CHARACTERS.length-1,parseInt(localStorage.NEON_RELIC_SELECTED_CHAR||'0',10)||0));
const FACE_CROPS=[[.22,.02,.56,.66],[.29,.03,.42,.48],[.15,.02,.70,.62],[.12,.03,.76,.63],[.31,.04,.40,.54],[.12,.02,.76,.56]];
const PLAYER_IMG=new Image();PLAYER_IMG.decoding='async';PLAYER_IMG.onerror=function(){console.warn('Failed to load player image:',this.src)};
function characterAt(i){return CHARACTERS[Math.max(0,Math.min(CHARACTERS.length-1,i|0))]||CHARACTERS[0]}
function stampCharacterFields(p,idx=selectedCharacter){let c=characterAt(idx);p.charId=Math.max(0,Math.min(CHARACTERS.length-1,idx|0));p.charName=c.name;p.charRole=c.role;p.charSummary=c.summary;p.charFocus=c.focus;p.charPassive=c.passive;return p}
function applyCharacter(p,idx=selectedCharacter){let c=characterAt(idx);stampCharacterFields(p,idx);c.apply(p);p.h=cl(p.h,0,p.mh);p.s=cl(p.s,0,p.ms);p.e=cl(p.e,0,p.me);return p}
function setCharacter(idx){selectedCharacter=Math.max(0,Math.min(CHARACTERS.length-1,idx|0));localStorage.NEON_RELIC_SELECTED_CHAR=selectedCharacter;let c=characterAt(selectedCharacter);PLAYER_IMG.src=c.img;document.querySelectorAll('.charcard').forEach((el,i)=>el.classList.toggle('sel',i===selectedCharacter));let info=$('charInfo');if(info)info.innerHTML=`<div class="row"><b>${c.name}</b><span class="badge">${c.role}</span></div><div class="muted">${c.summary}</div><div class="muted"><b>Ability focus:</b> Shockwave · repair · chain lightning</div><div class="muted"><b>Passive bonus:</b> ${c.passive}</div>`}
function renderCharacterSelect(){let host=$('charSelect');if(!host)return;host.innerHTML=CHARACTERS.map((c,i)=>`<button type="button" class="charcard${i===selectedCharacter?' sel':''}" data-char="${i}"><img src="${c.img}" alt="${c.name}" onerror="this.onerror=null;this.src='images/placeholder-character.png'"><b>${c.name}</b><div class="badge">${c.role}</div><div class="muted" style="margin-top:8px">${c.summary}</div><div class="muted" style="margin-top:6px"><b>Focus:</b> Shockwave · repair · chain lightning</div></button>`).join('');host.querySelectorAll('.charcard').forEach(el=>el.onclick=()=>setCharacter(+el.dataset.char));setCharacter(selectedCharacter)}

renderCharacterSelect();

const VIEW_SCALE=1.24;
let selectedDifficulty=(localStorage.NEON_RELIC_DIFFICULTY||'medium');
const EPSTEIN_IMG=new Image();EPSTEIN_IMG.decoding='async';EPSTEIN_IMG.onerror=function(){console.warn('Failed to load image:',this.src)};EPSTEIN_IMG.src="images/ich-bin-ein-heidelberger.png";
const EPSTEIN_CROP=[.18,.05,.64,.72];
const ALT_ENEMY_IMG=new Image();ALT_ENEMY_IMG.decoding='async';ALT_ENEMY_IMG.onerror=function(){console.warn('Failed to load image:',this.src)};ALT_ENEMY_IMG.src='images/alt-enemy.png';
const ALT_ENEMY_CROP=[0.245,0.03,0.515,0.84];
const MINIBOSS_IMG=new Image();MINIBOSS_IMG.decoding='async';MINIBOSS_IMG.onerror=function(){console.warn('Failed to load image:',this.src)};MINIBOSS_IMG.src='images/miniboss-face.png';
const MINIBOSS_CROP=[0.215,0.03,0.57,0.62];

const DIFFICULTIES={
  easy:{id:'easy',name:'Easy',badge:'Easy',summary:'Still forgiving, but now has real pressure and tougher enemies.',enemyHp:1.02,enemySpeed:.98,enemyDamage:1.48,enemyFire:1.18,enemyBullet:1.02,enemyCount:0,eliteAdd:.00,playerHull:.82,playerShield:.82,playerEnergy:.92,armorAdd:0,shop:.95,xp:1.05,loot:1.08,bossAdd:0,epstein:false},
  medium:{id:'medium',name:'Medium',badge:'Medium',summary:'Harder normal mode with more enemies, stronger bosses, and less free safety.',enemyHp:1.22,enemySpeed:1.08,enemyDamage:1.28,enemyFire:1.08,enemyBullet:1.10,enemyCount:1,eliteAdd:.03,playerHull:.74,playerShield:.72,playerEnergy:.86,armorAdd:0,shop:1.08,xp:.98,loot:.96,bossAdd:0,epstein:false},
  hard:{id:'hard',name:'Hard',badge:'Hard',summary:'Serious dungeon pressure: tougher waves, more elites, and less forgiveness.',enemyHp:1.45,enemySpeed:1.18,enemyDamage:2.10,enemyFire:.98,enemyBullet:1.18,enemyCount:2,eliteAdd:.08,playerHull:.66,playerShield:.62,playerEnergy:.80,armorAdd:-1,shop:1.22,xp:.92,loot:.86,bossAdd:1,epstein:false},
  epstein:{id:'epstein',name:'EPSTEIN Mode',badge:'EPSTEIN',summary:'Hardest mode. Dense enemies, brutal damage, faster pressure, and portrait enemies.',enemyHp:1.7,enemySpeed:1.28,enemyDamage:1.78,enemyFire:.88,enemyBullet:1.25,enemyCount:3,eliteAdd:.14,playerHull:.58,playerShield:.50,playerEnergy:.72,armorAdd:-1,shop:1.38,xp:.84,loot:.74,bossAdd:2,epstein:true}
};
function difficultyAt(id){return DIFFICULTIES[id]||DIFFICULTIES.medium}
function diff(){return difficultyAt(selectedDifficulty)}
function dungeonLevel(){
  if(!G||!G.run)return 1;
  let clears=0;
  try{for(let r of G.rooms.values())if(r.clr)clears++}catch(e){console.warn('Error counting cleared rooms:',e)}
  let bossBonus=(G.bossKills||0)*2;
  return Math.max(1,Math.min(12,1+Math.floor((clears+bossBonus)/5)));
}
function levelScale(){
  let L=dungeonLevel();
  return {
    L,
    hp:1+(L-1)*0.16,
    speed:1+(L-1)*0.055,
    damage:1+(L-1)*0.14,
    bullets:1+(L-1)*0.055,
    count:Math.floor((L-1)/2),
    reward:1+(L-1)*0.04
  };
}

function setDifficulty(id){
  selectedDifficulty=DIFFICULTIES[id]?id:'medium';
  localStorage.NEON_RELIC_DIFFICULTY=selectedDifficulty;
  let d=diff();
  document.querySelectorAll('.diffcard').forEach(el=>el.classList.toggle('sel',el.dataset.diff===selectedDifficulty));
  let info=$('diffInfo');
  if(info)info.innerHTML=`<div class="row"><b>${d.name}</b><span class="badge">${d.badge}</span></div><div class="muted">${d.summary}</div><div class="muted"><b>Enemy tuning:</b> HP x${d.enemyHp.toFixed(2)}, speed x${d.enemySpeed.toFixed(2)}, damage x${d.enemyDamage.toFixed(2)}</div><div class="muted"><b>Player tuning:</b> hull x${d.playerHull.toFixed(2)}, shield x${d.playerShield.toFixed(2)}, energy x${d.playerEnergy.toFixed(2)}</div>`;
}
function renderDifficultySelect(){
  let host=$('diffSelect'); if(!host) return;
  host.innerHTML=Object.values(DIFFICULTIES).map(d=>`<button type="button" class="charcard diffcard${d.id===selectedDifficulty?' sel':''}" data-diff="${d.id}"><b>${d.name}</b><div class="badge">${d.badge}</div><div class="muted" style="margin-top:8px">${d.summary}</div><div class="muted" style="margin-top:6px"><b>Enemy HP:</b> x${d.enemyHp.toFixed(2)} · <b>Damage:</b> x${d.enemyDamage.toFixed(2)}</div></button>`).join('');
  host.querySelectorAll('.diffcard').forEach(el=>el.onclick=()=>setDifficulty(el.dataset.diff));
  setDifficulty(selectedDifficulty);
}
function applyDifficultyToPlayer(p){
  let d=diff();
  p.mh=Math.max(70,p.mh*d.playerHull);
  p.h=p.mh;
  p.ms=Math.max(10,p.ms*d.playerShield);
  p.s=p.ms;
  p.me=Math.max(45,p.me*d.playerEnergy);
  p.e=p.me;
  p.armor=Math.max(0,p.armor+(d.armorAdd||0));
  return p;
}
renderDifficultySelect();

const BRISKET_IMG=new Image();BRISKET_IMG.onerror=function(){console.warn('Failed to load image:',this.src)};BRISKET_IMG.src='images/brisket.png';
function metalPanel(x,y,w,h,lit=0){let g=X.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,'#16232e');g.addColorStop(.46,'#0c141c');g.addColorStop(1,'#05090e');X.fillStyle=g;rr(x,y,w,h,10);X.fill();X.strokeStyle=lit?'rgba(111,240,255,.18)':'rgba(255,255,255,.045)';X.lineWidth=1;rr(x,y,w,h,10);X.stroke();X.fillStyle='rgba(255,255,255,.025)';X.fillRect(x+7,y+7,w-14,2);X.fillStyle='rgba(0,0,0,.12)';X.fillRect(x+7,y+h-10,w-14,2);if((x+y)%168===0){X.fillStyle='rgba(98,227,255,.03)';X.fillRect(x+w-16,y+8,4,h-16)}}

const UP=[['HP','Reinforced Hull','+35 max hull and repair.',p=>{p.mh+=35;p.h=cl(p.h+60,0,p.mh)}],['SHD','Aegis Loop','+25 shield and regen.',p=>{p.ms+=25;p.sr+=2;p.s=p.ms}],['DMG','Overclock','+20% damage.',p=>p.dm*=1.2],['SPD','Phase Legs','Faster movement and dash.',p=>{p.sp*=1.12;p.dcMax*=.85}],['DRN','Combat Drone','Adds a drone.',p=>G.drones++],['CRT','Crit Oracle','Better critical hits.',p=>{p.cr+=.08;p.cm+=.35}],['MAG','Magnet Array','Bigger pickup range.',p=>p.mag+=80],['ENG','Reactor Blood','Kills refund energy.',p=>p.ref+=3],['SPL','Splinter Rounds','Enemies burst into bullets.',p=>p.spl++],['STM','Storm Heart','Better shockwave.',p=>{p.qc*=.75;p.qr+=55}],['MED','Field Medic','Better repair pulse.',p=>p.repairPow+=.4],['ENG','Storm Conductor','Better chain lightning.',p=>p.chainPow+=.5],['GUN','Gun Mastery','Shots deal +12% damage and cost slightly less energy.',p=>{p.dm*=1.12;p.er+=1.2}],['ARM','Shield Plating','Gain +18 shield, +1 armor, and faster shield recharge.',p=>{p.ms+=18;p.sr+=1.6;p.armor+=1;p.s=p.ms}],['REG','Living Alloy','Passive hull regen.',p=>p.passive+=1.1],['REV','Mercy Protocol','One extra revive.',p=>p.mercy++],['BAT','Energy Reservoir','Gain +22 max energy and faster energy recharge.',p=>{p.me+=22;p.er+=2.4;p.e=p.me}],['BRK','Brisket Rounds','Bullets hit harder and critical chance increases.',p=>{p.dm*=1.08;p.cr+=.06}],['RUN','Dungeon Runner','Move faster and gain a shorter dash cooldown.',p=>{p.sp*=1.08;p.dcMax*=.9}],['TAC','Tactical Study','Level up faster and improve repair power.',p=>{p.nx=Math.max(40,p.nx*.88|0);p.repairPow+=.18}],['SCR','Scrap Synth','More scrap drops.',p=>p.scrapMul*=1.35]];
function player(){return applyDifficultyToPlayer(applyCharacter({x:PW/2,y:PH/2,r:22,vx:0,vy:0,a:0,h:135,mh:105,s:35,ms:35,e:115,me:115,sr:7,er:13,sp:315,w:0,rank:1,xp:0,nx:60,scrap:25,ft:0,iv:0,dc:0,dcMax:.75,sc:0,qc:4.2,qr:165,tc:0,rc:0,mc:0,zc:0,xc:0,bc:0,gc:0,over:0,heat:0,dm:.78,cr:.08,cm:1.75,mag:125,ref:1,spl:0,armor:2,mercy:1,passive:0,timePow:1,repairPow:1,minePow:1,chainPow:1,decoyPow:1,sentryPow:1,barrierPow:1,scrapMul:1,seen:new Set(['0,0']),shopLock:0,recoil:0,breath:0},selectedCharacter))}
const rk=(x,y)=>x+','+y;function room(x,y,type){let special=G.rng&&G.rng.n()<.13&&type=='combat',rt=special?G.rng.p(['shrine','rescue','forge']):type,r={x,y,type:rt,clr:type=='start'||type=='shop'||type=='lore'||special,doors:{},obs:[],haz:[],loot:[],spawn:0,key:0,boss:0,bossId:0,bossDead:0,miniboss:0,miniId:0,term:type=='lore',used:0};for(let i=0;i<(type=='start'?3:G.rng.i(5,12));i++){let w=G.rng.i(1,3)*T,h=G.rng.i(1,2)*T,ox=G.rng.i(2,RW-4)*T,oy=G.rng.i(2,RH-4)*T;if(di(ox,oy,PW/2,PH/2)>170)r.obs.push({x:ox,y:oy,w,h})}if(!r.clr&&G.rng.n()<.35)for(let i=0;i<G.rng.i(2,4);i++)r.haz.push({x:G.rng.i(2,RW-3)*T,y:G.rng.i(2,RH-3)*T,r:G.rng.i(28,44),p:G.rng.r(0,6.28)});return r}
function world(seed=Date.now()){
  resetWeapons();
  runStats={damage:0,shots:0,rooms:0,startTime:performance.now(),fav:{},bestWeapon:'Pulse'};
  P=player();
  G={run:1,pause:0,over:0,t:0,seed,rng:new RNG(seed),rooms:new Map,rx:0,ry:0,cur:null,en:[],bs:[],eb:[],lt:[],pt:[],txt:[],rings:[],mines:[],sentries:[],decoys:[],barriers:[],links:[],keys:0,core:0,bossKills:0,bossTotal:BOSS_ROOM_COUNT,miniBossTotal:MINI_BOSS_ROOM_COUNT,dungeonLevel:1,kills:0,drones:0,rift:1,combo:0,comboT:0,shake:0,flash:0,art:[],cam:{x:0,y:0}};
  let frontier=[[0,0]];
  G.rooms.set('0,0',room(0,0,'start'));

  for(let attempts=0;G.rooms.size<TARGET_ROOM_COUNT&&attempts<12000;attempts++){
    let base=G.rng.p(frontier),dirs=[[1,0],[-1,0],[0,1],[0,-1]].sort(()=>G.rng.n()-.5);
    for(let [dx,dy] of dirs){
      let x=base[0]+dx,y=base[1]+dy,k=rk(x,y);
      if(G.rooms.has(k))continue;
      let roll=G.rng.n(),t=roll<.10?'shop':roll<.18?'treasure':roll<.28?'lore':'combat';
      G.rooms.set(k,room(x,y,t));
      frontier.push([x,y]);
      break;
    }
  }
  for(let attempts=0;G.rooms.size<TARGET_ROOM_COUNT&&attempts<12000;attempts++){
    let cells=[...G.rooms.values()],base=G.rng.p(cells),dirs=[[1,0],[-1,0],[0,1],[0,-1]].sort(()=>G.rng.n()-.5);
    for(let [dx,dy] of dirs){
      let x=base.x+dx,y=base.y+dy,k=rk(x,y);
      if(!G.rooms.has(k)){G.rooms.set(k,room(x,y,'combat'));break}
    }
  }

  let rs=[...G.rooms.values()].filter(r=>r.x||r.y).sort((a,b)=>di(0,0,b.x,b.y)-di(0,0,a.x,a.y));

  rs.slice(0,BOSS_ROOM_COUNT).forEach((r,i)=>{
    r.type='boss';r.boss=1;r.bossId=i+1;r.bossDead=0;r.miniboss=0;r.mini=0;r.clr=0;r.term=0;r.key=0;r.used=0;r.loot=[];
  });

  rs.slice(BOSS_ROOM_COUNT).sort(()=>G.rng.n()-.5).slice(0,MINI_BOSS_ROOM_COUNT).forEach((r,i)=>{
    r.type='miniboss';r.miniboss=1;r.miniId=i+1;r.boss=0;r.bossDead=0;r.clr=0;r.term=0;r.key=0;r.used=0;r.loot=[];
  });

  for(let r of G.rooms.values()){
    r.doors={};
    for(let [d,x,y] of [['E',1,0],['W',-1,0],['S',0,1],['N',0,-1]])if(G.rooms.has(rk(r.x+x,r.y+y)))r.doors[d]=1;
  }
  enter(0,0,1)
}
function enter(x,y,first){let r=G.rooms.get(rk(x,y));if(!r)return;G.rx=x;G.ry=y;G.cur=r;runStats.rooms++;P.seen.add(rk(x,y));for(let[d,dx,dy]of [['E',1,0],['W',-1,0],['S',0,1],['N',0,-1]])if(r.doors[d])P.seen.add(rk(x+dx,y+dy));G.en=[];G.bs=[];G.eb=[];G.lt=[...r.loot];G.mines=[];G.sentries=[];G.decoys=[];G.barriers=[];if(r.boss)r.haz=[];spawnRoom(r);if(!first)toast(r.type.toUpperCase()+' room')}
function spawnRoom(r){
  if(r.spawn||r.clr||['start','shop','lore','treasure','shrine','rescue','forge'].includes(r.type))return;
  r.spawn=1;
  let d=diff(),ls=levelScale();G.dungeonLevel=ls.L;
  if(r.boss){
    G.eb=[];G.bs=[];G.pt=[];G.rings=[];G.links=[];G.mines=[];G.sentries=[];G.decoys=[];G.barriers=[];
    enemy('boss',PW/2,175);let be=G.en[G.en.length-1];be.h*=1+(ls.L-1)*.18;be.mh=be.h;be.sp*=1+(ls.L-1)*.035;be.dmg*=1+(ls.L-1)*.09;
    toast('FINAL BOSS '+(r.bossId||'?')+' / '+(G.bossTotal||3)+' AWAKENED');
    return
  }
  if(r.miniboss){
    G.eb=[];G.bs=[];G.pt=[];G.rings=[];G.links=[];
    let makeMini=(type,x,y)=>{
      enemy(type,x,y);
      let e=G.en[G.en.length-1];
      e.miniboss=1;e.mini=1;e.elite=1;e.col='#ff9f1c';
      e.h*=1.9*(1+(ls.L-1)*.12);e.mh=e.h;e.r*=1.2;e.sp*=1.08*(1+(ls.L-1)*.035);e.dmg*=1+(ls.L-1)*.08;e.xp=Math.round(e.xp*2.8*ls.reward);
    };
    makeMini('tank',PW/2,PH/2-78);
    makeMini(pick(['sniper','shield','bomber']),PW/2-155,PH/2+82);
    makeMini(pick(['dash','healer','turret']),PW/2+155,PH/2+82);
    let adds=Math.max(4,3+(d.enemyCount||0)+ls.count);
    for(let i=0;i<adds;i++){
      let x,y;do{x=R(PW-180,90);y=R(PH-180,90)}while(di(x,y,P.x,P.y)<260);
      enemy(pick(['swarm','dash','drone','bomber']),x,y)
    }
    toast('LEVEL '+ls.L+' MINI-BOSS ROOM '+(r.miniId||''));
    return
  }
  let n=Math.max(4,Math.floor(5+Math.abs(r.x)+Math.abs(r.y)+G.rift*1.7+(d.enemyCount||0)+ls.count));
  for(let i=0;i<n;i++){
    let x,y;do{x=R(PW-180,90);y=R(PH-180,90)}while(di(x,y,P.x,P.y)<260);
    enemy(pick(['drone','drone','dash','turret','split','tank','sniper','bomber','healer','shield','swarm','swarm','swarm']),x,y)
  }
}
function enemy(type,x,y){let d={drone:[38,15,135,16,'#ff4d6d'],dash:[55,17,185,21,'#ffd166'],turret:[70,20,0,25,'#b28dff'],split:[48,18,105,24,'#6aff9e'],tank:[125,25,72,45,'#ff8fab'],sniper:[44,16,52,34,'#7df9ff'],bomber:[60,20,150,28,'#ff9f1c'],healer:[58,18,90,36,'#9cffb1'],shield:[95,24,70,42,'#9bb7ff'],swarm:[22,10,230,12,'#ff6bcb'],boss:[980,43,80,500,'#fff']}[type],q=diff(),ls=levelScale(),m=(1+G.rift*.07)*q.enemyHp*ls.hp,elite=Math.random()<Math.min(.48,Math.max(0,.04+G.rift*.02+(q.eliteAdd||0)+(ls.L-1)*.012))&&type!='boss';if(elite)m*=1.65;G.en.push({type,x,y,vx:0,vy:0,h:d[0]*m,mh:d[0]*m,r:d[1]*(elite?1.15:1)*1.075,sp:d[2]*(elite?1.15:1)*q.enemySpeed*ls.speed,xp:Math.round(d[3]*(elite?2:1)*ls.reward),col:elite?'#ff7bff':d[4],cd:R(2),fl:0,slow:0,elite,dmg:1.02*q.enemyDamage*ls.damage})}
function tick(dt){if(!G.run||G.pause||G.over||$('level').style.display=='flex'||$('codex').style.display=='block'||$('shopPanel').style.display=='flex'||$('decodePanel').style.display=='flex'||$('forgeResult').style.display=='flex')return;G.t+=dt;G.rift=1+(G.t/75|0);G.comboT=Math.max(0,G.comboT-dt);if(!G.comboT)G.combo=0;G.shake=Math.max(0,G.shake-dt*18);G.flash=Math.max(0,G.flash-dt*3);G.hitFlash=Math.max(0,(G.hitFlash||0)-dt*2.8);upPlayer(dt);if(!isBossRoom())upDrones(dt);if(!isBossRoom())upDeploy(dt);upEnemies(dt);let bossSafe=isBossRoom();if(G.en.length>(bossSafe?8:45))G.en=G.en.slice(0,bossSafe?8:45);if(G.eb.length>(bossSafe?55:120))G.eb=G.eb.slice(-(bossSafe?55:120));if(G.bs.length>(bossSafe?70:90))G.bs=G.bs.slice(-(bossSafe?70:90));if(G.pt.length>(bossSafe?90:260))G.pt=G.pt.slice(-(bossSafe?90:260));if(G.rings.length>(bossSafe?12:40))G.rings=G.rings.slice(-(bossSafe?12:40));upBullets(dt);upLoot(dt);upFx(dt);state();ui()}
function upPlayer(dt){P.iv=Math.max(0,P.iv-dt);P.recoil=(P.recoil||0)*Math.pow(.03,dt);P.breath=(P.breath||0)+dt*2.4;P.ft=Math.max(0,P.ft-dt);P.dc=Math.max(0,P.dc-dt);for(let k of ['sc','tc','rc','mc','zc','xc','bc','gc'])P[k]=Math.max(0,P[k]-dt);P.s=cl(P.s+P.sr*dt,0,P.ms);P.e=cl(P.e+P.er*dt,0,P.me);if(P.passive)P.h=cl(P.h+P.passive*dt,0,P.mh);P.shopLock=Math.max(0,P.shopLock-dt);let ax=isDown('right')-isDown('left'),ay=isDown('down')-isDown('up'),l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;let wm={x:(ms.x-W/2)/VIEW_SCALE+G.cam.x,y:(ms.y-H/2)/VIEW_SCALE+G.cam.y},targetAim=Math.atan2(wm.y-P.y,wm.x-P.x);P.a+=angleDelta(P.a,targetAim)*settings.sens;P.vx+=(ax*P.sp-P.vx)*.18;P.vy+=(ay*P.sp-P.vy)*.18;if(isDown('dash')&&P.dc<=0&&P.e>=16){P.e-=16;P.dc=P.dcMax;P.iv=.22;P.vx=(ax||Math.cos(P.a))*850;P.vy=(ay||Math.sin(P.a))*850;burst(P.x,P.y,'#62e3ff',35,4,380);ring(P.x,P.y,'#62e3ff',25,120,.35)}if(ms.d&&P.ft<=0)fire();if(isDown('shock')&&P.sc<=0&&P.e>=26)shock();if(isDown('repair')&&P.rc<=0&&P.e>=22)repairPulse();if(isDown('lightning')&&P.zc<=0&&P.e>=30)chainLightning();if(isDown('interact'))interact();if(P.over>0){P.over-=dt;P.e=cl(P.e+28*dt,0,P.me)}move(P,dt);if(P.x<25&&G.cur.doors.W)door('W');if(P.x>PW-25&&G.cur.doors.E)door('E');if(P.y<25&&G.cur.doors.N)door('N');if(P.y>PH-25&&G.cur.doors.S)door('S');for(let h of G.cur.haz)if(di(P.x,P.y,h.x,h.y)<P.r+h.r*(.75+.18*Math.sin(G.t*4+h.p)))hurt(14*dt)}
function door(d){if(!G.cur.clr&&G.en.length)return toast('Doors sealed');let x=G.rx,y=G.ry;if(d=='E')x++,P.x=65;if(d=='W')x--,P.x=PW-65;if(d=='S')y++,P.y=65;if(d=='N')y--,P.y=PH-65;enter(x,y)}
function fire(){let w=weps[ensureWeaponIndex()];recordShot(w);let energyCost=w[5]*1.02;if(P.e<energyCost)return;P.e-=energyCost;P.ft=w[1];P.recoil=14;sfx('shoot');G.shake=Math.max(G.shake,2.2);muzzle(P.x+Math.cos(P.a)*28,P.y+Math.sin(P.a)*28,w[8]);for(let i=0;i<w[6];i++){let a=P.a+(Math.random()-.5)*w[4]*(w[6]>1?2.2:1),cr=Math.random()<P.cr;G.bs.push({x:P.x+Math.cos(a)*26,y:P.y+Math.sin(a)*26,vx:Math.cos(a)*w[2],vy:Math.sin(a)*w[2],r:cr?6:4,l:1.15,d:w[3]*P.dm*PLAYER_DAMAGE_MULT*(cr?P.cm:1),pi:w[7],col:cr?'#fff7a6':w[8]})}}
function shock(){P.e-=26;P.sc=P.qc;G.shake=13;G.flash=.25;ring(P.x,P.y,'#e8fbff',40,P.qr,.55);burst(P.x,P.y,'#e8fbff',120,6,640);for(let e of G.en){let d=di(P.x,P.y,e.x,e.y);if(d<P.qr){let a=Math.atan2(e.y-P.y,e.x-P.x);e.vx+=Math.cos(a)*580;e.vy+=Math.sin(a)*580;e.slow=.8;hit(e,52*(1-d/P.qr))}}}
function timeBubble(){P.e-=28;P.tc=8.5;ring(P.x,P.y,'#7df9ff',30,220,.8);for(let e of G.en)if(di(P.x,P.y,e.x,e.y)<230*P.timePow){e.slow=3.4*P.timePow;text(e.x,e.y,'SLOWED','#7df9ff')}toast('Time bubble')}
function repairPulse(){P.e-=22;P.rc=10;let heal=35*P.repairPow;P.h=cl(P.h+heal,0,P.mh);P.s=cl(P.s+heal*.7,0,P.ms);P.iv=.35;ring(P.x,P.y,'#6aff9e',25,130,.55);burst(P.x,P.y,'#6aff9e',75,4,300);toast('Repair pulse')}
function mine(){P.e-=24;P.mc=7;G.mines.push({x:P.x,y:P.y,r:22,l:4.2,pow:P.minePow});toast('Mine armed')}
function chainLightning(){P.e-=30;P.zc=6.5;let cur={x:P.x,y:P.y},hitList=[];for(let i=0;i<5+P.chainPow;i++){let best=null,bd=260*P.chainPow;for(let e of G.en)if(!hitList.includes(e)){let d=di(cur.x,cur.y,e.x,e.y);if(d<bd){bd=d;best=e}}if(!best)break;hitList.push(best);G.links.push({x1:cur.x,y1:cur.y,x2:best.x,y2:best.y,l:.22,c:'#7df9ff'});hit(best,34*P.chainPow);best.slow=.5;cur=best}toast('Chain lightning')}
function decoy(){P.e-=20;P.xc=9.5;G.decoys.push({x:P.x,y:P.y,r:18,l:5.5*P.decoyPow,h:80*P.decoyPow});toast('Decoy')}
function sentry(){P.e-=34;P.bc=12;G.sentries.push({x:P.x,y:P.y,r:15,l:8*P.sentryPow,cd:0,pow:P.sentryPow});toast('Sentry')}
function barrier(){P.e-=26;P.gc=11;G.barriers.push({x:P.x,y:P.y,r:78*P.barrierPow,l:5.2*P.barrierPow,pow:P.barrierPow});toast('Barrier')}
function upEnemies(dt){for(let e of G.en){e.fl=Math.max(0,e.fl-dt);e.cd-=dt;let target=nearestDecoy(e.x,e.y)||P,a=Math.atan2(target.y-e.y,target.x-e.x),d=di(e.x,e.y,target.x,target.y);if(['drone','split'].includes(e.type)){e.vx+=Math.cos(a)*e.sp*dt*2.6;e.vy+=Math.sin(a)*e.sp*dt*2.6}if(e.type=='swarm'){e.vx+=Math.cos(a+Math.sin(G.t*8)*.6)*e.sp*dt*3.1;e.vy+=Math.sin(a+Math.sin(G.t*8)*.6)*e.sp*dt*3.1}if(e.type=='dash'){e.vx+=Math.cos(a)*e.sp*dt;if(e.cd<=0){e.cd=2.5*diff().enemyFire;e.vx+=Math.cos(a)*640*diff().enemySpeed;e.vy+=Math.sin(a)*640*diff().enemySpeed}}if(['turret','tank','sniper','shield'].includes(e.type)){if(e.type=='tank'||e.type=='shield'){e.vx+=Math.cos(a)*e.sp*dt;e.vy+=Math.sin(a)*e.sp*dt}if(e.type=='sniper'&&d<380){e.vx-=Math.cos(a)*e.sp*dt*3;e.vy-=Math.sin(a)*e.sp*dt*3}if(e.type=='shield')for(let o of G.en)if(o!==e&&di(e.x,e.y,o.x,o.y)<140)o.h=Math.min(o.mh,o.h+3*dt);if(e.cd<=0&&d<780){e.cd=(e.type=='sniper'?2.2:e.type=='tank'?1.2:e.type=='shield'?2.4:1.7)*diff().enemyFire;shootE(e,e.type=='tank'?5:e.type=='shield'?6:e.type=='sniper'?1:3)}}if(e.type=='bomber'){e.vx+=Math.cos(a)*e.sp*dt*2.5;e.vy+=Math.sin(a)*e.sp*dt*2.5;if(d<55){explodeEnemy(e)}}if(e.type=='healer'){e.vx-=Math.cos(a)*e.sp*dt*.7;e.vy-=Math.sin(a)*e.sp*dt*.7;if(e.cd<=0){e.cd=1.5*diff().enemyFire;let low=G.en.filter(o=>o!==e&&o.h<o.mh&&di(e.x,e.y,o.x,o.y)<260)[0];if(low){low.h=Math.min(low.mh,low.h+35*diff().enemyHp);ring(low.x,low.y,'#9cffb1',15,65,.35)}else if(d<620)shootE(e,2)}}if(e.type=='boss'){let phase=e.h<e.mh*.33?3:e.h<e.mh*.66?2:1;e.phase=phase;e.vx+=Math.cos(a)*e.sp*dt*.72;e.vy+=Math.sin(a)*e.sp*dt*.12;if(e.cd<=0){e.cd=(phase==3?1.35:phase==2?1.55:1.85)*diff().enemyFire;let shots=phase==3?7:phase==2?6:5,base=Math.atan2(P.y-e.y,P.x-e.x);for(let i=0;i<shots;i++)eb(e.x,e.y,base+(i-(shots-1)/2)*.16,190*diff().enemyBullet*levelScale().bullets,e.col,13*diff().enemyDamage*levelScale().damage);if(G.rings.length<18)ring(e.x,e.y,e.col,30,115,.32);G.shake=4+phase}}if(e.slow>0){e.slow-=dt;e.vx*=.78;e.vy*=.78}e.vx*=.94;e.vy*=.94;move(e,dt);if(d<P.r+e.r&&P.iv<=0&&!target.fake)hurt((e.type=='boss'?25:14)*e.dmg)}G.en=G.en.filter(e=>!e.dead)}
function nearestDecoy(x,y){let b=null,bd=9999;for(let d of G.decoys){let q=di(x,y,d.x,d.y);if(q<bd){bd=q;b=d}}return bd<500?{x:b.x,y:b.y,fake:1}:null}function explodeEnemy(e){ring(e.x,e.y,'#ff9f1c',20,145,.35);burst(e.x,e.y,'#ff9f1c',55,5,360);if(di(e.x,e.y,P.x,P.y)<145)hurt(20*e.dmg);e.dead=1}function shootE(e,n){let a=Math.atan2(P.y-e.y,P.x-e.x),q=diff(),ls=levelScale();n+=Math.floor((ls.L-1)/4);for(let i=0;i<n;i++)eb(e.x,e.y,a+(i-(n-1)/2)*.18,230*q.enemyBullet*ls.bullets,e.col,12*e.dmg)}function eb(x,y,a,s,c,d){let cap=isBossRoom()?55:130;if(G.eb.length>cap)G.eb.splice(0,G.eb.length-cap);G.eb.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,r:isBossRoom()?4:5,l:isBossRoom()?2.4:3.2,col:c,d})}
function upBullets(dt){for(let b of G.bs){b.l-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(wall(b))b.l=-1;for(let e of G.en)if(!e.dead&&di(b.x,b.y,e.x,e.y)<b.r+e.r){hit(e,b.d);b.pi--;if(b.pi<0)b.l=-1;break}}for(let b of G.eb){b.l-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(wall(b))b.l=-1;for(let br of G.barriers)if(di(b.x,b.y,br.x,br.y)<br.r){b.l=-1;burst(b.x,b.y,'#62e3ff',8,2,120)}if(P.iv<=0&&di(b.x,b.y,P.x,P.y)<b.r+P.r){hurt(b.d);b.l=-1}}G.bs=G.bs.filter(b=>b.l>0&&b.x>-80&&b.x<PW+80&&b.y>-80&&b.y<PH+80);G.eb=G.eb.filter(b=>b.l>0&&b.x>-80&&b.x<PW+80&&b.y>-80&&b.y<PH+80)}
function hit(e,d){if(P.over>0)d*=1.45;if(!hit.last||G.t-hit.last>.035){sfx('hit');hit.last=G.t}e.h-=d;runStats.damage+=d;e.fl=.08;burst(e.x,e.y,e.col,10,3,180);text(e.x,e.y,d|0,'#fff');if(e.h<=0&&!e.dead)kill(e)}
function kill(e){
  sfx(e.type=='boss'?'boss':'death');
  e.dead=1;G.kills++;G.combo++;G.comboT=3.2;
  P.heat=cl(P.heat+12+(e.elite?20:0),0,100);
  P.xp+=e.xp*(diff().xp||1)*(1+Math.min(G.combo,25)*.02);
  P.e=cl(P.e+P.ref,0,P.me);
  drop(e.x,e.y,'scrap',Math.max(1,(R(9,3)*P.scrapMul*(diff().loot||1))|0));
  if(Math.random()<.12)drop(e.x,e.y,'cell',1);
  if(e.elite&&Math.random()<.5)drop(e.x,e.y,'artifact',1);
  if(e.type=='split')for(let i=0;i<2;i++)enemy('swarm',e.x+R(60,-60),e.y+R(60,-60));
  if(P.spl)for(let i=0;i<5+P.spl;i++){let a=R(6.28);G.bs.push({x:e.x,y:e.y,vx:Math.cos(a)*520,vy:Math.sin(a)*520,r:3,l:.35,d:8*P.spl,pi:0,col:'#ffd166'})}
  if(e.type=='boss'){
    G.cur.clr=1;
    if(!G.cur.bossDead){G.cur.bossDead=1;G.bossKills=(G.bossKills||0)+1}
    if(G.bossKills>=(G.bossTotal||BOSS_ROOM_COUNT)){
      G.core=1;
      drop(e.x,e.y,'core',1);
      toast('ALL 3 FINAL BOSSES DEAD. RETURN TO SPAWN.');
    }else{
      toast('Final boss defeated: '+G.bossKills+'/'+(G.bossTotal||BOSS_ROOM_COUNT));
      drop(e.x,e.y,'artifact',1);
    }
  }
  burst(e.x,e.y,e.col,e.elite?70:42,6,e.elite?420:290);
  ring(e.x,e.y,e.col,25,e.elite?190:125,.45);
  level()
}
function drop(x,y,type,n){G.lt.push({x,y,type,n,r:12,vx:R(180,-180),vy:R(180,-180)})}function upLoot(dt){for(let l of G.lt){let d=di(l.x,l.y,P.x,P.y);if(d<P.mag){let a=Math.atan2(P.y-l.y,P.x-l.x);l.vx+=Math.cos(a)*90000/(d+90)*dt;l.vy+=Math.sin(a)*90000/(d+90)*dt}l.vx*=.92;l.vy*=.92;l.x+=l.vx*dt;l.y+=l.vy*dt;if(d<P.r+l.r+8){if(l.type=='scrap')P.scrap+=l.n;if(l.type=='cell')P.e=cl(P.e+35,0,P.me);if(l.type=='artifact'){artifact();toast('Artifact installed')}if(l.type=='key'){G.keys++;toast('Relic key '+G.keys+'/3')}if(l.type=='core'){G.core=1;toast('Core secured. Return to start.')}ring(l.x,l.y,'#ffd166',10,45,.25);burst(l.x,l.y,'#ffd166',14,2,120);l.dead=1}}G.lt=G.lt.filter(l=>!l.dead);G.cur.loot=[...G.lt]}
function artifact(){let a=pick(UP);a[3](P);G.art.push(a[1])}function interact(){if(P.shopLock>0)return;if(['shrine','rescue','forge'].includes(G.cur.type)&&di(P.x,P.y,PW/2,PH/2)<185){P.shopLock=.45;if(G.cur.used)return toast(G.cur.type.toUpperCase()+' already used');if(G.cur.type=='forge'){openForgePuzzle();return}G.cur.used=1;if(G.cur.type=='shrine'){artifact();P.xp+=70;P.e=P.me;toast('Shrine blessing')}if(G.cur.type=='rescue'){P.h=P.mh;P.s=P.ms;P.e=P.me;P.mercy++;toast('Rescue restored you')}ring(PW/2,PH/2,'#ffd166',35,190,.8);burst(PW/2,PH/2,'#ffd166',120,6,520);level();return}if(G.cur.type=='shop'&&di(P.x,P.y,PW/2,PH/2)<170){P.shopLock=.45;openShop();return}if(G.cur.term&&di(P.x,P.y,PW/2,PH/2)<130){P.shopLock=.45;openPuzzle();return}}
function shopItems(){return[
['Hull Repair',25,'Restore 55 hull.',()=>P.h<P.mh,()=>{P.h=cl(P.h+35,0,P.mh)}],
['Energy Recharge',18,'Refill your energy core.',()=>P.e<P.me*.95,()=>{P.e=P.me}],
['Damage Tuning',65,'Increase weapon damage by 8%.',()=>1,()=>{P.dm*=1.08}],
['Armor Plating',55,'Gain +1 armor.',()=>1,()=>{P.armor+=1}],
['Shield Capacitor',50,'Gain +12 max shield and refill shield.',()=>1,()=>{P.ms+=12;P.s=P.ms}],
['Combat Drone',75,'Add one orbiting drone. Max 4.',()=>G.drones<4,()=>{G.drones++}],
['Artifact Roll',65,'Gain a random upgrade artifact.',()=>1,()=>artifact()]
]}
function openShop(){let panel=$('shopPanel');panel.style.display='flex';renderShop();toast('Market opened')}
function closeShop(){if($('shopPanel'))$('shopPanel').style.display='none'}
function renderShop(){if(!P)return;$('shopScrap').textContent=P.scrap;let items=shopItems();$('shopOptions').innerHTML=items.map((it,i)=>{let can=it[3](),aff=P.scrap>=it[1];let price=Math.ceil(it[1]*(diff().shop||1));return `<button class="shopitem ${(!can||P.scrap<price)?'disabled':''}" data-buy="${i}"><div class="row"><b>${it[0]}</b><span class="badge">${price} scrap</span></div><p class="s">${it[2]}</p>${!can?'<p class="s">Not available right now.</p>':P.scrap<price?'<p class="s">Need more scrap.</p>':''}</button>`}).join('');[...document.querySelectorAll('[data-buy]')].forEach(btn=>btn.onclick=()=>buyShop(+btn.dataset.buy))}
function buyShop(i){let item=shopItems()[i];if(!item)return;if(!item[3]())return toast('Not available');let price=Math.ceil(item[1]*(diff().shop||1));if(P.scrap<price)return toast('Need more scrap');P.scrap-=price;item[4]();sfx('buy');toast('Bought '+item[0]);renderShop();ui()}
function makePuzzle(){
  const puzzles=[
    {
      kind:'security',
      prompt:'SECURITY TERMINAL\nPick the only safe door.\n\nRules:\n• Red doors are always trapped.\n• Blue doors are safe only if the number is even.\n• Green doors are safe only if the number is odd.',
      hint:'Blue needs even. Green needs odd. Red is always trapped.',
      answer:'BLUE 8',
      choices:['RED 4','BLUE 8','GREEN 6','RED 9'],
      chips:[['RED 4','bad'],['BLUE 8','good'],['GREEN 6','warn'],['RED 9','bad']]
    },
    {
      kind:'wire',
      prompt:'WIRE CUTTER\nCut the correct wire.\n\nRules:\n• If yellow is present, do not cut red.\n• If blue has the highest number, cut blue.\n• Otherwise cut green.\n\nWires: Red 7, Blue 9, Yellow 2, Green 5',
      hint:'Blue has the highest number.',
      answer:'BLUE',
      choices:['RED','BLUE','YELLOW','GREEN'],
      chips:[['Red 7','bad'],['Blue 9','good'],['Yellow 2','warn'],['Green 5','']]
    },
    {
      kind:'keypad',
      prompt:'KEYPAD ROOM\nEnter the 3-part code.\n\nThe code is:\n1. Smallest number\n2. Largest number\n3. Only repeated color\n\nA = Red 4\nB = Blue 9\nC = Green 2\nD = Blue 6',
      hint:'Smallest is C, largest is B, repeated color is Blue.',
      answer:'C B BLUE',
      choices:['C B BLUE','A B RED','C D GREEN','D B BLUE'],
      chips:[['A: Red 4',''],['B: Blue 9','good'],['C: Green 2','good'],['D: Blue 6','']]
    },
    {
      kind:'statues',
      prompt:'STATUE ORDER\nActivate the statues from weakest to strongest.\n\nWolf = 12 power\nGolem = 31 power\nSpider = 7 power\nDragon = 55 power',
      hint:'Sort the numbers from low to high.',
      answer:'SPIDER WOLF GOLEM DRAGON',
      choices:['SPIDER WOLF GOLEM DRAGON','WOLF SPIDER GOLEM DRAGON','DRAGON GOLEM WOLF SPIDER','SPIDER GOLEM WOLF DRAGON'],
      chips:[['Spider 7','good'],['Wolf 12','good'],['Golem 31','good'],['Dragon 55','good']]
    },
    {
      kind:'chests',
      prompt:'CHEST TERMINAL\nOnly one chest is real.\n\nLeft says: “Middle is real.”\nMiddle says: “Right is fake.”\nRight says: “Left is lying.”\n\nExactly two chests tell the truth.',
      hint:'Middle being real makes the statements fit.',
      answer:'MIDDLE',
      choices:['LEFT','MIDDLE','RIGHT','NONE'],
      chips:[['Left','warn'],['Middle','good'],['Right','warn']]
    },
    {
      kind:'reactor',
      prompt:'REACTOR BALANCE\nChoose the crystal that makes the total exactly 20.\n\nCurrent power: 13\nCrystals: +3, +5, +7, +9',
      hint:'13 + 7 = 20.',
      answer:'+7',
      choices:['+3','+5','+7','+9'],
      chips:[['Current 13','warn'],['+3',''],['+5',''],['+7','good'],['+9','']]
    },
    {
      kind:'route',
      prompt:'ROUTE TERMINAL\nPick the safest route.\n\nRules:\n• Avoid skull tiles.\n• You must pass through a key tile.\n• Exit must be last.',
      hint:'Choose the route with Key and Exit but no Skull.',
      answer:'START → KEY → BRIDGE → EXIT',
      choices:['START → SKULL → EXIT','START → KEY → BRIDGE → EXIT','START → BRIDGE → EXIT','START → KEY → SKULL → EXIT'],
      chips:[['Start',''],['Key','good'],['Skull','bad'],['Exit','good']]
    },
    {
      kind:'memory',
      prompt:'MEMORY TERMINAL\nRepeat the pulse sequence shown by the terminal.',
      hint:'Copy the exact color order.',
      answer:'GREEN BLUE YELLOW RED',
      choices:['GREEN BLUE YELLOW RED','GREEN YELLOW BLUE RED','BLUE GREEN YELLOW RED','GREEN BLUE RED YELLOW'],
      chips:[['Green','good'],['Blue','good'],['Yellow','good'],['Red','good']]
    },
    {
      kind:'forge',
      prompt:'FORGE CALIBRATION\nChoose the part that does NOT overload the weapon.\n\nHeat limit: 40\nCurrent heat: 28\nParts: Barrel +8, Core +15, Stock +4, Lens +12',
      hint:'Core overloads. Stock is the safest part.',
      answer:'STOCK',
      choices:['BARREL','CORE','STOCK','LENS'],
      chips:[['Barrel +8','warn'],['Core +15','bad'],['Stock +4','good'],['Lens +12','warn']]
    },
    {
      kind:'rune',
      prompt:'RUNE LOCK\nPick the rune that completes the sequence.\n\nRule: each step rotates one shape forward.\nCircle → Triangle → Square → ?',
      hint:'After square comes diamond in this lock.',
      answer:'DIAMOND',
      choices:['CIRCLE','TRIANGLE','DIAMOND','STAR'],
      chips:[['Circle',''],['Triangle',''],['Square','warn'],['Diamond','good']]
    }
  ];
  return {...puzzles[Math.random()*puzzles.length|0]};
}
function makeForgePuzzle(){let p=makePuzzle();p.forge=1;p.max=45;return p}
function openForgePuzzle(){if(G.cur.used)return toast('Forge already used');puzzle=makeForgePuzzle();puzzle.left=puzzle.max;puzzle.start=performance.now();$('puzzleTitle').textContent='Forge Calibration Puzzle';$('puzzleIntro').textContent='Solve a clean forge terminal puzzle to craft a random gun. Some forged guns are powerful. Some are awful. Exiting does not consume the forge.';$('decodePanel').style.display='flex';$('puzzlePrompt').textContent=puzzle.prompt;$('puzzleAnswer').value='';$('puzzleMsg').textContent='';renderPuzzleChoices();$('puzzleTimer').textContent=Math.ceil(puzzle.max)+'s';setTimeout(()=>$('puzzleAnswer').focus(),40);toast('Forge puzzle opened')}
function resetPuzzleText(){if($('puzzleTitle'))$('puzzleTitle').textContent='Archive Decode Puzzle';if($('puzzleIntro'))$('puzzleIntro').textContent='Solve the archive puzzle to gain XP. Faster answers give more XP. Exiting does not consume the archive.'}
function rollForgedGun(ratio){let good=FORGE_GUNS.filter(g=>g[9]=='good'),bad=FORGE_GUNS.filter(g=>g[9]=='bad'),pool=FORGE_GUNS.filter(g=>ratio>.75?true:g[9]!='good'||Math.random()<.45);let gun=[...pool[Math.random()*pool.length|0]];if(ratio>.85&&gun[9]=='bad'&&Math.random()<.75)gun=[...good[Math.random()*good.length|0]];if(ratio<.25&&Math.random()<.55)gun=[...bad[Math.random()*bad.length|0]];return gun}
function showForgedGun(gun){craftedGun=gun;let q=gun[9]=='good'?'good':gun[9]=='bad'?'bad':'mid',rar=rarityForGun(gun);$('forgeWeaponBox').innerHTML=`<div class="row"><h2>${gun[0]}</h2><span class="${rarityClass(rar)}">${rar.toUpperCase()}</span></div><p class="s"><span class="${q}">${q.toUpperCase()}</span> · ${gun[10]}</p><div class="statgrid"><div class="statpill"><b>${gun[3]}</b><br><span class="s">Damage</span></div><div class="statpill"><b>${gun[1]}s</b><br><span class="s">Fire Rate</span></div><div class="statpill"><b>${gun[5]}</b><br><span class="s">Energy</span></div><div class="statpill"><b>${gun[6]}</b><br><span class="s">Shots</span></div><div class="statpill"><b>${gun[7]}</b><br><span class="s">Pierce</span></div></div><p class="s">Current equipped: ${weps[P.w][0]}</p>`;$('forgeResult').style.display='flex'}
function equipForgedGun(){if(!craftedGun)return;weps[ensureWeaponIndex()]=craftedGun.slice(0,9);toast('Equipped '+craftedGun[0]);craftedGun=null;$('forgeResult').style.display='none';ui()}
function skipForgedGun(){craftedGun=null;$('forgeResult').style.display='none';toast('Kept current gun')}

function escHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function renderPuzzleChoices(){
  let host=$('puzzleChoices'); if(!host||!puzzle)return;
  let chips=puzzle.chips||[];
  let chipHtml=chips.length?`<div class="terminalPuzzleCard"><b>Terminal Readout</b><div class="terminalMini">${chips.map(c=>`<div class="terminalChip ${c[1]||''}">${escHtml(c[0])}</div>`).join('')}</div></div>`:'';
  let choices=puzzle.choices||[];
  host.innerHTML=chipHtml+choices.map(c=>`<button class="puzzleChoice" data-answer="${escHtml(c)}">${escHtml(c)}</button>`).join('');
  host.querySelectorAll('.puzzleChoice').forEach(btn=>btn.onclick=()=>{$('puzzleAnswer').value=btn.dataset.answer;submitPuzzle()});
}
function openPuzzle(){if(!G.cur.term)return toast('Archive already decoded');resetPuzzleText();puzzle=makePuzzle();puzzle.max=35;puzzle.left=35;puzzle.start=performance.now();$('decodePanel').style.display='flex';$('puzzlePrompt').textContent=puzzle.prompt;$('puzzleAnswer').value='';$('puzzleMsg').textContent='';renderPuzzleChoices();$('puzzleTimer').textContent='35s';setTimeout(()=>$('puzzleAnswer').focus(),40);toast('Archive puzzle opened')}
function closePuzzle(){if($('decodePanel'))$('decodePanel').style.display='none';if($('puzzleChoices'))$('puzzleChoices').innerHTML='';resetPuzzleText();puzzle=null;toast('Puzzle exited')}
function updatePuzzleTimer(){if(!puzzle||$('decodePanel').style.display!='flex')return;puzzle.left=Math.max(0,puzzle.max-(performance.now()-puzzle.start)/1000);$('puzzleTimer').textContent=Math.ceil(puzzle.left)+'s';if(puzzle.left<=0){$('puzzleMsg').textContent='Time bonus is gone, but you can still solve it for base XP.'}}
function submitPuzzle(){if(!puzzle)return;let norm=s=>String(s).trim().replace(/\s+/g,' ').toLowerCase();let ans=norm($('puzzleAnswer').value);if(ans!==norm(puzzle.answer)){ sfx('fail');$('puzzleMsg').textContent='Incorrect. Hint: '+(puzzle.hint||'Look closely at the pattern.');return }let ratio=cl(puzzle.left/puzzle.max,0,1);$('decodePanel').style.display='none';if(puzzle.forge){G.cur.used=1;let gun=rollForgedGun(ratio);ring(PW/2,PH/2,'#ff9f1c',30,180,.75);burst(PW/2,PH/2,'#ff9f1c',100,5,460);puzzle=null;resetPuzzleText();showForgedGun(gun);sfx('forge');toast('Weapon forged');return}let gain=Math.floor((25+Math.floor(85*ratio))*(diff().xp||1));G.cur.term=0;P.xp+=gain;ring(PW/2,PH/2,'#62e3ff',30,170,.7);burst(PW/2,PH/2,'#62e3ff',90,5,420);puzzle=null;resetPuzzleText();sfx('puzzle');toast('Archive decoded: +'+gain+' XP');level();ui()}
function upDrones(dt){for(let i=0;i<G.drones;i++){let a=G.t*1.5+i*6.28/G.drones,x=P.x+Math.cos(a)*70,y=P.y+Math.sin(a)*70,e=near(x,y);if(e&&((G.t*3+i)%1)<dt*3){let aa=Math.atan2(e.y-y,e.x-x);G.bs.push({x,y,vx:Math.cos(aa)*760,vy:Math.sin(aa)*760,r:3,l:.8,d:9*P.dm,pi:0,col:'#6aff9e'})}}}
function upDeploy(dt){for(let m of G.mines){m.l-=dt;m.r+=28*dt;for(let e of G.en){let d=di(m.x,m.y,e.x,e.y);if(d<190*m.pow){let a=Math.atan2(m.y-e.y,m.x-e.x);e.vx+=Math.cos(a)*520*m.pow*dt;e.vy+=Math.sin(a)*520*m.pow*dt;if(d<m.r+e.r){hit(e,30*m.pow);e.slow=.7;m.l=0}}}}G.mines=G.mines.filter(m=>m.l>0);for(let d of G.decoys){d.l-=dt;for(let e of G.en){let q=di(d.x,d.y,e.x,e.y);if(q<e.r+d.r)d.h-=18*dt}if(d.l<=0||d.h<=0){for(let e of G.en)if(di(d.x,d.y,e.x,e.y)<150)hit(e,24*P.decoyPow);burst(d.x,d.y,'#ff7bff',50,5,350)}}G.decoys=G.decoys.filter(d=>d.l>0&&d.h>0);for(let s of G.sentries){s.l-=dt;s.cd-=dt;if(s.cd<=0){let e=near(s.x,s.y);if(e){s.cd=.28/s.pow;let a=Math.atan2(e.y-s.y,e.x-s.x);G.bs.push({x:s.x,y:s.y,vx:Math.cos(a)*820,vy:Math.sin(a)*820,r:3,l:.75,d:10*s.pow,pi:0,col:'#ffd166'})}}}G.sentries=G.sentries.filter(s=>s.l>0);for(let b of G.barriers){b.l-=dt;for(let e of G.en){let q=di(b.x,b.y,e.x,e.y);if(q<b.r+e.r&&q>b.r-26){e.slow=.35;hit(e,12*b.pow*dt)}}}G.barriers=G.barriers.filter(b=>b.l>0)}
function state(){
  let oldDungeonLevel=dungeonLevel();
  if(!G.cur.clr&&G.en.length==0){
    G.cur.clr=1;
    if(G.cur.type=='treasure'){drop(PW/2-30,PH/2,'scrap',60);drop(PW/2+30,PH/2,'cell',1)}
    if(G.cur.miniboss&&!G.cur.miniReward){
      G.cur.miniReward=1;
      drop(PW/2-24,PH/2,'artifact',1);
      drop(PW/2+26,PH/2,'scrap',90);
      toast('Mini-boss room cleared')
    }else toast('Room clear')
  }
  let newDungeonLevel=dungeonLevel();
  if(newDungeonLevel>oldDungeonLevel){
    G.dungeonLevel=newDungeonLevel;
    toast('DUNGEON LEVEL '+newDungeonLevel+' - enemies grew stronger')
  }
  if(G.rx==0&&G.ry==0&&(G.bossKills||0)>=(G.bossTotal||BOSS_ROOM_COUNT)&&di(P.x,P.y,PW/2,PH/2)<95)end(1)
}
function level(){while(P.xp>=P.nx){P.xp-=P.nx;P.rank++;P.nx=P.nx*1.36+25|0;let u=[...UP].sort(()=>Math.random()-.5).slice(0,4);$('ups').innerHTML=u.map(a=>`<div class="card up"><div class="upgradeBadge">${a[0]}</div><h3>${a[1]}</h3><p>${a[2]}</p></div>`).join('');[...document.querySelectorAll('.up')].forEach((el,i)=>el.onclick=()=>{u[i][3](P);$('level').style.display='none';toast(u[i][1])});$('level').style.display='flex';break}}
function hurt(d){if(P.iv>0)return;sfx('hurt');d=Math.max(1,d-P.armor);let r=d;if(P.s>0){let q=Math.min(P.s,r);P.s-=q;r-=q}P.h-=r;text(P.x,P.y-28,'-'+Math.ceil(d),'#ff8fab');if(P.h<=P.mh*.28){sfx('low');toast('WARNING: low hull')};if(P.h<=0&&P.mercy>0){P.mercy--;P.h=P.mh*.45;P.s=P.ms;P.e=P.me;P.iv=1.2;toast('MERCY PROTOCOL')}P.iv=.32;G.shake=13;G.flash=.26;G.hitFlash=.9;burst(P.x,P.y,'#ff4d6d',36,5,360);if(P.h<=0)end(0)}
function move(o,dt){o.x+=o.vx*dt;coll(o,'x');o.y+=o.vy*dt;coll(o,'y');o.x=cl(o.x,o.r,PW-o.r);o.y=cl(o.y,o.r,PH-o.r)}function coll(o,ax){for(let ob of G.cur.obs){let x=cl(o.x,ob.x,ob.x+ob.w),y=cl(o.y,ob.y,ob.y+ob.h),dx=o.x-x,dy=o.y-y,d=Math.hypot(dx,dy);if(d<o.r){let p=o.r-d+.1;if(ax=='x')o.x+=Math.sign(dx||o.vx||1)*p;else o.y+=Math.sign(dy||o.vy||1)*p}}}function wall(b){return G.cur.obs.some(o=>b.x>o.x&&b.x<o.x+o.w&&b.y>o.y&&b.y<o.y+o.h)}function near(x,y){let b=null,bd=9999;for(let e of G.en){let d=di(x,y,e.x,e.y);if(d<bd){bd=d;b=e}}return bd<650?b:null}
function burst(x,y,c,n,s=3,v=180){for(let i=0;i<n;i++){let a=R(6.28),q=R(v,20);G.pt.push({x,y,vx:Math.cos(a)*q,vy:Math.sin(a)*q,l:R(.9,.25),ml:.9,c,s:R(s,1)})}}function ring(x,y,c,r=20,m=90,l=.35){G.rings.push({x,y,c,r,m,l,ml:l})}function muzzle(x,y,c){ring(x,y,c,8,35,.18);burst(x,y,c,12,2,210)}function text(x,y,t,c){G.txt.push({x,y,t,c,l:.8})}function upFx(dt){for(let p of G.pt){p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92}G.pt=G.pt.filter(p=>p.l>0);for(let r of G.rings){r.l-=dt;r.r+=(r.m-r.r)*.16}G.rings=G.rings.filter(r=>r.l>0);G.links.forEach(l=>l.l-=dt);G.links=G.links.filter(l=>l.l>0);G.txt.forEach(t=>{t.l-=dt;t.y-=35*dt});G.txt=G.txt.filter(t=>t.l>0)}
function draw(){X.clearRect(0,0,W,H);backdrop();if(!P)return;G.cam.x+=(P.x-G.cam.x)*.08;G.cam.y+=(P.y-G.cam.y)*.08;X.save();X.translate(W/2-G.cam.x*VIEW_SCALE+(Math.random()-.5)*G.shake,H/2-G.cam.y*VIEW_SCALE+(Math.random()-.5)*G.shake);X.scale(VIEW_SCALE,VIEW_SCALE);roomDraw();G.cur.haz.forEach(haz);G.mines.forEach(dmine);G.decoys.forEach(ddecoy);G.sentries.forEach(dsentry);G.barriers.forEach(dbarrier);G.rings.forEach(rdraw);G.lt.forEach(lootDraw);G.bs.forEach(trail);G.eb.forEach(trail);G.bs.forEach(bul);G.eb.forEach(bul);G.links.forEach(linkDraw);G.en.forEach(enemyCue);G.en.forEach(enemyDraw);for(let i=0;i<G.drones;i++){let a=G.t*1.5+i*6.28/G.drones;circ(P.x+Math.cos(a)*70,P.y+Math.sin(a)*70,9,'#6aff9e')}playerDraw();if(!isBossRoom()){drawLighting();drawFog()}else{glow(P.x,P.y,120,'#62e3ff',.08);}G.pt.forEach(p=>{X.globalAlpha=cl(p.l/p.ml,0,1);X.fillStyle=p.c;X.shadowColor=p.c;X.shadowBlur=10;X.beginPath();X.arc(p.x,p.y,p.s,0,7);X.fill();X.shadowBlur=0;X.globalAlpha=1});G.txt.forEach(t=>{X.fillStyle=t.c;X.font='bold 15px sans-serif';X.textAlign='center';X.fillText(t.t,t.x,t.y)});X.restore();drawVignette();if(G.hitFlash>0){X.fillStyle=`rgba(255,30,70,${G.hitFlash*.24})`;X.fillRect(0,0,W,H)}if(G.flash>0){X.fillStyle=`rgba(255,255,255,${G.flash*.18})`;X.fillRect(0,0,W,H)}if(G.run)mini();if(G.pause){X.fillStyle='#0008';X.fillRect(0,0,W,H);X.fillStyle='#fff';X.font='900 56px sans-serif';X.textAlign='center';X.fillText('PAUSED',W/2,H/2)}}
function backdrop(){let g=X.createRadialGradient(W/2,H/2,20,W/2,H/2,Math.max(W,H));g.addColorStop(0,'#142b4f');g.addColorStop(.55,'#050814');g.addColorStop(1,'#010208');X.fillStyle=g;X.fillRect(0,0,W,H);for(let i=0;i<95;i++){let x=(i*97+G.t*9)%W,y=(i*193+G.t*4)%H;X.fillStyle='rgba(180,230,255,.075)';X.fillRect(x,y,1.2,1.2)}for(let i=0;i<4;i++){let x=(G.t*18+i*420)%W;let lg=X.createLinearGradient(x-160,0,x+160,H);lg.addColorStop(0,'rgba(98,227,255,0)');lg.addColorStop(.5,'rgba(98,227,255,.025)');lg.addColorStop(1,'rgba(98,227,255,0)');X.fillStyle=lg;X.fillRect(x-160,0,320,H)}}

function roomTheme(){
  let t=G.cur&&G.cur.type||'combat';
  return t=='shop'?['#072018','#6aff9e','MARKET']:t=='lore'?['#071b2a','#62e3ff','ARCHIVE']:t=='forge'?['#241508','#ff9f1c','FORGE']:t=='shrine'?['#21190a','#ffd166','SHRINE']:t=='rescue'?['#071e22','#62e3ff','RESCUE']:t=='boss'?['#230711','#ff426b','BOSS ROOM']:t=='miniboss'?['#241308','#ff9f1c','MINI-BOSS']:t=='key'?['#201a07','#ffd166','KEY ROOM']:t=='treasure'?['#211b08','#ffd166','TREASURE']:['#08111a','#62e3ff','DUNGEON'];
}

function featureBadge(text,x,y,col,bg){
  X.save();
  let w=Math.max(120,text.length*8.3), h=30;
  X.fillStyle=bg||'rgba(6,10,16,.76)';
  X.strokeStyle=col;
  X.lineWidth=1.6;
  X.shadowColor=col; X.shadowBlur=10;
  rr(x-w/2,y-h/2,w,h,10); X.fill();
  X.shadowBlur=0;
  rr(x-w/2,y-h/2,w,h,10); X.stroke();
  X.fillStyle='#f4fbff';
  X.textAlign='center';
  X.font='900 14px sans-serif';
  X.fillText(text,x,y+5);
  X.restore();
}
function drawSpecialPrompt(title,subtitle,col){
  X.save();
  let y=PH/2+110;
  let w=255,h=64;
  let g=X.createLinearGradient(PW/2-w/2,y-h/2,PW/2+w/2,y+h/2);
  g.addColorStop(0,'rgba(4,8,14,.92)');
  g.addColorStop(1,'rgba(14,20,30,.82)');
  X.fillStyle=g;
  X.strokeStyle=col;
  X.lineWidth=2;
  X.shadowColor=col; X.shadowBlur=16;
  rr(PW/2-w/2,y-h/2,w,h,16); X.fill();
  X.shadowBlur=0;
  rr(PW/2-w/2,y-h/2,w,h,16); X.stroke();
  X.textAlign='center';
  X.fillStyle='#ffffff';
  X.font='900 17px sans-serif';
  X.fillText(title,PW/2,y-4);
  X.font='12px sans-serif';
  X.fillStyle='rgba(232,244,255,.86)';
  X.fillText(subtitle,PW/2,y+18);
  X.restore();
}
function drawMarketRoom(){
  let cx=PW/2, cy=PH/2;
  X.save();
  glow(cx,cy,230,'#6aff9e',.14);
  X.fillStyle='rgba(0,0,0,.24)';
  X.beginPath(); X.ellipse(cx,cy+58,150,34,0,0,7); X.fill();
  X.fillStyle='rgba(22,34,28,.88)';
  X.strokeStyle='rgba(106,255,158,.65)';
  X.lineWidth=2;
  rr(cx-120,cy-14,240,66,18); X.fill(); rr(cx-120,cy-14,240,66,18); X.stroke();
  X.fillStyle='rgba(48,70,60,.95)';
  rr(cx-132,cy+44,18,64,8); X.fill();
  rr(cx+114,cy+44,18,64,8); X.fill();
  rr(cx-14,cy+44,28,52,10); X.fill();
  let canopy=X.createLinearGradient(cx-150,cy-78,cx+150,cy-26);
  canopy.addColorStop(0,'#82ffbd');
  canopy.addColorStop(.5,'#d9fff0');
  canopy.addColorStop(1,'#57ef92');
  X.fillStyle=canopy;
  X.beginPath();
  X.moveTo(cx-150,cy-34); X.quadraticCurveTo(cx,cy-98,cx+150,cy-34);
  X.lineTo(cx+126,cy+2); X.quadraticCurveTo(cx,cy-42,cx-126,cy+2); X.closePath();
  X.fill();
  X.strokeStyle='rgba(255,255,255,.35)'; X.stroke();
  for(let i=0;i<5;i++){
    X.strokeStyle='rgba(255,255,255,.18)';
    X.beginPath();
    let px=cx-102+i*51;
    X.moveTo(px,cy-27); X.lineTo(px,cy+6); X.stroke();
  }
  [['SCRAP',cx-66],['CELLS',cx],['GEAR',cx+68]].forEach(([t,x])=>{
    X.fillStyle='rgba(8,12,18,.65)'; rr(x-28,cy+4,56,22,8); X.fill();
    X.strokeStyle='rgba(255,255,255,.12)'; rr(x-28,cy+4,56,22,8); X.stroke();
    X.fillStyle='#eafaff'; X.font='900 10px sans-serif'; X.textAlign='center'; X.fillText(t,x,cy+19);
  });
  // crates / stock
  [[cx-86,cy+64,42,28],[cx-30,cy+68,36,24],[cx+20,cy+67,46,25],[cx+78,cy+62,38,29]].forEach(([x,y,w,h],i)=>{
    X.fillStyle=i%2?'#79623f':'#675332'; rr(x,y,w,h,6); X.fill();
    X.strokeStyle='rgba(255,255,255,.15)'; rr(x,y,w,h,6); X.stroke();
    X.strokeStyle='rgba(0,0,0,.25)';
    X.beginPath(); X.moveTo(x+6,y+8); X.lineTo(x+w-6,y+h-8); X.stroke();
    X.beginPath(); X.moveTo(x+w-6,y+8); X.lineTo(x+6,y+h-8); X.stroke();
  });
  circ(cx-92,cy+24,7,'#62e3ff'); circ(cx+95,cy+18,7,'#ffd166'); circ(cx+20,cy+26,7,'#ff8fab');
  featureBadge('MARKET',cx,cy-104,'rgba(106,255,158,.9)','rgba(5,20,10,.82)');
  drawSpecialPrompt('MARKET: PRESS E','buy upgrades, energy and repairs','rgba(106,255,158,.9)');
  X.restore();
}
function drawShrineRoom(){
  let cx=PW/2, cy=PH/2;
  X.save();
  glow(cx,cy,240,'#ffd166',.18);
  X.fillStyle='rgba(0,0,0,.26)';
  X.beginPath(); X.ellipse(cx,cy+66,128,34,0,0,7); X.fill();
  X.strokeStyle='rgba(255,209,102,.55)';
  X.lineWidth=2;
  for(let r=122;r>=68;r-=18){X.beginPath();X.arc(cx,cy+22,r,0,7);X.stroke();}
  X.fillStyle='rgba(62,48,22,.95)';
  rr(cx-92,cy+12,184,28,12); X.fill();
  rr(cx-62,cy-8,124,28,12); X.fill();
  rr(cx-28,cy-42,56,40,10); X.fill();
  X.fillStyle='rgba(255,230,166,.95)';
  X.beginPath(); X.moveTo(cx,cy-82); X.lineTo(cx+18,cy-44); X.lineTo(cx,cy-18); X.lineTo(cx-18,cy-44); X.closePath(); X.fill();
  X.strokeStyle='rgba(255,255,255,.35)'; X.stroke();
  for(let i=-1;i<=1;i++){
    let px=cx+i*72, py=cy+34;
    X.fillStyle='rgba(34,24,10,.95)'; rr(px-8,py,16,24,6); X.fill();
    X.fillStyle='rgba(255,221,135,.96)'; X.beginPath(); X.arc(px,py-2+Math.sin(G.t*5+i)*1.4,8,0,7); X.fill();
    glow(px,py-2,24,'#ffd166',.18);
  }
  X.strokeStyle='rgba(255,255,255,.18)';
  X.beginPath(); X.moveTo(cx,cy-66); X.lineTo(cx,cy-18); X.stroke();
  featureBadge(G.cur.used?'SHRINE BLESSED':'SHRINE',cx,cy-112,'rgba(255,209,102,.95)','rgba(28,18,4,.82)');
  drawSpecialPrompt(G.cur.used?'SHRINE USED':'SHRINE: PRESS E',G.cur.used?'already claimed this blessing':'claim a relic blessing and xp','rgba(255,209,102,.95)');
  X.restore();
}
function drawRescueRoom(){
  let cx=PW/2, cy=PH/2;
  X.save();
  glow(cx,cy,230,'#62e3ff',.16);
  X.fillStyle='rgba(0,0,0,.26)';
  X.beginPath(); X.ellipse(cx,cy+68,136,34,0,0,7); X.fill();
  // rescue pod frame
  let frame=X.createLinearGradient(cx-92,cy-76,cx+92,cy+84);
  frame.addColorStop(0,'rgba(26,52,70,.96)');
  frame.addColorStop(1,'rgba(8,16,26,.96)');
  X.fillStyle=frame;
  X.strokeStyle='rgba(98,227,255,.7)';
  X.lineWidth=2;
  rr(cx-94,cy-76,188,176,22); X.fill(); rr(cx-94,cy-76,188,176,22); X.stroke();
  X.fillStyle='rgba(110,230,255,.14)';
  rr(cx-70,cy-52,140,128,18); X.fill();
  X.strokeStyle='rgba(255,255,255,.12)';
  rr(cx-70,cy-52,140,128,18); X.stroke();
  for(let i=-2;i<=2;i++){
    let x=cx+i*24;
    X.strokeStyle='rgba(180,240,255,.22)';
    X.lineWidth=4;
    X.beginPath(); X.moveTo(x,cy-42); X.lineTo(x,cy+66); X.stroke();
  }
  // person silhouette
  X.fillStyle=G.cur.used?'rgba(170,255,200,.92)':'rgba(228,244,255,.88)';
  X.beginPath(); X.arc(cx,cy-18,16,0,7); X.fill();
  X.beginPath();
  X.moveTo(cx,cy-2); X.lineTo(cx+18,cy+20); X.lineTo(cx+12,cy+58); X.lineTo(cx-12,cy+58); X.lineTo(cx-18,cy+20); X.closePath();
  X.fill();
  X.strokeStyle='rgba(255,255,255,.18)';
  X.beginPath(); X.moveTo(cx-8,cy+10); X.lineTo(cx-22,cy+38); X.moveTo(cx+8,cy+10); X.lineTo(cx+22,cy+38); X.moveTo(cx-8,cy+58); X.lineTo(cx-18,cy+88); X.moveTo(cx+8,cy+58); X.lineTo(cx+18,cy+88); X.stroke();
  X.fillStyle=G.cur.used?'rgba(38,82,55,.96)':'rgba(114,28,37,.95)';
  rr(cx-36,cy-90,72,24,9); X.fill();
  X.fillStyle='#fff';
  X.font='900 12px sans-serif';
  X.textAlign='center';
  X.fillText(G.cur.used?'RESCUED':'SOS',cx,cy-73);
  featureBadge(G.cur.used?'RESCUED':'RESCUE',cx,cy-112,'rgba(98,227,255,.95)','rgba(6,22,28,.84)');
  drawSpecialPrompt(G.cur.used?'RESCUE USED':'RESCUE: PRESS E',G.cur.used?'the captive has already been saved':'restore health, shield and energy','rgba(98,227,255,.95)');
  X.restore();
}
function drawArchiveRoom(){
  let cx=PW/2, cy=PH/2;
  X.save();
  glow(cx,cy,220,'#62e3ff',.17);
  X.fillStyle='rgba(0,0,0,.24)';
  X.beginPath(); X.ellipse(cx,cy+64,144,34,0,0,7); X.fill();
  // desk
  let desk=X.createLinearGradient(cx-126,cy+12,cx+126,cy+68);
  desk.addColorStop(0,'rgba(22,34,52,.98)');
  desk.addColorStop(1,'rgba(8,13,20,.98)');
  X.fillStyle=desk;
  X.strokeStyle='rgba(98,227,255,.55)';
  X.lineWidth=2;
  rr(cx-126,cy+12,252,56,14); X.fill(); rr(cx-126,cy+12,252,56,14); X.stroke();
  // main monitor
  X.fillStyle='rgba(10,22,36,.98)'; rr(cx-64,cy-54,128,82,12); X.fill();
  X.strokeStyle='rgba(130,235,255,.75)'; rr(cx-64,cy-54,128,82,12); X.stroke();
  let scr=X.createLinearGradient(cx-56,cy-46,cx+56,cy+18);
  scr.addColorStop(0,'rgba(70,220,255,.32)'); scr.addColorStop(1,'rgba(10,40,55,.68)');
  X.fillStyle=scr; rr(cx-56,cy-46,112,66,10); X.fill();
  // side monitors
  [[-118,-26,44,58],[74,-26,44,58]].forEach(([dx,dy,w,h])=>{
    X.fillStyle='rgba(10,22,36,.96)'; rr(cx+dx,cy+dy,w,h,10); X.fill();
    X.strokeStyle='rgba(98,227,255,.55)'; rr(cx+dx,cy+dy,w,h,10); X.stroke();
    X.fillStyle='rgba(92,232,255,.14)'; rr(cx+dx+5,cy+dy+6,w-10,h-12,8); X.fill();
  });
  // server columns
  [[cx-150,cy-44],[cx+128,cy-44]].forEach(([x,y])=>{
    X.fillStyle='rgba(18,24,34,.96)'; rr(x,y,26,112,8); X.fill();
    X.strokeStyle='rgba(255,255,255,.1)'; rr(x,y,26,112,8); X.stroke();
    for(let i=0;i<6;i++){circ(x+8,y+12+i*16,2.4,i%2?'#62e3ff':'#6aff9e')}
  });
  // code lines
  X.strokeStyle='rgba(200,245,255,.32)'; X.lineWidth=2;
  for(let i=0;i<5;i++){X.beginPath();X.moveTo(cx-40,cy-30+i*10);X.lineTo(cx+28+(i%2)*18,cy-30+i*10);X.stroke()}
  X.fillStyle='rgba(98,227,255,.88)'; X.fillRect(cx-12,cy+28,24,16);
  X.fillStyle='#eafaff'; X.font='900 11px monospace'; X.fillText('XP',cx,cy+40);
  featureBadge('ARCHIVE',cx,cy-112,'rgba(98,227,255,.95)','rgba(5,18,24,.84)');
  drawSpecialPrompt('ARCHIVE: PRESS E','solve a terminal puzzle for xp','rgba(98,227,255,.95)');
  X.restore();
}
function drawForgeRoom(){
  let cx=PW/2, cy=PH/2;
  X.save();
  glow(cx,cy,230,'#ff9f1c',.18);
  X.fillStyle='rgba(0,0,0,.28)';
  X.beginPath(); X.ellipse(cx,cy+64,136,36,0,0,7); X.fill();
  let fire=X.createRadialGradient(cx,cy-14,8,cx,cy-14,46);
  fire.addColorStop(0,'rgba(255,232,150,.98)');
  fire.addColorStop(.4,'rgba(255,170,70,.9)');
  fire.addColorStop(1,'rgba(255,110,18,0)');
  X.fillStyle=fire; X.beginPath(); X.arc(cx,cy-12,46,0,7); X.fill();
  X.fillStyle='rgba(54,34,18,.98)'; rr(cx-118,cy+12,236,24,10); X.fill();
  X.fillStyle='rgba(42,24,12,.98)'; rr(cx-94,cy-4,188,20,10); X.fill();
  X.strokeStyle='rgba(255,159,28,.62)'; X.lineWidth=2; rr(cx-118,cy+12,236,24,10); X.stroke(); rr(cx-94,cy-4,188,20,10); X.stroke();
  // anvil + weapon silhouette
  X.fillStyle='rgba(70,78,88,.98)'; rr(cx-24,cy-30,48,16,6); X.fill();
  X.beginPath(); X.moveTo(cx-56,cy-14); X.lineTo(cx+56,cy-14); X.lineTo(cx+18,cy+10); X.lineTo(cx-24,cy+10); X.closePath(); X.fill();
  X.fillRect(cx-10,cy+10,20,22);
  X.fillRect(cx-30,cy+32,60,8);
  X.strokeStyle='rgba(255,255,255,.18)'; X.strokeRect(cx-10,cy+10,20,22);
  X.save(); X.translate(cx+36,cy-34); X.rotate(-.28);
  X.fillStyle='rgba(216,232,245,.95)'; rr(-28,-5,56,10,4); X.fill();
  X.fillStyle='rgba(70,44,20,.98)'; rr(18,-8,12,16,4); X.fill();
  X.restore();
  featureBadge(G.cur.used?'FORGE USED':'FORGE',cx,cy-112,'rgba(255,159,28,.95)','rgba(28,14,4,.84)');
  drawSpecialPrompt(G.cur.used?'FORGE USED':'FORGE: PRESS E',G.cur.used?'this forge has already been used':'solve a forge puzzle to craft a gun','rgba(255,159,28,.95)');
  X.restore();
}
function drawRoomFeature(){
  if(!(G.cur.type=='shop'||G.cur.term||['shrine','rescue','forge'].includes(G.cur.type)))return;
  if(G.cur.type=='shop'){ drawMarketRoom(); return; }
  if(G.cur.term){ drawArchiveRoom(); return; }
  if(G.cur.type=='shrine'){ drawShrineRoom(); return; }
  if(G.cur.type=='rescue'){ drawRescueRoom(); return; }
  if(G.cur.type=='forge'){ drawForgeRoom(); return; }
}

function roomDraw(){let th=roomTheme(),g=X.createLinearGradient(0,0,PW,PH);g.addColorStop(0,th[0]);g.addColorStop(.48,'#0d151e');g.addColorStop(1,'#05090f');X.fillStyle=g;X.fillRect(0,0,PW,PH);
for(let x=0;x<PW;x+=T){for(let y=0;y<PH;y+=T){metalPanel(x+3,y+3,T-6,T-6,((x/T+y/T+G.rx+G.ry)%7)==0)}}
for(let i=0;i<42;i++){let x=(i*137+G.rx*61)%PW,y=(i*211+G.ry*47)%PH;X.fillStyle='rgba(0,0,0,.06)';X.beginPath();X.arc(x,y,14+(i%20),0,7);X.fill()}
X.strokeStyle='rgba(98,227,255,.08)';X.lineWidth=1;for(let x=0;x<=PW;x+=T){X.beginPath();X.moveTo(x,0);X.lineTo(x,PH);X.stroke()}for(let y=0;y<=PH;y+=T){X.beginPath();X.moveTo(0,y);X.lineTo(PW,y);X.stroke()}
X.strokeStyle=rgba(th[1],.56);X.lineWidth=9;X.shadowColor=th[1];X.shadowBlur=10;X.strokeRect(8,8,PW-16,PH-16);X.shadowBlur=0;X.fillStyle=rgba(th[1],.16);rr(28,28,190,38,12);X.fill();X.fillStyle=th[1];X.font='900 18px sans-serif';X.textAlign='left';X.fillText(th[2],45,53);
doorD('N',PW/2-65,0,130,24);doorD('S',PW/2-65,PH-24,130,24);doorD('W',0,PH/2-65,24,130);doorD('E',PW-24,PH/2-65,24,130);
G.cur.obs.forEach(o=>{X.save();
X.shadowColor='rgba(0,0,0,.55)';X.shadowBlur=24;X.shadowOffsetY=6;
let og=X.createLinearGradient(o.x,o.y,o.x,o.y+o.h);
og.addColorStop(0,'#41556b');
og.addColorStop(.18,'#314355');
og.addColorStop(.58,'#1d2a37');
og.addColorStop(1,'#0d151d');
X.fillStyle=og;
rr(o.x,o.y,o.w,o.h,13);X.fill();
X.shadowBlur=0;X.shadowOffsetY=0;
X.strokeStyle='rgba(255,255,255,.32)';X.lineWidth=2.2;rr(o.x,o.y,o.w,o.h,13);X.stroke();
X.strokeStyle='rgba(98,227,255,.18)';X.lineWidth=1;rr(o.x+2,o.y+2,o.w-4,o.h-4,11);X.stroke();
let topGlow=X.createLinearGradient(o.x,o.y,o.x,o.y+18);
topGlow.addColorStop(0,'rgba(255,255,255,.16)');
topGlow.addColorStop(1,'rgba(255,255,255,0)');
X.fillStyle=topGlow;rr(o.x+3,o.y+3,o.w-6,14,8);X.fill();
X.fillStyle='rgba(98,227,255,.18)';X.fillRect(o.x+10,o.y+10,o.w-20,5);
X.fillStyle='rgba(255,255,255,.07)';X.fillRect(o.x+10,o.y+18,o.w-20,2);
X.fillStyle='rgba(0,0,0,.22)';X.fillRect(o.x+10,o.y+o.h-12,o.w-20,3);
for(let i=o.x+18;i<o.x+o.w-18;i+=22){X.fillStyle='rgba(255,255,255,.055)';X.fillRect(i,o.y+24,2,o.h-48)}
circ(o.x+12,o.y+12,2.3,'rgba(255,255,255,.28)');circ(o.x+o.w-12,o.y+12,2.3,'rgba(255,255,255,.28)');
circ(o.x+12,o.y+o.h-12,2.3,'rgba(255,255,255,.18)');circ(o.x+o.w-12,o.y+o.h-12,2.3,'rgba(255,255,255,.18)');
X.restore()});
drawRoomFeature()
}
function doorD(d,x,y,w,h){if(G.cur.doors[d]){let open=G.cur.clr;let dg=X.createLinearGradient(x,y,x+w,y+h);dg.addColorStop(0,open?'rgba(98,227,255,.55)':'rgba(255,77,109,.6)');dg.addColorStop(1,'rgba(5,8,12,.5)');X.fillStyle=dg;X.shadowColor=open?'#62e3ff':'#ff4d6d';X.shadowBlur=14;X.fillRect(x,y,w,h);X.shadowBlur=0;X.strokeStyle='rgba(255,255,255,.18)';X.strokeRect(x,y,w,h)}}
function haz(h){let r=h.r*(.75+.18*Math.sin(G.t*4+h.p));X.fillStyle='#ff4d6d22';X.strokeStyle='#ff4d6d88';circ(h.x,h.y,r)}function circ(x,y,r,c){X.beginPath();X.arc(x,y,r,0,7);if(c)X.fillStyle=c;X.fill();X.stroke()}function lootDraw(l){X.save();X.translate(l.x,l.y);X.rotate(G.t*2);X.fillStyle=l.type=='key'?'#ffd166':l.type=='core'?'#b28dff':l.type=='cell'?'#6aff9e':'#dff7ff';X.font='24px sans-serif';X.textAlign='center';X.textBaseline='middle';X.font='900 14px sans-serif';X.fillText(l.type=='key'?'KEY':l.type=='core'?'CORE':l.type=='cell'?'CELL':l.type=='artifact'?'ART':'SCR',0,0);X.restore()}function trail(b){let a=Math.atan2(b.vy,b.vx),w=Math.max(10,b.r*3.2),h=w*.38;X.save();X.translate(b.x-b.vx*.024,b.y-b.vy*.024);X.rotate(a);X.globalAlpha=.24;X.fillStyle='rgba(128,72,34,.34)';X.beginPath();X.ellipse(-w*.62,0,w*.76,h*.3,0,0,7);X.fill();X.globalAlpha=.13;X.fillStyle='rgba(255,224,170,.45)';X.beginPath();X.ellipse(-w*.35,0,w*.4,h*.16,0,0,7);X.fill();X.restore()}function bul(b){let a=Math.atan2(b.vy,b.vx),w=Math.max(12,b.r*4.2),h=w*.48;X.save();X.translate(b.x,b.y);X.rotate(a);X.shadowColor=b.col;X.shadowBlur=18;if(BRISKET_IMG.complete){X.drawImage(BRISKET_IMG,-w*.64,-h*.53,w*1.28,h*1.06);X.globalAlpha=.26;X.fillStyle='rgba(255,235,180,.5)';X.beginPath();X.ellipse(-w*.08,-h*.16,w*.22,h*.1,0,0,7);X.fill();X.globalAlpha=1}else{X.fillStyle='#4b2a17';rr(-w*.55,-h*.36,w*1.1,h*.72,h*.28);X.fill()}X.shadowBlur=0;X.restore()}function rdraw(r){X.globalAlpha=cl(r.l/r.ml,0,1);X.strokeStyle=r.c;X.lineWidth=3;X.beginPath();X.arc(r.x,r.y,r.r,0,7);X.stroke();X.globalAlpha=1}function linkDraw(l){X.globalAlpha=cl(l.l/.22,0,1);X.strokeStyle=l.c;X.lineWidth=4;X.beginPath();X.moveTo(l.x1,l.y1);X.lineTo(l.x2,l.y2);X.stroke();X.globalAlpha=1}

function enemyCue(e){
  if(e.dead)return;
  if(e.type=='sniper'){
    X.save();
    X.strokeStyle='rgba(125,249,255,.36)';
    X.lineWidth=1.5+Math.sin(G.t*12)*.5;
    X.setLineDash([10,10]);
    X.beginPath();X.moveTo(e.x,e.y);X.lineTo(P.x,P.y);X.stroke();
    X.setLineDash([]);
    X.fillStyle='rgba(125,249,255,.16)';
    X.beginPath();X.arc(e.x,e.y,e.r*1.35,0,7);X.fill();
    X.restore();
  }
  if(e.type=='bomber'){
    let pulse=.5+.5*Math.sin(G.t*9);
    X.save();
    X.strokeStyle=`rgba(255,159,28,${.35+.35*pulse})`;
    X.lineWidth=3;
    X.beginPath();X.arc(e.x,e.y,e.r*1.7+pulse*9,0,7);X.stroke();
    X.restore();
  }
  if(e.type=='healer'){
    let low=G.en.filter(o=>o!==e&&!o.dead&&o.h<o.mh&&di(e.x,e.y,o.x,o.y)<260).sort((a,b)=>a.h/a.mh-b.h/b.mh)[0];
    if(low){
      X.save();
      X.strokeStyle='rgba(156,255,177,.38)';
      X.lineWidth=3;
      X.beginPath();X.moveTo(e.x,e.y);X.lineTo(low.x,low.y);X.stroke();
      X.restore();
    }
  }
  if(e.type=='shield'){
    X.save();
    X.strokeStyle='rgba(155,183,255,.38)';
    X.lineWidth=3;
    X.beginPath();X.arc(e.x,e.y,140,0,7);X.stroke();
    X.restore();
  }
  if(['turret','tank','sniper','shield','boss'].includes(e.type)&&e.cd<.38){X.save();X.strokeStyle=rgba(e.col,.65);X.lineWidth=2+Math.sin(G.t*20)*1.2;X.beginPath();X.arc(e.x,e.y,e.r*1.8+(0.38-e.cd)*24,0,7);X.stroke();X.restore();}
  if(e.type=='boss'){
    X.save();
    X.strokeStyle='rgba(255,255,255,.16)';
    X.lineWidth=5;
    X.beginPath();X.arc(e.x,e.y,e.r*2.1+Math.sin(G.t*4)*8,0,7);X.stroke();
    X.restore();
  }
}

function isBossRoom(){return G&&G.cur&&G.cur.boss}
function simpleBossDraw(e){
  softShadow(e.x,e.y,e.r,.35);
  glow(e.x,e.y,e.r*2.6,'#ff4d6d',.12);
  X.save();
  X.translate(e.x,e.y);
  let pulse=1+Math.sin(G.t*4)*.035;
  X.scale(pulse,pulse);
  let grad=X.createRadialGradient(-14,-18,8,0,0,e.r*1.6);
  grad.addColorStop(0,'#ffffff');
  grad.addColorStop(.18,'#ffb3c1');
  grad.addColorStop(.55,'#8c1f35');
  grad.addColorStop(1,'#250711');
  X.fillStyle=grad;
  X.strokeStyle='rgba(255,255,255,.32)';
  X.lineWidth=3;
  X.beginPath();
  X.arc(0,0,e.r,0,7);
  X.fill();
  X.stroke();

  // armor plates
  X.fillStyle='rgba(0,0,0,.34)';
  for(let i=0;i<6;i++){
    let a=i*Math.PI/3+G.t*.25;
    X.beginPath();
    X.arc(Math.cos(a)*e.r*.68,Math.sin(a)*e.r*.68,e.r*.18,0,7);
    X.fill();
  }

  // eye/core
  X.fillStyle='#fff';
  X.beginPath();
  X.ellipse(0,-5,e.r*.38,e.r*.2,0,0,7);
  X.fill();
  X.fillStyle='#ff426b';
  X.beginPath();
  X.arc(Math.sin(G.t*2)*5,-5,e.r*.11,0,7);
  X.fill();

  X.fillStyle='#ff426b';
  X.font='900 12px sans-serif';
  X.textAlign='center';
  X.fillText(e.phase?('PHASE '+e.phase):'WARDEN',0,e.r+18);
  X.restore();
}

function enemyDraw(e){
if(e.type=='boss'){simpleBossDraw(e);return}
softShadow(e.x,e.y,e.r,.34);
glow(e.x,e.y,e.r*(e.elite?3.5:2.7),e.col,e.elite||e.type=='boss'?.14:.09);
let face=Math.atan2(P.y-e.y,P.x-e.x),walk=Math.sin(G.t*6+e.x*.02)*2.2,bob=Math.sin(G.t*4+e.y*.015)*1.5;
X.save();
X.translate(e.x,e.y);
X.rotate(face);


{
  let useMini=!!(e.miniboss||e.mini);
  let IMG=useMini?MINIBOSS_IMG:(diff().epstein?EPSTEIN_IMG:ALT_ENEMY_IMG);
  let CROP=useMini?MINIBOSS_CROP:(diff().epstein?EPSTEIN_CROP:ALT_ENEMY_CROP);
  let halo=useMini?'#ff9f1c':(diff().epstein?(e.elite?'#ff7bff':'#ff4d6d'):(e.type=='healer'?'#6aff9e':e.type=='shield'?'#62e3ff':e.type=='sniper'?'#ffd166':e.type=='bomber'?'#ff8fab':(e.elite?'#b28dff':e.col)));
  let cue= e.type=='healer'?'#6aff9e' : e.type=='shield'?'#62e3ff' : e.type=='sniper'?'#ffd166' : e.type=='bomber'?'#ff8fab' : e.col;
  let sx=IMG.width*CROP[0], sy=IMG.height*CROP[1], sw=IMG.width*CROP[2], sh=IMG.height*CROP[3];
  X.save();
  X.beginPath();
  X.arc(0,0,e.r*.98,0,Math.PI*2);
  X.closePath();
  X.clip();
  if(IMG.complete&&IMG.naturalWidth){
    X.drawImage(IMG,sx,sy,sw,sh,-e.r,-e.r,e.r*2,e.r*2);
  }else{
    let g=X.createRadialGradient(-e.r*.25,-e.r*.25,1,0,0,e.r*1.2);
    g.addColorStop(0,'#f6f3ee');
    g.addColorStop(.42,'#9e7b65');
    g.addColorStop(1,'#40342d');
    X.fillStyle=g;
    X.fillRect(-e.r,-e.r,e.r*2,e.r*2);
  }
  X.restore();

  // outer ring
  X.strokeStyle='rgba(255,255,255,.68)';
  X.lineWidth=2.2;
  X.beginPath();
  X.arc(0,0,e.r*.98,0,Math.PI*2);
  X.stroke();

  // colored aura ring so enemy classes are still readable
  X.strokeStyle=halo;
  X.lineWidth=e.elite?4:3;
  X.shadowColor=halo;
  X.shadowBlur=e.elite?18:10;
  X.beginPath();
  X.arc(0,0,e.r*1.1,0,Math.PI*2);
  X.stroke();
  X.shadowBlur=0;

  // small class marker
  X.fillStyle='rgba(0,0,0,.62)';
  rr(-18,e.r*.68,36,18,8); X.fill();
  X.strokeStyle=cue;
  X.lineWidth=1.5;
  rr(-18,e.r*.68,36,18,8); X.stroke();
  X.fillStyle='#ffffff';
  X.font='900 10px sans-serif';
  X.textAlign='center';
  X.fillText(
    (e.miniboss||e.mini)?'MINI':
    e.type=='healer'?'HEAL':
    e.type=='shield'?'SHLD':
    e.type=='sniper'?'SNIPE':
    e.type=='bomber'?'BOMB':'ENEMY',
    0,e.r*.81
  );

  // elite crown
  if(e.elite){
    X.fillStyle='rgba(255,215,90,.95)';
    X.beginPath();
    X.moveTo(-12,-e.r-6); X.lineTo(-4,-e.r-18); X.lineTo(0,-e.r-8);
    X.lineTo(5,-e.r-20); X.lineTo(12,-e.r-6); X.closePath();
    X.fill();
  }

  X.restore();
  X.fillStyle='rgba(0,0,0,.72)';
  X.fillRect(e.x-e.r,e.y-e.r-16,e.r*2,6);
  let hb=X.createLinearGradient(e.x-e.r,0,e.x+e.r,0);
  hb.addColorStop(0,'#ff426b');
  hb.addColorStop(1,'#ffb0bf');
  X.fillStyle=hb;
  X.fillRect(e.x-e.r,e.y-e.r-16,e.r*2*e.h/e.mh,6);
  return;
}

let bodyGrad=(a,b)=>{let g=X.createLinearGradient(-e.r,-e.r,e.r,e.r);g.addColorStop(0,a);g.addColorStop(.45,rgba(e.col,.9));g.addColorStop(1,b);return g};
let dark='rgba(7,10,16,.98)', mid='rgba(255,255,255,.2)', lite='rgba(255,255,255,.92)';

function strokePlate(){X.strokeStyle='rgba(255,255,255,.2)';X.lineWidth=1.4;X.stroke();X.strokeStyle='rgba(0,0,0,.24)';X.lineWidth=1;X.stroke()}
function eye(x,y,r,col=e.col){let g=X.createRadialGradient(x-r*.25,y-r*.25,1,x,y,r*2.4);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.32,rgba(col,1));g.addColorStop(1,rgba(col,0));X.fillStyle=g;X.beginPath();X.arc(x,y,r*2.2,0,7);X.fill();X.fillStyle=lite;X.beginPath();X.arc(x,y,r,0,7);X.fill();X.fillStyle='rgba(0,0,0,.38)';X.beginPath();X.arc(x,y,r*.42,0,7);X.fill();X.fillStyle='rgba(255,255,255,.9)';X.beginPath();X.arc(x-r*.28,y-r*.28,r*.2,0,7);X.fill()}
function limb(x1,y1,x2,y2,w=2.4,col='rgba(255,255,255,.26)'){X.strokeStyle=col;X.lineWidth=w;X.beginPath();X.moveTo(x1,y1);X.lineTo(x2,y2);X.stroke()}
function plate(x,y,w,h,r,fill){X.fillStyle=fill;rr(x,y,w,h,r);X.fill();strokePlate()}
function spokeArm(len,spread=0){limb(e.r*.36,spread,e.r*.8,spread+walk,2.2);limb(-e.r*.3,spread,-e.r*.86,spread-walk,2.2)}
function legPair(yOff=0){limb(-e.r*.55,-e.r*.12+yOff,-e.r*1.02,-e.r*.42+walk+yOff,2);limb(-e.r*.55,e.r*.12+yOff,-e.r*1.02,e.r*.42-walk+yOff,2);limb(e.r*.5,-e.r*.12+yOff,e.r*.96,-e.r*.42-walk+yOff,2);limb(e.r*.5,e.r*.12+yOff,e.r*.96,e.r*.42+walk+yOff,2)}

X.shadowColor=e.col;
X.shadowBlur=e.elite?26:16;

if(e.type=='drone'){
  X.fillStyle=bodyGrad('#f7fcff',dark);
  X.beginPath();
  X.moveTo(e.r*1.02,0);
  X.quadraticCurveTo(e.r*.72,e.r*.62,0,e.r*.86);
  X.quadraticCurveTo(-e.r*.8,e.r*.56,-e.r*.96,0);
  X.quadraticCurveTo(-e.r*.8,-e.r*.56,0,-e.r*.84);
  X.quadraticCurveTo(e.r*.72,-e.r*.62,e.r*1.02,0);
  X.closePath();
  X.fill(); strokePlate();
  legPair();
  eye(e.r*.12,0,e.r*.2);
}else if(e.type=='dash'){
  X.fillStyle=bodyGrad('#fff6d7',dark);
  X.beginPath();
  X.moveTo(e.r*1.12,0);X.lineTo(-e.r*.2,e.r*.72);X.lineTo(-e.r*.92,e.r*.3);X.lineTo(-e.r*.92,-e.r*.3);X.lineTo(-e.r*.2,-e.r*.72);X.closePath();
  X.fill(); strokePlate();
  limb(-e.r*.2,-e.r*.36,-e.r*.94,-e.r*.68-walk*.3,2);
  limb(-e.r*.2,e.r*.36,-e.r*.94,e.r*.68+walk*.3,2);
  eye(e.r*.18,0,e.r*.17,'#ffd166');
}else if(e.type=='turret'){
  plate(-e.r*.72,-e.r*.72,e.r*1.2,e.r*1.44,8,bodyGrad('#f3ebff',dark));
  X.fillStyle='rgba(255,255,255,.12)';X.beginPath();X.arc(-e.r*.18,0,e.r*.5,0,7);X.fill();
  X.fillStyle='rgba(32,20,40,.95)';rr(-e.r*.1,-e.r*.2,e.r*1.22,e.r*.42,6);X.fill();
  X.fillStyle='#d9c4ff';rr(e.r*.88,-e.r*.14,e.r*.62,e.r*.28,4);X.fill();
  eye(e.r*.26,0,e.r*.18,'#b28dff');
}else if(e.type=='split'){
  X.fillStyle=bodyGrad('#e4ffe8',dark);
  for(let i=0;i<4;i++){X.save();X.rotate(i*Math.PI/2);X.beginPath();X.moveTo(e.r*.88,0);X.quadraticCurveTo(e.r*.42,e.r*.18,0,0);X.quadraticCurveTo(e.r*.42,-e.r*.18,e.r*.88,0);X.fill();X.restore()}
  X.beginPath();X.arc(0,0,e.r*.5,0,7);X.fill();strokePlate();
  eye(0,0,e.r*.18,'#6aff9e');
}else if(e.type=='tank'){
  plate(-e.r*.88,-e.r*.72,e.r*1.45,e.r*1.44,10,bodyGrad('#ffe6ee',dark));
  plate(-e.r*.2,-e.r*.24,e.r*1.05,e.r*.48,6,'rgba(40,20,28,.9)');
  plate(e.r*.78,-e.r*.16,e.r*.74,e.r*.32,6,'#f7b8cb');
  plate(-e.r*.96,-e.r*.78,e.r*.24,e.r*1.56,6,'rgba(255,255,255,.12)');
  plate(-e.r*.66,-e.r*.78,e.r*.24,e.r*1.56,6,'rgba(255,255,255,.08)');
  eye(e.r*.16,0,e.r*.18,'#ff8fab');
}else if(e.type=='sniper'){
  X.fillStyle=bodyGrad('#e7fbff',dark);
  X.beginPath();
  X.moveTo(e.r*.88,0);X.lineTo(e.r*.25,e.r*.52);X.lineTo(-e.r*.82,e.r*.3);X.lineTo(-e.r*.82,-e.r*.3);X.lineTo(e.r*.25,-e.r*.52);X.closePath();
  X.fill(); strokePlate();
  rr(e.r*.55,-e.r*.08,e.r*1.1,e.r*.16,3);X.fillStyle='#e7fbff';X.fill();
  rr(-e.r*.08,-e.r*.42,e.r*.32,e.r*.14,3);X.fillStyle='#d8f8ff';X.fill();
  eye(e.r*.08,0,e.r*.16,'#7df9ff');
}else if(e.type=='bomber'){
  X.fillStyle=bodyGrad('#fff0d7',dark);
  X.beginPath();X.arc(0,0,e.r*.86,0,7);X.fill();strokePlate();
  plate(-e.r*.2,-e.r*.62,e.r*.4,e.r*.32,5,'rgba(255,255,255,.14)');
  X.fillStyle='#2e2018';X.beginPath();X.arc(-e.r*.5,-e.r*.22,e.r*.22,0,7);X.fill();X.beginPath();X.arc(-e.r*.5,e.r*.22,e.r*.22,0,7);X.fill();
  eye(e.r*.16,0,e.r*.16,'#ff9f1c');
  spokeArm(-e.r*.2);
  spokeArm(e.r*.2);
}else if(e.type=='healer'){
  X.fillStyle=bodyGrad('#effff2',dark);
  X.beginPath();X.arc(0,0,e.r*.78,0,7);X.fill();strokePlate();
  X.strokeStyle='rgba(156,255,177,.7)';X.lineWidth=3;X.beginPath();X.arc(0,0,e.r*1.05+Math.sin(G.t*5)*1.5,0,7);X.stroke();
  X.fillStyle='rgba(255,255,255,.86)';rr(-e.r*.1,-e.r*.42,e.r*.2,e.r*.84,3);X.fill();rr(-e.r*.42,-e.r*.1,e.r*.84,e.r*.2,3);X.fill();
  eye(e.r*.02,e.r*.02,e.r*.14,'#9cffb1');
}else if(e.type=='shield'){
  X.fillStyle=bodyGrad('#eef2ff',dark);
  X.beginPath();X.arc(-e.r*.12,0,e.r*.72,0,7);X.fill();strokePlate();
  X.strokeStyle='rgba(155,183,255,.9)';X.lineWidth=4;X.beginPath();X.arc(e.r*.28,0,e.r*.86,-1.02,1.02);X.stroke();
  X.strokeStyle='rgba(255,255,255,.28)';X.lineWidth=2;X.beginPath();X.arc(e.r*.32,0,e.r*.58,-.92,.92);X.stroke();
  rr(-e.r*.18,-e.r*.16,e.r*.78,e.r*.32,6);X.fillStyle='rgba(40,52,80,.92)';X.fill();
  eye(-e.r*.1,0,e.r*.15,'#9bb7ff');
}else if(e.type=='swarm'){
  X.fillStyle=bodyGrad('#ffe4f5',dark);
  X.beginPath();X.ellipse(0,0,e.r*.78,e.r*.56,0,0,7);X.fill();strokePlate();
  X.fillStyle='rgba(255,255,255,.18)';
  X.beginPath();X.ellipse(-e.r*.36,-e.r*.28,e.r*.28,e.r*.18,-.5,0,7);X.fill();
  X.beginPath();X.ellipse(-e.r*.36,e.r*.28,e.r*.28,e.r*.18,.5,0,7);X.fill();
  limb(-e.r*.12,-e.r*.2,-e.r*.78,-e.r*.5+walk*.4,1.8);
  limb(-e.r*.12,0,-e.r*.86,0,1.8);
  limb(-e.r*.12,e.r*.2,-e.r*.78,e.r*.5-walk*.4,1.8);
  eye(e.r*.14,0,e.r*.12,'#ff6bcb');
}else if(e.type=='boss'){
  X.fillStyle=bodyGrad('#ffffff',dark);
  X.beginPath();X.arc(0,0,e.r*.88,0,7);X.fill();strokePlate();
  for(let i=0;i<6;i++){X.save();X.rotate(i*TAU/6+G.t*.18);limb(e.r*.4,0,e.r*1.16,0,3.2,'rgba(255,255,255,.26)');plate(e.r*.98,-e.r*.11,e.r*.34,e.r*.22,5,'rgba(255,255,255,.16)');X.restore()}
  X.strokeStyle='rgba(255,255,255,.24)';X.lineWidth=3;X.beginPath();X.arc(0,0,e.r*.56+Math.sin(G.t*3)*2,0,7);X.stroke();
  eye(0,0,e.r*.23,'#fff');
}else{
  X.fillStyle=bodyGrad('#f7fcff',dark);
  X.beginPath();X.arc(0,0,e.r*.8,0,7);X.fill();strokePlate();
  eye(e.r*.1,0,e.r*.18);
}

if(e.elite){
  X.strokeStyle='rgba(255,123,255,.65)';
  X.lineWidth=2.6;
  X.beginPath();
  X.arc(0,0,e.r*1.18+Math.sin(G.t*7)*1.6,0,7);
  X.stroke();
}
X.shadowBlur=0;
X.restore();

X.fillStyle='rgba(0,0,0,.72)';
X.fillRect(e.x-e.r,e.y-e.r-16,e.r*2,6);
let hb=X.createLinearGradient(e.x-e.r,0,e.x+e.r,0);
hb.addColorStop(0,'#ff426b');
hb.addColorStop(1,'#ffb0bf');
X.fillStyle=hb;
X.fillRect(e.x-e.r,e.y-e.r-16,e.r*2*e.h/e.mh,6)
}
function playerDraw(){
if(P.over>0){glow(P.x,P.y,112,'#b28dff',.24);X.strokeStyle='rgba(178,141,255,.9)';X.lineWidth=4;X.beginPath();X.arc(P.x,P.y,P.r+17+Math.sin(G.t*14)*4,0,7);X.stroke()}
softShadow(P.x,P.y,P.r,.46);
if(P.s>1)glow(P.x,P.y,90,'#62e3ff',.17);
let recoil=P.recoil||0,bob=Math.sin((P.breath||G.t*2.4))*1.02,frameR=P.r*1.21,pulse=Math.sin(G.t*7)*.45,w=weps[ensureWeaponIndex()];
X.save();
X.translate(P.x,P.y);
X.rotate(P.a);
X.globalAlpha=P.iv?.65:1;

X.fillStyle='rgba(2,7,13,.7)';
X.beginPath();
X.ellipse(0,P.r*.93+bob,frameR*1.03,frameR*.42,0,0,7);
X.fill();

let aura=X.createRadialGradient(0,-P.r*.04+bob,frameR*.1,0,-P.r*.04+bob,frameR*1.48);
aura.addColorStop(0,'rgba(255,255,255,.22)');
aura.addColorStop(.32,'rgba(98,227,255,.15)');
aura.addColorStop(1,'rgba(98,227,255,0)');
X.fillStyle=aura;
X.beginPath();
X.arc(0,-P.r*.04+bob,frameR*1.48,0,7);
X.fill();

X.save();
X.beginPath();
X.arc(0,-P.r*.04+bob,frameR,0,7);
X.clip();
if(PLAYER_IMG.complete&&PLAYER_IMG.naturalWidth){
  let c=FACE_CROPS[(P.charId||0)%FACE_CROPS.length]||FACE_CROPS[0],sx=PLAYER_IMG.naturalWidth*c[0],sy=PLAYER_IMG.naturalHeight*c[1],sw=PLAYER_IMG.naturalWidth*c[2],sh=PLAYER_IMG.naturalHeight*c[3];
  X.drawImage(PLAYER_IMG,sx,sy,sw,sh,-frameR,-frameR+bob,frameR*2,frameR*2);
  let shade=X.createRadialGradient(-frameR*.36,-frameR*.48+bob,2,0,0,frameR*1.42);
  shade.addColorStop(0,'rgba(255,255,255,.24)');
  shade.addColorStop(.52,'rgba(0,0,0,0)');
  shade.addColorStop(1,'rgba(0,0,0,.36)');
  X.fillStyle=shade;
  X.fillRect(-frameR,-frameR+bob,frameR*2,frameR*2);
  X.fillStyle='rgba(255,255,255,.08)';
  X.fillRect(-frameR,-frameR+bob,frameR*2,frameR*.32);
}else{
  let faceG=X.createLinearGradient(-frameR,-frameR,frameR,frameR);
  faceG.addColorStop(0,'#f0d3b8');
  faceG.addColorStop(1,'#9b7053');
  X.fillStyle=faceG;
  X.fillRect(-frameR,-frameR,frameR*2,frameR*2)
}
X.restore();

X.lineWidth=3.5;
let rim=X.createLinearGradient(-frameR,-frameR,frameR,frameR);
rim.addColorStop(0,'rgba(255,255,255,.74)');
rim.addColorStop(.48,'rgba(98,227,255,.76)');
rim.addColorStop(1,'rgba(0,0,0,.38)');
X.strokeStyle=rim;
X.beginPath();
X.arc(0,-P.r*.04+bob,frameR,0,7);
X.stroke();

X.strokeStyle='rgba(98,227,255,.48)';
X.lineWidth=1.6;
X.beginPath();
X.arc(0,-P.r*.04+bob,frameR+3+pulse,0,7);
X.stroke();

X.fillStyle='rgba(255,255,255,.22)';
X.beginPath();
X.ellipse(-P.r*.3,-P.r*.52+bob,P.r*.24,P.r*.5,.45,0,7);
X.fill();

let pointer=X.createLinearGradient(P.r*.64,-8,P.r*1.18,8);
pointer.addColorStop(0,'rgba(98,227,255,.24)');
pointer.addColorStop(1,'rgba(98,227,255,0)');
X.fillStyle=pointer;
X.beginPath();
X.moveTo(P.r*.38,-8);
X.lineTo(P.r*1.2,0);
X.lineTo(P.r*.38,8);
X.closePath();
X.fill();

drawHeldWeapon(w,recoil,frameR,bob);
X.restore();

if(P.s>1){
  X.strokeStyle=`rgba(98,227,255,${.26+.44*P.s/P.ms})`;
  X.lineWidth=3.1+Math.sin(G.t*9)*.55;
  X.beginPath();
  X.arc(P.x,P.y,P.r+13,0,7);
  X.stroke();
  X.strokeStyle='rgba(255,255,255,.2)';
  X.lineWidth=1;
  X.beginPath();
  X.arc(P.x,P.y,P.r+18,0,7);
  X.stroke()
}}
function dmine(m){X.strokeStyle='#b28dff99';X.lineWidth=2;X.beginPath();X.arc(m.x,m.y,m.r,0,7);X.stroke();X.fillStyle='#b28dff55';circ(m.x,m.y,8+Math.sin(G.t*14)*3)}function ddecoy(d){X.strokeStyle='#ff7bffcc';X.fillStyle='#ff7bff33';X.lineWidth=3;X.beginPath();X.arc(d.x,d.y,d.r+Math.sin(G.t*10)*4,0,7);X.fill();X.stroke()}function dsentry(s){X.fillStyle='#ffd166';X.strokeStyle='#fff2';X.beginPath();X.roundRect(s.x-13,s.y-13,26,26,8);X.fill();X.stroke()}function dbarrier(b){X.strokeStyle='#62e3ffaa';X.lineWidth=4;X.beginPath();X.arc(b.x,b.y,b.r,0,7);X.stroke()}
function drawLighting(){X.save();X.fillStyle='rgba(0,0,0,.27)';X.fillRect(0,0,PW,PH);X.globalCompositeOperation='lighter';glow(P.x,P.y,205,'#62e3ff',.21);glow(P.x+Math.cos(P.a)*55,P.y+Math.sin(P.a)*55,95,'#d8fbff',.08);if(G.cur.type=='shop'||['shrine','rescue','forge'].includes(G.cur.type)){glow(PW/2,PH/2,260,G.cur.type=='shop'?'#6aff9e':'#ffd166',.16)}for(let b of G.bs)glow(b.x,b.y,38,b.col,.2);for(let b of G.eb)glow(b.x,b.y,32,b.col,.16);for(let e of G.en){if(e.elite||e.type=='boss')glow(e.x,e.y,e.r*3.2,e.col,.13);else if(e.fl)glow(e.x,e.y,e.r*2.2,e.col,.09)}X.restore()}
function drawFog(){X.save();X.globalCompositeOperation='screen';for(let i=0;i<7;i++){let x=(G.t*15+i*170+G.rx*70)%PW,y=(i*120+G.ry*50)%PH;let g=X.createRadialGradient(x,y,20,x,y,260);g.addColorStop(0,'rgba(130,170,210,.035)');g.addColorStop(1,'rgba(130,170,210,0)');X.fillStyle=g;X.beginPath();X.arc(x,y,260,0,7);X.fill()}X.restore()}
function drawVignette(){let g=X.createRadialGradient(W/2,H/2,Math.min(W,H)*.24,W/2,H/2,Math.max(W,H)*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.48)');X.fillStyle=g;X.fillRect(0,0,W,H)}

function mini(){MX.clearRect(0,0,220,150);let ox=110,oy=75,s=8;for(let r of G.rooms.values()){if(!P.seen.has(rk(r.x,r.y)))continue;let x=ox+r.x*s,y=oy+r.y*s;MX.fillStyle=r.x==G.rx&&r.y==G.ry?'#fff':r.boss?'#ff4d6d':r.miniboss?'#ff9f1c':r.key?'#ffd166':r.type=='shop'?'#6aff9e':['shrine','rescue','forge'].includes(r.type)?'#ffd166':r.clr?'#62e3ff99':'#62e3ff33';MX.fillRect(x-4,y-4,8,8)}}

function ui(){ensureWeaponIndex();let p=(id,v)=>$(id).style.width=cl(v,0,100)+'%';$('hpT').textContent=`${P.h|0}/${P.mh}`;p('hp',100*P.h/P.mh);$('shT').textContent=`${P.s|0}/${P.ms}`;p('sh',100*P.s/P.ms);$('enT').textContent=`${P.e|0}/${P.me}`;p('en',100*P.e/P.me);$('rank').textContent=P.rank;$('xpT').textContent=`XP ${P.xp|0}/${P.nx}`;p('xp',100*P.xp/P.nx);$('rift').textContent=`${P.charName} · ${difficultyAt(selectedDifficulty).badge} · Dungeon Lv ${dungeonLevel()}`;$('seed').textContent=G.seed.toString(16).toUpperCase();$('room').textContent=`${G.rx},${G.ry} ${G.cur.type}`;$('time').textContent=(G.t/60|0)+':'+String(G.t%60|0).padStart(2,'0');$('wep').textContent=weps[P.w][0];$('stats').innerHTML=`<b>${P.charName}</b> · ${P.charRole}<br><span class="muted">${P.charPassive}</span><br>Damage x${P.dm.toFixed(2)} · Armor ${P.armor}<br>Dungeon level ${dungeonLevel()} · Final bosses ${G.bossKills||0}/${G.bossTotal||3}<br>Rooms ${G.rooms.size} · Enemy HP x${levelScale().hp.toFixed(2)}<br>${keyLabel(settings.binds.shock)} Shock ${P.sc<=0?'Ready':P.sc.toFixed(1)} · ${keyLabel(settings.binds.repair)} Repair ${P.rc<=0?'Ready':P.rc.toFixed(1)}<br>${keyLabel(settings.binds.lightning)} Chain Lightning ${P.zc<=0?'Ready':P.zc.toFixed(1)}<br>Heat ${P.heat|0}/100 · Combo x${G.combo} · Mercy ${P.mercy}<br>Kills ${G.kills} · Drones ${G.drones} · Artifacts ${G.art.length}`;$('slots').innerHTML=[['◇',P.scrap],['◆',G.keys],['✦',G.core],['BAT',P.e|0],['DRN',G.drones],['⚙️',P.rank]].map(a=>`<span class="slot">${a[0]}<b>${a[1]}</b></span>`).join('');$('quest').innerHTML=`<b>${P.charName}</b> <span class="badge">${P.charRole}</span> <span class="badge">${difficultyAt(selectedDifficulty).badge}</span><div class="muted" style="margin:6px 0 9px">${P.charSummary}</div><div class="card" style="padding:10px;margin-top:8px"><b>CURRENT OBJECTIVE</b><br>${(G.bossKills||0)>=(G.bossTotal||3)?'Escape: return to spawn and stand on the extraction gate.':`Defeat final bosses: ${G.bossKills||0}/${G.bossTotal||3} destroyed.`}</div><div class="muted" style="margin-top:8px">Enemy clues: laser = sniper, orange ring = bomber, green beam = healer, blue aura = shield.</div><div class="muted" style="margin-top:6px">Unlocks: ${(meta.unlocks||[]).join(', ')||'none yet'}</div>`}
function toast(s){let t=$('toast');t.textContent=s;t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),1700)}
let AC=null,muted=false;
function audio(){if(!AC)AC=new (window.AudioContext||window.webkitAudioContext)();return AC}
function sfx(kind){
  if(muted)return;
  try{
    let a=audio(),o=a.createOscillator(),g=a.createGain(),now=a.currentTime;
    let map={shoot:[210,.035,.025,'sawtooth'],hit:[360,.045,.035,'square'],hurt:[90,.12,.06,'sawtooth'],buy:[520,.08,.035,'triangle'],puzzle:[720,.14,.04,'sine'],fail:[140,.12,.04,'square'],forge:[280,.18,.055,'sawtooth'],death:[110,.16,.045,'triangle'],boss:[65,.35,.05,'sawtooth'],shield:[440,.09,.03,'sine'],low:[120,.22,.04,'square']};
    let m=map[kind]||map.hit;
    o.type=m[3];o.frequency.setValueAtTime(m[0],now);o.frequency.exponentialRampToValueAtTime(Math.max(40,m[0]*.55),now+m[1]);
    g.gain.setValueAtTime(m[2],now);g.gain.exponentialRampToValueAtTime(.0001,now+m[1]);
    o.connect(g);g.connect(a.destination);o.start(now);o.stop(now+m[1]);
  }catch(e){console.warn('SFX playback error:',e)}
}

let music=null;
function startMusic(){
  try{
    if(muted)return;
    let a=audio();
    if(music)return;
    let o=a.createOscillator(),g=a.createGain(),lfo=a.createOscillator(),lg=a.createGain();
    o.type='triangle';o.frequency.value=72;
    lfo.type='sine';lfo.frequency.value=.08;lg.gain.value=11;lfo.connect(lg);lg.connect(o.frequency);
    g.gain.value=.018;o.connect(g);g.connect(a.destination);o.start();lfo.start();
    music={o,g,lfo,lg};
  }catch(e){console.warn('Failed to start music:',e)}
}
function stopMusic(){try{if(music){music.o.stop();music.lfo.stop();music=null}}catch(e){console.warn('Error stopping music:',e);music=null}}
function toggleAudio(){muted=!muted;if(muted){stopMusic();$('audioToggle').textContent='Audio: Off'}else{$('audioToggle').textContent='Audio: On';startMusic();sfx('buy')}}
function save(){
  if(!P||!G.run){toast('Nothing to save');return false}
  if(G.cur)G.cur.loot=[...G.lt];
  try{
    localStorage.NEON_RELIC_FIXED=JSON.stringify({version:5,seed:G.seed,t:G.t,rx:G.rx,ry:G.ry,difficulty:selectedDifficulty,P:{...P,seen:[...P.seen]},weps:weps.map(w=>w.slice()),keys:G.keys,core:G.core,bossKills:G.bossKills||0,bossTotal:G.bossTotal||BOSS_ROOM_COUNT,miniBossTotal:G.miniBossTotal||MINI_BOSS_ROOM_COUNT,dungeonLevel:dungeonLevel(),kills:G.kills,drones:G.drones,rooms:[...G.rooms],en:G.en,lt:G.lt,mines:G.mines,sentries:G.sentries,decoys:G.decoys,barriers:G.barriers,art:G.art,rift:G.rift,combo:G.combo,comboT:G.comboT});
  }catch(e){
    console.warn('Save failed:',e);
    toast('Save failed – storage may be full');
    return false
  }
  toast('Saved');
  return true
}
function load(){
  let raw=localStorage.NEON_RELIC_FIXED;if(!raw)return toast('No save found');
  let d;
  try{d=JSON.parse(raw)}catch(e){
    console.warn('Corrupted save data:',e);
    toast('Save data corrupted – cannot load');
    return
  }
  if(!d.version||d.version<5)return toast('Old save incompatible. Start a new run.');
  setDifficulty(d.difficulty||selectedDifficulty);
  world(d.seed);
  G.t=d.t||0;G.keys=d.keys||0;G.core=d.core||0;G.bossKills=d.bossKills||0;G.bossTotal=d.bossTotal||BOSS_ROOM_COUNT;G.miniBossTotal=d.miniBossTotal||MINI_BOSS_ROOM_COUNT;G.dungeonLevel=d.dungeonLevel||1;G.kills=d.kills||0;G.drones=d.drones||0;G.rift=d.rift||1;G.combo=d.combo||0;G.comboT=d.comboT||0;G.art=d.art||[];
  G.rooms=new Map(d.rooms||[]);
  if(d.weps&&d.weps.length)weps.splice(0,weps.length,...d.weps.map(w=>w.slice()));else resetWeapons();
  P={...d.P,seen:new Set((d.P&&d.P.seen)||['0,0'])};P.w=Math.max(0,Math.min((P.w|0),weps.length-1));
  selectedCharacter=Number.isInteger(P.charId)?P.charId:selectedCharacter;stampCharacterFields(P,selectedCharacter);setCharacter(selectedCharacter);
  $('menu').style.display='none';$('level').style.display='none';$('codex').style.display='none';$('exitRun').style.display='block';$('pauseRun').style.display='block';
  enter(d.rx||0,d.ry||0,1);
  G.en=d.en||G.en;G.lt=d.lt||G.lt;G.mines=d.mines||[];G.sentries=d.sentries||[];G.decoys=d.decoys||[];G.barriers=d.barriers||[];
  G.run=1;G.pause=0;G.over=0;ms.d=0;K.clear();renderSettings();ui();toast('Loaded')
}
function exitRun(){if(!P||!G.run)return;save();G.run=0;G.pause=0;$('level').style.display='none';$('codex').style.display='none';$('exitRun').style.display='none';$('pauseRun').style.display='none';$('menu').style.display='flex';renderCharacterSelect();renderDifficultySelect();$('start').onclick=start;$('load').onclick=load;if($('audioToggle'))$('audioToggle').onclick=toggleAudio;toast('Progress saved')}
function end(w){G.over=1;stopMusic();if(w){meta.wins++;if(selectedDifficulty=='hard')meta.hardWins++;if(selectedDifficulty=='epstein')meta.epsteinWins++;if(selectedDifficulty=='hard')unlockReward('Hard Mode Survivor');if(selectedDifficulty=='epstein')unlockReward('EPSTEIN Conqueror');saveMeta()}let elapsed=Math.max(1,(performance.now()-(runStats.startTime||performance.now()))/1000),title=w?'THE COOPERS ESCAPED':'DUNGEON OVERWHELMED';$('endTitle').textContent=title;$('endSummary').innerHTML=`<b>${P.charName}</b> · ${P.charRole} · <span class="badge">${difficultyAt(selectedDifficulty).badge}</span>`;$('endStats').innerHTML=[['Time',`${(elapsed/60|0)}:${String(elapsed%60|0).padStart(2,'0')}`],['Kills',G.kills],['Rooms visited',runStats.rooms],['Rank reached',P.rank],['Damage dealt',Math.round(runStats.damage)],['Favourite weapon',runStats.bestWeapon],['Difficulty wins',`Easy/Medium total ${meta.wins} · Hard ${meta.hardWins||0} · EPSTEIN ${meta.epsteinWins||0}`],['Unlocks',(meta.unlocks||[]).join(', ')||'None yet']].map(([a,b])=>`<div class="card"><div class="t">${a}</div><div class="statbig">${b}</div></div>`).join('');$('endPanel').style.display='flex'}
function codex(){let c=$('codex');c.style.display=c.style.display=='block'?'none':'block';$('codexgrid').innerHTML=['Choose from portrait-based pilots, difficulty, keybinds, and sensitivity on the title screen or pause menu. Each has a different starting specialty and passive bonus.','WASD movement is fixed in this stable build.','Shrine, rescue, and forge rooms activate with E near the centre.','Snipers keep distance, bombers explode, healers restore allies, shield units protect groups, swarms chase fast.','Only three active abilities remain: Q shockwave, C repair, and Z chain lightning. Level-up upgrades now focus on those abilities, weapons, shields, movement, energy, and loot.','The dungeon has 37 rooms, 5 mini-boss rooms, and 3 boss rooms. Defeat all 3 bosses, then return to spawn to win. Dungeon levels rise as rooms are cleared, making enemies harder. Enemy clues: laser means sniper, orange ring means bomber, green beam means healer, blue aura means shield.'].map((x,i)=>`<div class="card"><h3>Entry ${i+1}</h3><p>${x}</p></div>`).join('')}
function start(){setCharacter(selectedCharacter);setDifficulty(selectedDifficulty);world();ensureWeaponIndex();startMusic();$('menu').style.display='none';$('exitRun').style.display='block';$('pauseRun').style.display='block';ui();toast('Objective shown on right · '+P.charName+' deployed')}
function loop(t){let dt=Math.min(.033,(t-loop.t||16)/1000);loop.t=t;updatePuzzleTimer();tick(dt);draw();requestAnimationFrame(loop)}
$('start').onclick=start;$('load').onclick=load;$('exitRun').onclick=exitRun;$('close').onclick=()=>$('codex').style.display='none';$('closeShop').onclick=closeShop;$('exitPuzzle').onclick=closePuzzle;$('submitPuzzle').onclick=submitPuzzle;$('equipForge').onclick=equipForgedGun;$('skipForge').onclick=skipForgedGun;$('puzzleAnswer').onkeydown=e=>{if(e.key=='Enter')submitPuzzle()};if($('resumeBtn'))$('resumeBtn').onclick=closePause;if($('pauseSaveExit'))$('pauseSaveExit').onclick=exitRun;if($('pauseAudio'))$('pauseAudio').onclick=toggleAudio;if($('pauseRun'))$('pauseRun').onclick=openPause;renderSettings();setCharacter(selectedCharacter);requestAnimationFrame(loop);

// Static HTML handlers moved out of index.html.
(() => {
  const resetButton = document.getElementById('resetSettings');
  if (resetButton) resetButton.addEventListener('click', resetKeybinds);
  const newRunButton = document.getElementById('newRun');
  if (newRunButton) newRunButton.addEventListener('click', () => location.reload());
})();
