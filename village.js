function village(){if(me.seen.length!==24)return;reset('village');let p=panel('한글 수집가의 가게');btn('내 간판 만들기',()=>bench('free'),p);btn('✉ 도착한 편지',letter,p);btn('내 마음대로 편지 쓰기',writeLetter,p);if(me.works.length)el('p',p,'','내 작품　'+me.works.slice(-4).join(' · '));backMap()}
function backMap(){btn('🏰 성 앞뜰',map)}
function letter(){reset('post');let o=orders[me.mail%orders.length],p=panel(o[1]+' '+o[0]+'의 편지');el('p',p,'','편지 '+(me.mail%orders.length+1)+' / 10');el('p',p,'',o[2]);btn('수수께끼 풀기',()=>bench('order'),p);backMap()}
function compose(raw){let a=[...raw],out='';for(let i=0;i<a.length;){const c=C.indexOf(a[i]),v=V.indexOf(a[i+1]);if(c<0||!a[i+1]||v<0){out+=a[i++];continue}i+=2;let t=0;if(a[i]&&T.indexOf(a[i])>0&&(!a[i+1]||V.indexOf(a[i+1])<0)){t=T.indexOf(a[i++])}out+=String.fromCharCode(44032+(c*21+v)*28+t)}return out}
function board(parent,interact){for(const [label,set] of [['자음','ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'],['모음','ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ']]){const row=el('div',parent,'tiles');el('strong',row,'',label);for(const c of set){let count=me.stock[c]||0,available=count-(interact?me.draft.filter(x=>x===c).length:0),b=btn(c+' ×'+(interact?available:count),()=>interact?.(c,b),row,me.seen.includes(c)?'owned':'empty');b.disabled=!interact||available<=0;if(interact&&available>0){b.draggable=true;b.ondragstart=e=>{interact(c,b);e.dataTransfer.setData("text/plain",c)}}}}}
const vowelPairs={'ㅗㅏ':'ㅘ','ㅗㅣ':'ㅚ','ㅜㅓ':'ㅝ','ㅜㅣ':'ㅟ','ㅡㅣ':'ㅢ','ㅏㅣ':'ㅐ','ㅓㅣ':'ㅔ','ㅑㅣ':'ㅒ','ㅕㅣ':'ㅖ','ㅗㅏㅣ':'ㅙ','ㅜㅓㅣ':'ㅞ'};
function blockVowel(b){const raw=b.below+b.right;return vowelPairs[raw]||raw}
const slotLabels=[['first','자음'],['right','모음1'],['below','모음2'],['last','받침 자음']];
const emptyBlock=()=>({first:'',right:'',below:'',last:''});
function loadBlocks(mode){
  me.layouts??={};
  if(me.layouts[mode])return me.layouts[mode];
  const old=mode===me.mode?me.draft:me.scratch?.[mode];
  const blocks=[];
  for(const glyph of compose((old||[]).join(''))){
    const block=emptyBlock(),n=glyph.charCodeAt(0)-44032;
    if(n>=0&&n<11172){block.first=C[Math.floor(n/588)];const v=V[Math.floor(n/28)%21];block['ㅗㅛㅜㅠㅡ'.includes(v)?'below':'right']=v;if(n%28)block.last=T[n%28]}
    else if(C.includes(glyph))block.first=glyph;else block['ㅗㅛㅜㅠㅡ'.includes(glyph)?'below':'right']=glyph;
    blocks.push(block)
  }
  return me.layouts[mode]=blocks.length?blocks:[emptyBlock()];
}
function bench(mode){
  const blocks=loadBlocks(mode);me.mode=mode;
  const tiles=blocks.flatMap(block=>Object.values(block).join("").split(""));me.draft=tiles;
  reset('work');const o=orders[me.mail%orders.length];
  const p=panel(mode==='order'?o[1]+'의 수수께끼':'내 간판 만들기');
  const active=blocks.filter(b=>Object.values(b).some(Boolean));
  const text=active.map(b=>compose(b.first+blockVowel(b)+b.last)).join('');
  el('p',p,'word',text||'나의 글자');let selected=null,highlight=null;
  const track=el('div',p,'blockTrack');
  function select(c,source,node){if(highlight)highlight.style.outline='';selected={c,source};highlight=node;if(node)node.style.outline='3px solid #3e7852';say(c+' 카드를 놓을 자리를 눌러요.')}
  function place(i,k){
    if(!selected)return;
    const {c,source}=selected,b=blocks[i];
    const fits=k==='first'?C.includes(c):k==='last'?T.includes(c):k==='below'?'ㅗㅛㅜㅠㅡ'.includes(c):'ㅏㅑㅓㅕㅣ'.includes(c);
    if(!fits){say('이 카드는 다른 자리에 놓아 보세요.');return}
    let value=c;if(k==='right'&&!source&&c==='ㅣ'&&vowelPairs[b.right+c])value=b.right+c;const below=k==='below'?value:b.below,right=k==='right'?value:b.right;if((k==='below'||k==='right')&&below&&right&&!vowelPairs[below+right]){say('함께 쓰기 어려운 모음이에요. 먼저 카드를 거두어요.');return}if(source)blocks[source.i][source.k]='';
    
    b[k]=value;save();bench(mode)
  }
  blocks.forEach((b,i)=>{const frame=el('div',track,'blockFrame');for(const [k,label] of slotLabels){
    const c=b[k],cell=btn(c||label,()=>{if(selected)place(i,k);else if(c)select(c,{i,k},cell);else say('먼저 주머니에서 카드를 골라요.')},frame,'slot '+k);
    cell.dataset.slot=i+'-'+k;cell.setAttribute('aria-label',(i+1)+'번째 글자 '+label+' '+c);
    cell.draggable=!!c;cell.ondragstart=e=>{select(c,{i,k},cell);e.dataTransfer.setData('text/plain',c)};
    cell.ondragover=e=>e.preventDefault();cell.ondrop=e=>{e.preventDefault();place(i,k)}
  }});
  btn('＋ 글자 자리',()=>{if(blocks.length>=24)return;blocks.push(emptyBlock());save();bench(mode)},p);
  btn('카드 거두기',()=>{if(selected?.source){const {i,k}=selected.source;blocks[i][k]='';save();bench(mode)}else say('거두고 싶은 글자판의 카드를 먼저 골라요.')},p);
  if(mode==='order')btn('그림 힌트',()=>say(o[4]+' '+o[3]+' · '+[...o[3]].map(ch=>{let n=ch.charCodeAt(0)-44032;let mid=V[Math.floor(n/28)%21];return C[Math.floor(n/588)]+' '+(Object.keys(vowelPairs).find(k=>vowelPairs[k]===mid)||mid)+' '+T[n%28]}).join(' / ')),p);
  if(mode==='order')el('p',p,'',o[2]);board(p,(c,node)=>select(c,null,node));
  btn(mode==='order'?'소포 보내기':'간판 걸기',()=>{if(active.some(b=>!b.first||!(b.right||b.below))||!text||!(/^[가-힣]+$/u.test(text))){say('자음과 모음을 붙여 글자를 만들어요.');return}if(mode==='order'&&text!==o[3]){say(o[3]+'를 기다리고 있어요. 다시 놓아 볼까요?');return}const cost={};for(const c of me.draft)cost[c]=(cost[c]||0)+1;if(Object.entries(cost).some(([c,n])=>me.stock[c]<n)){say('부족한 카드를 숲에서 찾아요.');return}for(const [c,n] of Object.entries(cost))me.stock[c]-=n;me.layouts[mode]=[emptyBlock()];me.draft=[];me.works.push(text);if(mode==='order')me.mail++;save();reset('post');if(mode==='order')stage.dataset.scene=['bear','fox',...orders.slice(2).map((_,i)=>'mail'+(i+2))][orders.indexOf(o)];let q=panel(mode==='order'?o[1]+' '+o[4]:'🪧 '+text);el('p',q,'',mode==='order'?o[5]:'내 가게에 새 간판을 걸었어요.');btn('가게로',village,q);backMap()},p);backMap();btn('글자 놓는 법',showBenchTutorial);if(!me.visits.benchGuide){me.visits.benchGuide=true;save();showBenchTutorial()}say('완성할 때만 재료를 써요. 부족한 재료는 숲에서 다시 모아요.')}
