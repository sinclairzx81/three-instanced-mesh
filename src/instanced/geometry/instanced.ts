import * as THREE from 'three'

export function createInstancedBufferGeometry(instanceCount: number, geometry: THREE.BufferGeometry): THREE.InstancedBufferGeometry {
  const translations = new Float32Array(instanceCount * 3)
  const rotations    = new Float32Array(instanceCount * 3)
  const scales       = new Float32Array(instanceCount * 3)
  const instanceTransalations = new THREE.InstancedBufferAttribute(translations, 3)
  const instanceRotations = new THREE.InstancedBufferAttribute(rotations, 3)
  const instanceScales = new THREE.InstancedBufferAttribute(scales, 3)
  const instanced = new THREE.InstancedBufferGeometry()
  instanced.copy(geometry)
  instanced.addAttribute('instanceTranslation', instanceTransalations)
  instanced.addAttribute('instanceRotation', instanceRotations)
  instanced.addAttribute('instanceScale', instanceScales)
  return instanced
}