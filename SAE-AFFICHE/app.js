 'use strict';
const $ = id => document.getElementById(id);
const scene = document.querySelector('a-scene');
let cameraState = 'idle', arSystem, cameraTimeout;
const cameraStatus = text => { $('camera-status').textContent=text; };
const musicStatus = text => { $('music-status').textContent=text; };
function cameraButton(text) { $('camera-toggle').hidden=false; $('camera-toggle').textContent=text; }
function cameraFailure(message) {
  clearTimeout(cameraTimeout); cameraState='error';
  cameraStatus(message); cameraButton('Réessayer la caméra');
  // A failed permission attempt can leave an empty video element behind.
  if (arSystem?.video) {
    arSystem.video.srcObject?.getTracks().forEach(track => track.stop());
    arSystem.video.remove();
  }
}
async function startCamera() {
  if (cameraState==='starting' || cameraState==='running') return;
  if (location.protocol==='file:') { cameraStatus('Ouvre la page depuis le serveur local ou une adresse HTTPS.'); return; }
  if (!isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    cameraStatus('La caméra nécessite une adresse HTTPS et un navigateur compatible.');
    cameraButton('Activer la caméra'); return;
  }
  if (!window.AFRAME || !scene.systems?.['mindar-face-system']) {
    cameraStatus('Le filtre n’a pas chargé. Vérifie ta connexion puis recharge la page.'); return;
  }
  arSystem=scene.systems['mindar-face-system'];
  if (cameraState==='paused') {
    try {
      if (!arSystem.video?.srcObject?.getVideoTracks().some(track=>track.readyState==='live')) {
        location.reload(); return;
      }
      await arSystem.video.play();
      arSystem.controller.processVideo(arSystem.video);
      cameraState='running'; $('camera-toggle').hidden=true; cameraStatus('Place ton visage dans le cadre.');
    } catch { cameraStatus('Touche Reprendre pour réactiver la caméra.'); }
    return;
  }
  cameraState='starting'; $('camera-toggle').hidden=true; cameraStatus('Autorise la caméra, puis attends le chargement du filtre…');
  try {
    arSystem.shouldFaceUser=true;
    arSystem.start();
    cameraTimeout=setTimeout(()=>{
      if(cameraState==='starting') cameraStatus('Le filtre charge encore. Vérifie l’autorisation caméra et ta connexion.');
    },20000);
  } catch { cameraFailure('Impossible de démarrer la caméra. Recharge la page pour réessayer.'); }
}
function pauseCamera() {
  if(cameraState!=='running') return;
  arSystem.pause(); cameraState='paused'; $('face-anchor').object3D.visible=false;
 cameraStatus('Caméra en pause'); cameraButton('Reprendre la caméra');
}
scene.addEventListener('arReady',()=>{
  clearTimeout(cameraTimeout); cameraState='running';
  if(scene.renderer) scene.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  cameraStatus('Place ton visage dans le cadre.'); $('camera-toggle').hidden=true;
  if(document.hidden) pauseCamera();
});
scene.addEventListener('arError',()=>cameraFailure('Caméra inaccessible. Autorise-la dans les réglages du navigateur.'));
scene.addEventListener('targetFound',()=>{
  if(cameraState!=='running') return;
  cameraStatus(''); 
});
scene.addEventListener('targetLost',()=>{

  if(cameraState==='running') cameraStatus('Place ton visage dans le cadre.');
});
$('head').addEventListener('model-error',()=>cameraStatus('Le masque n’a pas chargé. Recharge la page pour réessayer.'));
const titles=['HYAENA','THANK GOD','MODERN JAM','MY EYES',"GOD’S COUNTRY",'SIRENS','MELTDOWN','FE!N','DELRESTO (ECHOES)','I KNOW ?','TOPIA TWINS','CIRCUS MAXIMUS','PARASAIL','SKITZO','LOST FOREVER','LOOOVE','K-POP','TELEKINESIS','TIL FURTHER NOTICE'];
const files=["HYAENA.mp3", "THANK-GOD.mp3", "MODERN-JAM.mp3", "MY-EYES.mp3", "GODS-COUNTRY.mp3", "SIRENS.mp3", "MELTDOWN.mp3", "FE!N.mp3", "DELRESTO.mp3", "I-KNOW .mp3", "TOPIA-TWINS.mp3", "CIRCUS-MAXIMUS.mp3", " PARASAIL .mp3", "SKITZO.mp3", "LOST FOREVER.mp3", "LOOOVE.mp3", "K-POP.mp3", "TELEKINESIS .mp3", "TIL-FURTHER-NOTICE.mp3"];
const colors=['#ded89a','#c87646','#7f9f9b','#afacc7','#c5a166','#bab89b','#c37d72','#b6c47a','#9caaa3','#c8ad84','#adb9d0','#d49769','#a8bfb3','#c2a0a0','#c0b89d','#d1a672','#b1accc','#c7ce9b','#b3b0a3'];
const audio=$('audio'), records=$('records');
let selected=0, request=0, scrollTimer, motionRequested=false;
const cards=titles.map((title,i)=>{
  const button=document.createElement('button'); button.className='record-card';button.type='button';
  button.setAttribute('aria-label',`Lire ${title}`);button.setAttribute('aria-pressed','false');
  button.style.setProperty('--label',colors[i]);
  const disc=document.createElement('span');disc.className='vinyl';disc.setAttribute('aria-hidden','true');
  const label=document.createElement('span');label.className='vinyl-label';
  const name=document.createElement('span');name.textContent=title;
  label.append(name);disc.append(label);
  const caption=document.createElement('span');caption.className='record-title';caption.textContent=title;
  button.append(disc,caption);records.append(button);
  button.onclick=()=>{
    requestMotion();
    if(selected===i){audio.paused?play():audio.pause();}
    else {select(i);center(i);}
  };
  return button;
});
function center(i){records.scrollTo({left:cards[i].offsetLeft-(records.clientWidth-cards[i].offsetWidth)/2,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
function updatePlayback(){
  cards.forEach((card,i)=>{
    card.classList.toggle('selected',i===selected);
    card.classList.toggle('playing',i===selected&&!audio.paused);
    card.setAttribute('aria-pressed',String(i===selected));
    card.setAttribute('aria-label',`${i===selected&&!audio.paused?'Mettre en pause':'Lire'} ${titles[i]}`);
  });
}
async function play(){
  const token=++request;
  try {await audio.play();if(token===request) musicStatus('');}
  catch(error){
    if(token!==request||error.name==='AbortError')return;
    musicStatus(error.name==='NotAllowedError'?'Touche le vinyle pour lancer le son.':'Ce titre n’est pas encore disponible.');
  }
  updatePlayback();
}
function select(i){
  selected=Math.max(0,Math.min(titles.length-1,i));request++;audio.pause();
  audio.src=`assets/audio/${encodeURIComponent(files[selected])}`;
  $('track-count').textContent=`${String(selected+1).padStart(2,'0')} / 19`;
  musicStatus('');updatePlayback();play();
}
function settle(){
  const middle=records.scrollLeft+records.clientWidth/2;
  let closest=0,distance=Infinity;
  cards.forEach((card,i)=>{const d=Math.abs(card.offsetLeft+card.offsetWidth/2-middle);if(d<distance){distance=d;closest=i;}});
  if(closest!==selected)select(closest);
}
records.addEventListener('scroll',()=>{clearTimeout(scrollTimer);scrollTimer=setTimeout(settle,180);},{passive:true});
records.addEventListener('scrollend',()=>{clearTimeout(scrollTimer);settle();});
records.addEventListener('keydown',e=>{
  if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
  e.preventDefault();const i=Math.max(0,Math.min(18,selected+(e.key==='ArrowRight'?1:-1)));select(i);center(i);cards[i].focus({preventScroll:true});
});
audio.addEventListener('play',updatePlayback);audio.addEventListener('pause',updatePlayback);
audio.addEventListener('error',()=>{musicStatus('Ce titre n’est pas encore disponible.');updatePlayback();});
audio.addEventListener('ended',()=>{if(selected<18){select(selected+1);center(selected);}else updatePlayback();});
function requestMotion(){
  if(motionRequested)return;motionRequested=true;
  // iOS requires a user gesture for the optional orientation sensor.
  if(typeof DeviceOrientationEvent!=='undefined'&&typeof DeviceOrientationEvent.requestPermission==='function'){
    DeviceOrientationEvent.requestPermission().catch(()=>{});
  }
}
$('camera-toggle').onclick=startCamera;
$('settings-toggle').onclick=()=>{
  const open=$('settings').hidden;$('settings').hidden=!open;$('settings-toggle').setAttribute('aria-expanded',String(open));
};
function fitMask(){
  const size=Number($('mask-size').value);$('head-scale').setAttribute('scale',`${size} ${size} ${size}`);
  $('head-scale').setAttribute('position',`0 ${$('mask-height').value} 0`);
  $('head').components?.['braid-motion']?.reset();
}
$('mask-size').oninput=fitMask;$('mask-height').oninput=fitMask;
$('motion').checked=!matchMedia('(prefers-reduced-motion: reduce)').matches;
$('motion').onchange=()=>{requestMotion();const c=$('head').components?.['braid-motion'];if(c){c.enabled=$('motion').checked;c.reset();}};
$('reset-fit').onclick=()=>{$('mask-size').value=10.8;$('mask-height').value=0;fitMask();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseCamera();audio.pause();}});
window.addEventListener('pagehide',()=>{pauseCamera();audio.pause();arSystem?.video?.srcObject?.getTracks().forEach(track=>track.stop());});
window.addEventListener('resize',()=>{clearTimeout(scrollTimer);center(selected);});
select(0);
if(scene.hasLoaded)startCamera();else scene.addEventListener('loaded',startCamera,{once:true});
