/* Verlet tips on each rig segment: inertia in camera space, gravity and soft rest constraints. */
if (window.AFRAME) AFRAME.registerComponent('braid-motion', {
  init() {
    const T=AFRAME.THREE;
    this.enabled=!matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.segments=[];this.fresh=true;this.lastDt=1/60;
    this.gravity=new T.Vector3(0,-1,0);this.measuredGravity=this.gravity.clone();
    this.start=new T.Vector3();this.target=new T.Vector3();this.velocity=new T.Vector3();
    this.desired=new T.Vector3();this.restDirection=new T.Vector3();this.oldTip=new T.Vector3();
    this.parentQ=new T.Quaternion();this.swing=new T.Quaternion();this.identity=new T.Quaternion();
    this.onOrientation=event=>{
      if(event.beta===null||event.gamma===null)return;
      const b=T.MathUtils.degToRad(event.beta),g=T.MathUtils.degToRad(event.gamma);
      const a=T.MathUtils.degToRad(screen.orientation?.angle ?? window.orientation ?? 0);
      const x=-Math.cos(b)*Math.sin(g),y=-Math.sin(b),z=-Math.cos(b)*Math.cos(g);
      this.measuredGravity.set(x*Math.cos(a)+y*Math.sin(a),-x*Math.sin(a)+y*Math.cos(a),z).normalize();
    };
    window.addEventListener('deviceorientation',this.onOrientation);
    this.el.addEventListener('model-loaded',()=>{
      this.segments=[];
      this.el.getObject3D('mesh').traverse(bone=>{
        if(bone.isMesh)bone.frustumCulled=false;
        if(!bone.isBone||!bone.name.startsWith('dyn_braid'))return;
        const child=bone.children.find(c=>c.isBone&&c.name.startsWith('dyn_braid'));
        if(!child||child.position.length()<0.00001)return;
        let depth=0,parent=bone.parent;
        while(parent?.name.startsWith('dyn_braid')){depth++;parent=parent.parent;}
        this.segments.push({bone,child,rest:bone.quaternion.clone(),tip:new T.Vector3(),previous:new T.Vector3(),depth});
      });
      this.segments.sort((a,b)=>a.depth-b.depth);
      this.reset();
    });
    this.el.sceneEl.addEventListener('targetLost',()=>this.reset());
  },
  reset(){this.fresh=true;this.segments.forEach(s=>s.bone.quaternion.copy(s.rest));},
  remove(){window.removeEventListener('deviceorientation',this.onOrientation);},
  aimSegment(s){
    this.desired.copy(s.tip).sub(this.start).normalize().applyQuaternion(this.parentQ);
    this.swing.setFromUnitVectors(this.restDirection,this.desired);
    const angle=this.identity.angleTo(this.swing),limit=s.depth===0?0.65:0.9;
    if(angle>limit)this.swing.slerp(this.identity,1-limit/angle);
    s.bone.quaternion.copy(this.swing).multiply(s.rest);
    s.bone.updateWorldMatrix(false,false);
    s.tip.copy(s.child.position).applyMatrix4(s.bone.matrixWorld);
  },
  tick(time,elapsed){
    const anchor=document.getElementById('face-anchor').object3D;
    if(!this.enabled||!anchor.visible||!elapsed||elapsed>120){this.reset();return;}
    const dt=Math.min(elapsed/1000,1/30),T=AFRAME.THREE;
    this.gravity.lerp(this.measuredGravity,1-Math.exp(-dt*8)).normalize();
    // Parents first: every following segment inherits the bend above it.
    for(const s of this.segments){
      s.bone.quaternion.copy(s.rest);s.bone.updateWorldMatrix(true,false);
      s.bone.getWorldPosition(this.start);
      this.target.copy(s.child.position).applyMatrix4(s.bone.matrixWorld);
      const length=this.target.distanceTo(this.start);
      if(length<1e-6)continue;
      if(this.fresh||s.tip.distanceTo(this.start)>length*10){s.tip.copy(this.target);s.previous.copy(s.tip);}
      this.oldTip.copy(s.tip);
      this.velocity.copy(s.tip).sub(s.previous).multiplyScalar(Math.exp(-dt*3.4)*dt/this.lastDt);
      s.tip.add(this.velocity);
      // Softer down the chain, with noticeable gravitational droop.
      const stiffness=s.depth===0?42:18;
      s.tip.addScaledVector(this.desired.copy(this.target).sub(s.tip),stiffness*dt*dt);
      s.tip.addScaledVector(this.gravity,length*(s.depth===0?24:44)*dt*dt);
      s.bone.parent.getWorldQuaternion(this.parentQ).invert();
      this.restDirection.copy(s.child.position).normalize().applyQuaternion(s.rest);
      this.aimSegment(s);
      s.previous.copy(this.oldTip);
    }
    this.fresh=false;this.lastDt=dt;
  }
});
