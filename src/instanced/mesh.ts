import * as THREE from 'three'
import { createInstancedBufferGeometry } from './geometry/instanced'
import { createInstancedMeshDepthMaterial } from './materials/index'
import { createInstancedMeshDistanceMaterial } from './materials/index'
import { createInstancedMaterial } from './materials/index'

export class Instance {
  constructor(
    public index:    number,
    public position: THREE.Vector3,
    public rotation: THREE.Vector3,
    public scale:    THREE.Vector3) {}
}

export class InstancedMesh extends THREE.Mesh {
  public instances: Instance[]
  private instanceTranslation: THREE.InstancedBufferAttribute
  private instanceRotation: THREE.InstancedBufferAttribute
  private instanceScale: THREE.InstancedBufferAttribute

  constructor(instanceCount: number, geometry: THREE.BufferGeometry, material: THREE.Material) {
    super(createInstancedBufferGeometry(instanceCount, geometry), createInstancedMaterial(material))
    this.frustumCulled = false
    this['customDepthMaterial'] = createInstancedMeshDepthMaterial()
    this['customDistanceMaterial'] = createInstancedMeshDistanceMaterial()
    // setup instance array
    this.instances = Array.from({ length: instanceCount }).map((n, index) => new Instance(
      index, 
      new THREE.Vector3(), 
      new THREE.Vector3(), 
      new THREE.Vector3()
      ))
    // bind instance buffer attributes
    const instancedGeometry = this.geometry as THREE.InstancedBufferGeometry
    this.instanceTranslation = instancedGeometry.getAttribute('instanceTranslation') as THREE.InstancedBufferAttribute
    this.instanceRotation = instancedGeometry.getAttribute('instanceRotation') as THREE.InstancedBufferAttribute
    this.instanceScale = instancedGeometry.getAttribute('instanceScale') as THREE.InstancedBufferAttribute
  }

  public updateInstances() {
    for(const instance of this.instances) {
      this.instanceTranslation.set([instance.position.x, instance.position.y, instance.position.z], instance.index * 3)
      this.instanceRotation.set([instance.rotation.x, instance.rotation.y, instance.rotation.z], instance.index * 3)
      this.instanceScale.set([instance.scale.x, instance.scale.y, instance.scale.z], instance.index * 3)
    }
    this.instanceTranslation.needsUpdate = true
    this.instanceRotation.needsUpdate = true
    this.instanceScale.needsUpdate = true
  }
}
