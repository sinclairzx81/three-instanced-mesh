import * as THREE from 'three'

import { InstancedMesh } from './instanced/mesh'

const WIDTH = 1200
const HEIGHT = 800

function createRenderer(): THREE.WebGLRenderer {
  const element = document.getElementById('renderer')
  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.setSize(WIDTH, HEIGHT)
  element.appendChild(renderer.domElement)
  return renderer
}

function createCamera(): THREE.PerspectiveCamera {
  const camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 0.1, 1000)
  camera.position.set(0, 20, 0)
  camera.up.set(0, 1, 0)
  camera.lookAt(0, 0, 0)
  return camera
}

function createCubes(): THREE.Mesh {
  const geometry = new THREE.BoxBufferGeometry(1, 1, 1)
  const material = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.1,
    roughness: 0.4,
    dithering: true,
    emissive: 0.3
  })
  const mesh = new InstancedMesh(4096, geometry, material)
  for(const instance of mesh.instances) {
    instance.position.x = (Math.random() * 16) - 8
    instance.position.y = (Math.random() * 16) - 8
    instance.position.z = (Math.random() * 16) - 8
  }
  mesh.updateInstances()
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}
function createPlane(): THREE.Mesh {
  const geometry = new THREE.BoxBufferGeometry(64, 64, 64)
  const material = new THREE.MeshStandardMaterial({
    color: 0x444444,
    metalness: 0.1,
    roughness: 0.8,
    emissive: 0.3
  })
  material.side = THREE.DoubleSide
  const mesh = new THREE.Mesh(geometry, material)
  mesh.receiveShadow = true
  return mesh
}

function createLights(): THREE.Light[] {
  const ambient = new THREE.AmbientLight(0x333333)
  const white = new THREE.PointLight(0xffffff, 2, 48)
  white.position.set(16, 16, 16)
  white.shadow.mapSize.width = 1024
  white.shadow.mapSize.height = 1024
  white.castShadow = true

  const red = new THREE.PointLight(0xff8888,  1, 64)
  red.position.set(-16, -16, -16)
  red.shadow.mapSize.width = 1024
  red.shadow.mapSize.height = 1024
  red.castShadow = true

  const green = new THREE.PointLight(0x88ff88,  2, 48)
  green.position.set(16, 16, -16)
  green.shadow.mapSize.width = 1024
  green.shadow.mapSize.height = 1024
  green.castShadow = true

  const blue = new THREE.PointLight(0x8888ff,  2, 48)
  blue.position.set(-16, 16, 16)
  blue.shadow.mapSize.width = 1024
  blue.shadow.mapSize.height = 1024
  blue.castShadow = true
  return [ambient, white, red, green, blue]
}

function createScene() {
  const scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x000000, 0.02)
  const cubes = new THREE.Object3D()
  cubes.add(createCubes())
  scene.add(cubes)
  scene.add(...createLights())
  scene.add(createPlane())
  return scene
}

const renderer = createRenderer()
const camera = createCamera()
const scene = createScene()

let angle = 0

function loop() {
  angle += 0.01
  scene.children[0].rotation.y = angle
  scene.children[0].rotation.x = angle
  scene.rotation.y = -angle
  scene.rotation.z = -angle

  renderer.render(scene, camera)
  requestAnimationFrame(() => loop())
}

loop()
