import * as THREE from 'three'
import { createInstancedMeshStandardMaterial } from './standard'


export function createInstancedMaterial(material: THREE.Material) {
  if(material instanceof THREE.MeshStandardMaterial) {
    return createInstancedMeshStandardMaterial(material)
  }
  throw Error('unsupported material type')
}