$('home').onclick=shelf;$('bag').onclick=()=>{let p=$('inventory');p.replaceChildren();board(p,null);$('pouch').showModal();held.clear()};$('closeBag').onclick=()=>$('pouch').close();
document.addEventListener('keydown',e=>{if($('stageSuccess').open||$('pouch').open||e.target.tagName==='INPUT')return;const dirs={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(arrow&&dirs[e.code]){e.preventDefault();arrow(...dirs[e.code])}else if(screen==='forest'&&(dirs[e.code]||e.code==='Space')){e.preventDefault();held.add(e.code)}});document.addEventListener('keyup',e=>held.delete(e.code));window.addEventListener('blur',()=>held.clear());shelf();

function drawingPad(parent, strokes, changed){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');parent.append(svg);
  svg.setAttribute('viewBox','0 0 600 220');svg.setAttribute('class','letterInk');svg.setAttribute('aria-label','손그림 그리는 자리');
  let color='#315839',current=null,pointer=null;
  function path(stroke){const line=document.createElementNS(svg.namespaceURI,'polyline');svg.append(line);
    line.setAttribute('fill','none');line.setAttribute('stroke',stroke.color);line.setAttribute('stroke-width','5');line.setAttribute('stroke-linecap','round');line.setAttribute('stroke-linejoin','round');line.setAttribute('points',stroke.points.join(' '));return line}
  strokes.forEach(path);
  function point(e){const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const loc=pt.matrixTransform(svg.getScreenCTM().inverse());return Math.round(loc.x)+','+Math.round(loc.y)}
  let line;
  svg.onpointerdown=e=>{if(pointer!==null)return;pointer=e.pointerId;svg.setPointerCapture(pointer);const p=point(e);current={color,points:[p,p]};strokes.push(current);line=path(current)};
  svg.onpointermove=e=>{if(pointer!==e.pointerId||!current)return;const p=point(e);if(p===current.points.at(-1))return;current.points.push(p);line.setAttribute('points',current.points.join(' '))};
  svg.onlostpointercapture=()=>{pointer=null;current=null;changed()};
  return {svg,setColor:c=>color=c,undo:()=>{if(strokes.pop()){svg.lastElementChild.remove();changed()}}}
}
function showBenchTutorial(){
  const dialog=$('benchGuide');dialog.replaceChildren();
  const scenes=[
    ['자음 칸에 ㄱ을 놓아요.', 'ㄱ','','','','ㄱ',0],
    ['오른쪽 모음1에 ㅏ를 놓으면 가!', 'ㄱ','ㅏ','','','가',1],
    ['이번에는 아래 모음2에 ㅗ만 놓아요.', 'ㄱ','','ㅗ','','고',2],
    ['ㅗ를 두고 오른쪽에 ㅏ를 더하면 과!', 'ㄱ','ㅏ','ㅗ','','과',1],
    ['맨 아래 받침 자음에 ㄴ을 놓으면 관!', 'ㄱ','ㅏ','ㅗ','ㄴ','관',3]
  ];
  const caption=el('h2',dialog);
  const tray=el('div',dialog,'blockTrack guideTrack');
  const board=el('div',tray,'blockFrame');
  const result=el('p',dialog,'word');
  let index=0,timer;
  function render(){
    const [message,...parts]=scenes[index];
    caption.textContent=message;
    board.replaceChildren();
    slotLabels.forEach(([position,label],i)=>{
      const cell=el('div',board,'slot '+position);
      el('small',cell,'',label);
      if(parts[i]){
        const tile=el('b',cell,'',parts[i]);
        if(i===parts[5])tile.classList.add('movingCard');
      }
    });
    result.textContent=parts[4];
  }
  function play(){
    clearInterval(timer);index=0;render();
    timer=setInterval(()=>{if(index===scenes.length-1){clearInterval(timer);return}index++;render()},2300);
  }
  btn('다시 보기',play,dialog);btn('내가 해 볼래',()=>dialog.close(),dialog);
  dialog.onclose=()=>clearInterval(timer);dialog.showModal();play();
}

function writeLetter(){
  reset('post');
  const p=panel('내 마음대로 편지 쓰기');
  const papers={garden:'꽃밭',water:'연못',night:'반딧불 숲'};
  let paper=Object.hasOwn(papers,me.note?.paper)?me.note.paper:'garden';
  const picker=el('div',p,'row');
  const sheet=el('div',p,'writingPaper'),art=el('img',sheet,'paperWash');
  function paint(){art.src='assets/'+paper+'.webp';art.alt='';Array.from(picker.children).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paper===paper)))}
  for(const [id,title] of Object.entries(papers)){const b=btn(title,()=>{paper=id;paint();remember()},picker);b.dataset.paper=id}
  paint();
  function field(tag,label,value,max){const wrap=el('label',sheet,'noteField',label);const input=el(tag,wrap);input.maxLength=max;input.value=value;input.oninput=remember;return input}
  const to=field('input','받는 친구',me.note?.to||'',30),body=field('textarea','편지글',me.note?.body||'',1500);
  const strokes=me.note?.strokes||[],tools=el('div',sheet,'inkTools'),pad=drawingPad(sheet,strokes,remember);
  for(const [name,color] of [['초록','#315839'],['분홍','#b43b68'],['파랑','#315a98'],['갈색','#815632']]){const b=btn(name,()=>pad.setColor(color),tools);b.style.color=color}
  btn('한 획 지우기',pad.undo,tools);
  const from=field('input','보내는 사람',me.note?.from??me.name??'',30);
  function remember(){me.note={to:to.value,body:body.value,from:from.value,paper,strokes};save()}
  function content(){return (to.value.trim()||'숲속 친구')+'에게\n\n'+body.value.trim()+'\n\n'+(from.value.trim()||'토리 친구')+' 드림'}
  function ready(){if(body.value.trim()||strokes.length)return true;say('편지글을 쓰거나 그림을 그려 보세요.');return false}
  btn('편지 인쇄',async()=>{if(!ready())return;const out=$('printLetter');out.replaceChildren();const page=el('div',out,'writingPaper');const bg=el('img',page,'paperWash');bg.src=art.src;bg.alt='';el('p',page,'',(to.value.trim()||'숲속 친구')+'에게');el('p',page,'letterText',body.value);page.append(pad.svg.cloneNode(true));el('p',page,'signature',(from.value.trim()||'토리 친구')+' 드림');try{await Promise.all([bg.decode(),document.fonts.load("18pt jua",content())])}catch{}window.print()},p);
  btn('우리 반 우체부에게 전하기',()=>{
    if(!ready())return;
    const area=el('div',p,'teacherMail'),address=el('input',area);address.type='email';address.placeholder='선생님 이메일';address.value=localStorage.getItem('tori-teacher-address')||'';
    btn('메일 앱에서 보내기',()=>{if(!address.value.trim()||!address.reportValidity())return;localStorage.setItem('tori-teacher-address',address.value.trim());const link='mailto:'+encodeURIComponent(address.value.trim()).replace('%40','@')+'?subject='+encodeURIComponent('토리의 글자소풍 편지')+'&body='+encodeURIComponent(content());window.location.href=link;say('메일 앱에서 받는 주소를 확인하고 보내기를 눌러 주세요.')},area);
    say('메일에는 글과 서명이 들어가요. 그림 편지는 인쇄에서 PDF로 저장해 첨부할 수 있어요.');
  },p);backMap()
}
$('goForest').onclick=()=>$('intro').close();
$('intro').showModal();
