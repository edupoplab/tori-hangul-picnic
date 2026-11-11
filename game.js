'use strict';
const $=id=>document.getElementById(id),stage=$('stage'),ctrl=$('controls'),hint=$('hint');
const groups=['ㅁㄴㄱㅏㅗㅜ','ㅅㅇㄹㅓㅣㅡ','ㅂㅈㄷㅎㅑㅕ','ㅋㅌㅍㅊㅛㅠ'],names=['통나무 보물길','까꿍 나무 정원','반딧불 미로','기억 징검연못'];
const C='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',V='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ',T=' ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
const marks=['🍓','🐳','🌰','🍎','☁️','🌙','🍄','🌻'],colors=['#f6caca','#c4e5d3','#bedcf3','#f7dea5','#ddd0f0'];
const orders=[['곰','🐻','소풍 가는데 햇볕이 눈부셔. 머리에 쓰면 그늘이 생기는 건 뭘까?','모자','👒','그늘이 생겼어! 이제 소풍 갈 수 있어.'],['여우','🦊','흙놀이로 손이 더러워졌어. 물에 문지르면 거품이 나는 건 뭘까?','비누','🧼','보글보글! 손이 깨끗해졌어.']];
orders.push(...[["곰","🐻","비가 오는데 머리 위에 무엇을 펼칠까?","우산","☂️","우산을 펼치니 비를 피할 수 있어!"],["여우","🦊","캄캄한 방에서 불을 켜려 해. 손에 들고 비추는 것은?","손전등","🔦","길이 밝아졌어!"],["곰","🐻","바람에 종이가 날아가. 종이를 함께 묶어 둘 작은 철사는?","클립","📎","종이를 모아 집었어!"],["여우","🦊","멀리 있는 새를 크게 보려면 눈에 무엇을 댈까?","망원경","🔭","새의 깃털까지 보여!"],["곰","🐻","소풍에서 밥과 반찬을 따로 담아 들고 갈 것은?","도시락","🍱","점심을 담았어!"],["여우","🦊","빗방울이 그치고 해가 났어. 하늘에 생긴 일곱 빛깔 다리를 그려 줘.","무지개","🌈","그림에 일곱 빛깔을 담았어!"],["곰","🐻","달력에서 오늘 날짜를 찾아 동그라미를 그리고 싶어. 지울 수 있는 필기도구는?","연필","✏️","오늘 날짜를 표시했어!"],["여우","🦊","내 생일을 친구에게 알리고 싶어. 언제 어디로 올지 적어 보내는 종이는?","초대장","💌","친구들에게 초대장을 나눠 줬어!"]]);
const KEY='jamosup-classroom-v2';let roster=[],storageError=false;
try{roster=JSON.parse(localStorage.getItem(KEY)||'[]');if(!Array.isArray(roster))throw Error()}catch{storageError=true;roster=[]}
let me,page=0,screen='',level=0,raf=0,held=new Set(),arrow=null;
function save(){try{if(storageError)throw Error();localStorage.setItem(KEY,JSON.stringify(roster))}catch{storageError=true;hint.textContent='저장할 수 없어요. 선생님에게 알려 주세요.'}}
function el(tag,parent,cls,txt){let x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;parent.append(x);return x}
function btn(t,fn,parent=ctrl,cls){let b=el('button',parent,cls,t);b.onclick=fn;return b}
function reset(k){cancelAnimationFrame(raf);held.clear();arrow=null;screen=k;stage.dataset.scene=k;stage.className='center';stage.replaceChildren();ctrl.replaceChildren();hint.textContent=storageError?'이 기기는 저장할 수 없어요.':'';$('bag').hidden=!me;$('home').textContent='🎒 주머니장'}
function panel(title){let p=el('div',stage,'sheet');el('h2',p,'',title);return p}
function say(t){hint.textContent=storageError?'저장할 수 없어요 · '+t:t}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function shelf(){me=null;reset('seats');let p=panel('우리 반 주머니장'),list=el('div',p,'locker');page=Math.min(page,Math.floor(roster.length/6));roster.slice(page*6,page*6+6).forEach((m,i)=>{let b=btn(m.mark+' '+(m.name||'주머니 '+(page*6+i+1)),()=>preview(m),list);b.style.background=m.color});if(roster.length<(page+1)*6)btn('＋ 새 주머니',create,list);if(page)btn('◀ 앞 칸',()=>{page--;shelf()});if((page+1)*6<=roster.length)btn('다음 칸 ▶',()=>{page++;shelf()});say((page+1)+'번째 주머니장 · 같은 기기에서 이어 놀아요')}
function create(){reset('seats');let p=panel('내 주머니 꾸미기'),input=el('input',p);input.placeholder='별명 (선택)';input.maxLength=10;input.setAttribute('aria-label','별명');let mark=marks[roster.length%8],color=colors[Math.floor(roster.length/8)%5],sample=el('p',p,'sample',mark),icons=el('div',p,'row'),swatches=el('div',p,'row');marks.forEach(v=>btn(v,()=>{mark=v;sample.textContent=v},icons));colors.forEach((v,i)=>{let b=btn('●',()=>{color=v;sample.style.background=v},swatches);b.style.background=v;b.setAttribute('aria-label',['분홍','초록','파랑','노랑','보라'][i])});sample.style.background=color;btn('이 주머니로 시작',()=>{let name=input.value.trim();if(roster.some(m=>m.mark===mark&&m.color===color)){say('같은 그림과 색이 있어요. 다른 조합을 골라요.');return}me={name,mark,color,seen:'',stock:{},works:[],mail:0,visits:{},draft:[],line:'',mode:'free',forestClear:false};roster.push(me);page=Math.floor((roster.length-1)/6);save();map()},p);btn('돌아가기',shelf)}
function preview(m){me=m;reset('seats');let p=panel(m.mark+' '+(m.name||'내 주머니'));p.style.background=m.color;el('p',p,'','발견한 보물 '+m.seen.length+'종 · '+(m.works.at(-1)||'첫 모험'));btn('이어서 놀기',map,p);btn('다른 주머니',shelf)}
let roundCards=new Set(),roundFinished=false;
const done=i=>i===0 && me.forestClear!==undefined?me.forestClear:[...groups[i]].every(c=>me.seen.includes(c));
function map(){reset('map');let p=panel('성 앞뜰');names.forEach((n,i)=>{let b=btn((done(i)?'🌼 ':i===0||done(i-1)?'🐾 ':'🔒 ')+n,()=>enter(i),p);b.disabled=i>0&&!done(i-1)});btn('🏰 낱말 마을',village,p).disabled=me.seen.length!==24;say('발견 '+me.seen.length+' / 24 · 다녀온 길에서 재료를 더 모을 수 있어요')}
function showStageSuccess() {
  const dialog = $('stageSuccess');
  if(roundFinished)return;roundFinished=true;me.rounds??=[0,0,0,0];me.rounds[level]++;if(level===0)me.forestClear=true;save();
  const letters = [...groups[level]].filter(c=>roundCards.has(c));
  $('successTitle').textContent = names[level] + ' 성공!';
  $('successConsonants').textContent = letters.filter(c => C.includes(c)).join('　');
  $('successVowels').textContent = letters.filter(c => V.includes(c)).join('　');
  $('successNext').textContent = level === names.length - 1
    ? '24종을 모두 찾았어요! 낱말 마을이 열렸어요.'
    : names[level + 1] + ' 길이 열렸어요.';
  held.clear();
  dialog.showModal();
}
$('successMap').onclick = () => { $('stageSuccess').close(); map() };
$('successStay').onclick = () => { $('stageSuccess').close();if(level===3)me.pond=null;enter(level) };
function collect(c) {
  const fresh = !me.seen.includes(c);
  if (fresh) me.seen += c;
  me.stock[c] = (me.stock[c] || 0) + 1;
  save();
  hud();
  say(c + ' × ' + me.stock[c] + ' · 주머니에 담았어요');
  roundCards.add(c);if(level!==0 && roundCards.size===6)showStageSuccess();
}
function hud(){stage.querySelector('.badge')?.remove();let h=el('div',stage,'badge','🎒 ');for(const c of groups[level])el('span',h,me.seen.includes(c)?'lit':'unlit',c)}
function enter(i){roundCards=new Set();roundFinished=false;level=i;reset(['forest','garden','maze','pond'][i]);hud();btn('🏰 성 앞뜰',map);const tips=['방향키로 걷고 스페이스로 폴짝! 카드를 눌러도 찾아가요.','잎 사이로 삐죽 나온 글자를 한 번 톡 눌러요.','갈림길을 따라가요. 막히면 돌아서 다른 길을 찾아요.','이웃 돌을 톡! 흔들린 돌을 기억하고 옆길로 가요.'];say(tips[i]);btn('❔ 놀이 방법',()=>say(tips[i]));[forest,garden,maze,pond][i]()}
function xy(node,x,y){node.style.left=x+'%';node.style.top=y+'%'}
function rabbit(parent){let r=el('img',parent,'bunny');r.src='assets/rabbit-idle.png';r.alt='토끼';return r}
function forest(){let world=el('div',stage,'world'),r=rabbit(world),x=3,height=0,v=0,target=null,facing=1;const floor=x=>x>=62&&x<=75?18:x>=50&&x<62?9:x>=20&&x<=23?5:0;
[[50,12,9],[62,13,18]].forEach(([x,w,h])=>{let e=el('div',world,'step');e.style.cssText='left:'+x+'%;width:'+w+'%;height:'+h+'%'});let items=[],bag=shuffle(groups[0]);const count=me.rounds?.[0]?21:17;for(let i=0;i<count;i++){let a=6+i*89.6/(count-1),c=bag[i%6],lift=floor(a)+(i%3===0?11:0),b=btn(c,()=>target=a,world,'pickup');xy(b,a,83-lift);items.push({a,c,b,lift})}const finish=btn("🏁 도착",()=>target=97,world,"pickup");xy(finish,97,83);let time=performance.now();function jump(){if(height<=floor(x)+.1)v=68}
for(const [lab,key] of [['◀','ArrowLeft'],['▶','ArrowRight']]){let b=btn(lab,()=>{});b.onpointerdown=e=>{target=null;held.add(key);b.setPointerCapture(e.pointerId)};b.onlostpointercapture=()=>held.delete(key)}btn('🐇 점프',jump);let camera=0;function tick(now){if(screen!=='forest')return;let dt=Math.min(.04,(now-time)/1000);time=now;if(!$('pouch').open && !$('stageSuccess').open){let dir=Number(held.has('ArrowRight'))-Number(held.has('ArrowLeft'));if(dir)target=null;if(target!==null)dir=Math.abs(target-x)<.4?0:Math.sign(target-x);if(held.has('Space'))jump();let nx=Math.min(98,Math.max(1,x+dir*12*dt));if(floor(nx)>height+1){if(target!==null)jump()}else x=nx;height=Math.max(floor(x),height+v*dt);v=height>floor(x)?v-155*dt:0;if(dir)facing=dir;r.style.setProperty('--flip',facing);xy(r,x,83-height);let offset=world.offsetWidth-stage.clientWidth;camera=Math.max(0,Math.min(offset,world.offsetWidth*x/100-stage.clientWidth*.36));world.style.translate=-camera+'px 0';for(const t of items){if(t.b.hidden)continue;if(Math.abs(t.a-x)<1.7&&Math.abs(t.lift-height)<8){t.b.hidden=true;collect(t.c);if(target===t.a)target=null}else if(target===t.a&&Math.abs(t.a-x)<1.7)jump()}if(x>=96&&!roundFinished){if([...groups[0]].every(c=>me.seen.includes(c)))showStageSuccess();else say("도착! 놓친 보물을 찾아 다시 와요.")}}raf=requestAnimationFrame(tick)}raf=requestAnimationFrame(tick);if(!me.visits.forest){me.visits.forest=true;save()}}
function garden(){let r=rabbit(stage);xy(r,8,88);const demo=!me.visits.garden;me.visits.garden=true;save();const spots=[[8,74],[22,56],[46,44],[70,57],[81,13],[84,67]];const places=me.rounds?.[1]?shuffle([[15,55],[32,72],[64,51],[75,38],[90,66],[43,42]]):spots;shuffle(groups[1]).forEach((c,i)=>{let [x,y]=places[i],b=btn(c,()=>{b.disabled=true;xy(r,x,y+5);b.classList.add('found');collect(c)},stage,'peek');if(demo&&i===0)b.classList.add('demo');b.dataset.glyph=c;b.style.setProperty('--tilt',(i%2?8:-7)+'deg');xy(b,x,y);b.setAttribute('aria-label','숨은 보물 찾기 '+(i+1))});stage.onclick=e=>{if(screen==='garden'&&e.target===stage){let z=stage.getBoundingClientRect();xy(r,(e.clientX-z.left)/z.width*100,(e.clientY-z.top)/z.height*100)}}}
function maze(){let W=13,H=9,g=Array.from({length:H},()=>Array(W).fill(0)),stack=[[1,1]];g[1][1]=1;while(stack.length){let [x,y]=stack.at(-1),opt=shuffle([[2,0],[-2,0],[0,2],[0,-2]]).find(([a,b])=>x+a>0&&x+a<W-1&&y+b>0&&y+b<H-1&&!g[y+b][x+a]);if(!opt){stack.pop();continue}let [a,b]=opt;g[y+b/2][x+a/2]=g[y+b][x+a]=1;stack.push([x+a,y+b])}let board=el('div',stage,'mazeBoard'),cells=[],paths=[],x=1,y=1,facing=1;g.forEach((row,j)=>row.forEach((v,i)=>{let cell=el(v?'button':'span',board,v?'path':'hedge');cells[j*W+i]=cell;if(v){cell.onclick=()=>move(i-x,j-y);cell.setAttribute('aria-label','오솔길');if(i!==1||j!==1)paths.push(cell)}}));const picks=shuffle(paths);let keyCell=null,locked=null,hasKey=false;
if(me.rounds?.[2]){
  const start=W+1,adj=n=>[-W,W,-1,1].map(d=>n+d).filter(i=>cells[i]?.className==='path');
  function distances(from,blocked){const dist=new Map([[from,0]]),queue=[from];for(let i=0;i<queue.length;i++)for(const n of adj(queue[i]))if(n!==blocked&&!dist.has(n)){dist.set(n,dist.get(queue[i])+1);queue.push(n)}return dist}
  const walk=distances(start,-1);
  const ends=[...walk.keys()].filter(n=>n!==start&&adj(n).length===1).sort((a,b)=>walk.get(a)-walk.get(b));
  const door=ends[0],approach=adj(door)[0],detour=distances(approach,door);
  const gap=(a,b)=>Math.abs(a%W-b%W)+Math.abs(Math.floor(a/W)-Math.floor(b/W));
  const candidates=[...detour.keys()].filter(n=>n!==start&&n!==approach);
  // Keep the key visibly apart as well as a real walk from both landmarks.
  const score=n=>4*Math.min(gap(n,start),gap(n,door))+Math.min(12,walk.get(n),detour.get(n));
  candidates.sort((a,b)=>score(b)-score(a));
  locked=cells[door];keyCell=cells[candidates[0]];keyCell.classList.add('keyCell');locked.classList.add('lockedCell');
  locked.textContent=groups[2][5];picks.filter(c=>c!==locked&&c!==keyCell).slice(0,5).forEach((c,i)=>c.textContent=groups[2][i]);
  say('먼 길에 놓인 황금 열쇠를 찾아 글자 자물쇠를 열어요.')
}else picks.slice(0,6).forEach((cell,i)=>cell.textContent=groups[2][i]);let r=rabbit(cells[W+1]);function move(a,b){if(Math.abs(a)+Math.abs(b)!==1||!g[y+b]?.[x+a])return;const next=cells[(y+b)*W+x+a];if(next===locked&&!hasKey){say("문이 잠겼어! 다른 길 끝에서 황금 열쇠를 찾아 와요.");return}if(next===keyCell&&!hasKey){hasKey=true;keyCell.classList.remove("keyCell");locked.classList.remove("lockedCell");say("열쇠를 찾았어요!")}x+=a;y+=b;if(a)facing=a;let cell=cells[y*W+x];if(cell.textContent){collect(cell.textContent);cell.textContent=''}cell.append(r);r.style.setProperty('--flip',facing)}arrow=move;for(const [k,a,b] of [['←',-1,0],['↑',0,-1],['↓',0,1],['→',1,0]])btn(k,()=>move(a,b))}
function pond(){let board=el('div',stage,'waterBoard'),cells=[],row=0,col=1;const length=9,bad=new Set(),rewards=new Map();for(let j=1;j<length;j+=2)bad.add(j*3+Math.floor(Math.random()*3));const available=shuffle(Array.from({length:24},(_,i)=>i+3).filter(i=>!bad.has(i)));shuffle(groups[3]).forEach((c,i)=>rewards.set(available[i],c));let run=me.pond;if(!run||!run.rewards.length){run=me.pond={bad:[...bad],rewards:[...rewards],row,col};save()}else{bad.clear();run.bad.forEach(n=>bad.add(n));rewards.clear();run.rewards.forEach(([n,c])=>rewards.set(n,c));row=run.row;col=run.col;for(const c of groups[3])if(![...rewards.values()].includes(c))roundCards.add(c)}btn('새 돌길',()=>{me.pond=null;enter(3)});const r=el('img',board,'topRabbit');r.src='assets/top.webp';r.alt='위에서 본 토끼';for(let j=0;j<length;j++)for(let i=0;i<3;i++){let n=j*3+i,b=btn(rewards.get(n)||'·',()=>move(i-col,j-row),board,'rock');b.style.gridRow=length-j;b.style.gridColumn=i+1;cells[n]=b}function mark(){cells.forEach((b,n)=>b.classList.toggle('near',Math.abs(Math.floor(n/3)-row)+Math.abs(n%3-col)===1));cells[row*3+col].append(r)}function move(a,b){if(Math.abs(a)+Math.abs(b)!==1)return;let i=col+a,j=row+b,n=j*3+i;if(i<0||i>2||j<0||j>=length)return;if(bad.has(n)){cells[n].classList.add('sunk');say('돌이 흔들려요! 다른 길로 가요.');let notice=stage.querySelector('.stoneNotice')||el('div',stage,'stoneNotice');notice.textContent='돌이 흔들려요! 다른 길로 가요.';return}stage.querySelector(".stoneNotice")?.remove();row=j;col=i;run.row=j;run.col=i;r.style.rotate=(a>0?90:a<0?-90:b<0?180:0)+'deg';if(rewards.has(n)){collect(rewards.get(n));rewards.delete(n);cells[n].textContent=''}run.rewards=[...rewards];save();mark()}arrow=(a,b)=>move(a,-b);mark()}

