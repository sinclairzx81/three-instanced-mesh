import { MeshStandardMaterial } from 'three'

const VERTEXSHADER = `#define PHYSICAL
varying vec3 vViewPosition;

#ifdef INSTANCED
attribute vec3 instanceTranslation;
attribute vec3 instanceRotation;
attribute vec3 instanceScale;
#endif

#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <uv2_vertex>
  #include <color_vertex>
  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>
  #include <defaultnormal_vertex>
#ifndef FLAT_SHADED
  vNormal = normalize( transformedNormal );
#endif
  #include <begin_vertex>
#ifdef INSTANCED
  transformed = transformed + instanceTranslation;
#endif
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  vViewPosition = - mvPosition.xyz;
  #include <worldpos_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>
}`

export function createInstancedMeshStandardMaterial(material: MeshStandardMaterial): MeshStandardMaterial {
  const instanced = material.clone()
  instanced['onBeforeCompile'] = shader => {
    shader.vertexShader = VERTEXSHADER
    return shader
  }
  instanced.defines = material.defines || {}
  instanced.defines['INSTANCED'] = ''
  return instanced
}
