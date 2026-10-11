import bpy, json
from pathlib import Path
root=Path(__file__).resolve().parents[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(root/'assets/Fortnite - Travis Scott/Fortnite -Travis Scott/Travis Scott.fbx'))
report=[]
for o in bpy.data.objects:
 d={'name':o.name,'type':o.type,'dimensions':list(o.dimensions)}
 if o.type=='MESH':
  d.update(vertices=len(o.data.vertices),materials=[m.name for m in o.data.materials],groups=[g.name for g in o.vertex_groups],bounds=[[min((o.matrix_world@v.co)[i] for v in o.data.vertices),max((o.matrix_world@v.co)[i] for v in o.data.vertices)] for i in range(3)])
 if o.type=='ARMATURE': d['bones']=[{'name':b.name,'head':list(b.head_local),'tail':list(b.tail_local)} for b in o.data.bones]
 report.append(d)
(root/'tools/model-inspection.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
