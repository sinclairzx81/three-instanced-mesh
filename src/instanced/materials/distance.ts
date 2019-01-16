import * as THREE from 'three'

const VERTEXSHADER = `
#define DISTANCE

#ifdef INSTANCED
attribute vec3 instanceTranslation;
attribute vec3 instanceRotation;
attribute vec3 instanceScale;
#endif

varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
  #include <uv_vertex>
  #include <skinbase_vertex>
  #ifdef USE_DISPLACEMENTMAP
    #include <beginnormal_vertex>
    #include <morphnormal_vertex>
    #include <skinnormal_vertex>
  #endif
  #include <begin_vertex>
  #ifdef INSTANCED
    transformed = transformed + instanceTranslation;
  #endif
  #include <morphtarget_vertex>
  #include <skinning_vertex>
  #include <displacementmap_vertex>
  #include <project_vertex>
  #include <worldpos_vertex>
  #include <clipping_planes_vertex>
  vWorldPosition = worldPosition.xyz;
}`

export function createInstancedMeshDistanceMaterial(): THREE.Material {
  const material = new THREE['MeshDistanceMaterial']()
  material['onBeforeCompile'] = shader => {
    shader.vertexShader = VERTEXSHADER
    return shader
  }
  material.defines = material.defined || {} 
  material.defines['INSTANCED'] = ''
  material.defines['DEPTH_PACKING'] = THREE.RGBADepthPacking
  return material
}