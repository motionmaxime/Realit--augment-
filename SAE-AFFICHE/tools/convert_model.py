import bpy, json, math
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
src=root/'assets/Fortnite - Travis Scott/Fortnite -Travis Scott'
out=root/'assets/models'
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath=str(src/'Travis Scott.fbx'))
for obj in list(bpy.data.objects):
 if obj.type=='MESH' and 'Body' in obj.name: bpy.data.objects.remove(obj,do_unlink=True)
for obj in bpy.data.objects:
 if obj.type!='MESH': continue
 kind='hair' if 'Hair' in obj.name else 'head'
 mat=bpy.data.materials.new(kind+'_web'); mat.use_nodes=True
 nodes=mat.node_tree.nodes; links=mat.node_tree.links
 bs=nodes.get('Principled BSDF'); bs.inputs['Roughness'].default_value=.72
 for suffix in ('d','n'):
  img=bpy.data.images.load(str(src/f'{kind}_{suffix}.png'),check_existing=True)
  if max(img.size)>1024: img.scale(1024,1024)
  img.pack()
  tex=nodes.new('ShaderNodeTexImage'); tex.image=img
  if suffix=='d': links.new(tex.outputs['Color'],bs.inputs['Base Color'])
  else:
   img.colorspace_settings.name='Non-Color'
   normal=nodes.new('ShaderNodeNormalMap'); normal.inputs['Strength'].default_value=.65
   links.new(tex.outputs['Color'],normal.inputs['Color']); links.new(normal.outputs['Normal'],bs.inputs['Normal'])
 obj.data.materials.clear(); obj.data.materials.append(mat)
# Keep the armature intact, including braid and facial bones.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.wm.save_as_mainfile(filepath=str(out/'travis-head-textured.blend'))
bpy.ops.export_scene.gltf(filepath=str(out/'travis-head.glb'),export_format='GLB',export_animations=False,export_skins=True,export_yup=True)
# Render the actual textured asset for visual verification.
scene=bpy.context.scene
scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.render.resolution_x=640; scene.render.resolution_y=800; scene.render.resolution_percentage=100
scene.world=bpy.data.worlds.new('World'); scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.12,.12,.12,1)
def aim(obj,p): obj.rotation_euler=(Vector(p)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(.25,-.85,1.78)); cam=bpy.context.object; aim(cam,(0,0,1.70)); cam.data.type='ORTHO'; cam.data.ortho_scale=.47; scene.camera=cam
for loc,power,size in [((-.4,-.5,2.3),40,.6),((.5,-.1,1.9),20,.5)]:
 bpy.ops.object.light_add(type='AREA',location=loc); light=bpy.context.object; light.data.energy=power; light.data.shape='DISK'; light.data.size=size; aim(light,(0,0,1.7))
scene.render.filepath=str(out/'travis-head-preview.png'); bpy.ops.render.render(write_still=True)
print('EXPORT_COMPLETE')
