const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map();
function make(){return {hidden:true,value:'0',textContent:'',callbacks:{},children:[],offsetLeft:0,offsetWidth:200,clientWidth:390,scrollLeft:0,object3D:{visible:false},components:{},classList:{toggle(){},add(){},remove(){}},style:{setProperty(){}},setAttribute(k,v){this[k]=v;},append(...c){this.children.push(...c);},addEventListener(k,f){this.callbacks[k]=f;},scrollTo(){},focus(){}};}
const el=id=>{if(!elements.has(id))elements.set(id,make());return elements.get(id);};
let started=0,paused=0,plays=0;
const ar={start(){started++;},pause(){paused++;},video:{play:async()=>{},remove(){},srcObject:{getVideoTracks:()=>[{readyState:'live'}],getTracks:()=>[{stop(){}}]}},controller:{processVideo(){}}};
const scene=el('scene');scene.hasLoaded=true;scene.systems={'mindar-face-system':ar};scene.renderer={setPixelRatio(){}};
const audio=el('audio');audio.paused=true;audio.pause=()=>{audio.paused=true;};audio.play=()=>{plays++;return Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));};
const doc={hidden:false,callbacks:{},getElementById:el,querySelector:()=>scene,createElement:make,addEventListener(k,f){this.callbacks[k]=f;}};
const c={document:doc,console,matchMedia:()=>({matches:false}),isSecureContext:true,navigator:{mediaDevices:{getUserMedia(){}}},location:{protocol:'http:',reload(){}},devicePixelRatio:3,setTimeout(){return 1;},clearTimeout(){},addEventListener(){},AFRAME:{}};c.window=c;
vm.createContext(c);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../app.js'),'utf8'),c);
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(started,1);assert.equal(el('records').children.length,19);assert.match(audio.src,/HYAENA.mp3$/);assert.match(el('music-status').textContent,/Touche le vinyle/);
 el('records').children[1].onclick();assert.match(audio.src,/THANK-GOD.mp3$/);assert.equal(el('track-count').textContent,'02 / 19');
 scene.callbacks.arReady();doc.hidden=true;doc.callbacks.visibilitychange();assert.equal(paused,1);assert.equal(audio.paused,true);
 el('reset-fit').onclick();assert.equal(el('head-scale').scale,'10.8 10.8 10.8');
 audio.callbacks.error();assert.match(el('music-status').textContent,/pas encore disponible/);
 console.log('PASS: automatic camera request, 19 records, first MP3, autoplay fallback, selection, background pause, scale reset, missing file.');
})();
