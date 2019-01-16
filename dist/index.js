(function () {
  var main = null;
  var modules = {
      "require": {
          factory: undefined,
          dependencies: [],
          exports: function (args, callback) { return require(args, callback); },
          resolved: true
      }
  };
  function define(id, dependencies, factory) {
      return main = modules[id] = {
          dependencies: dependencies,
          factory: factory,
          exports: {},
          resolved: false
      };
  }
  function resolve(definition) {
      if (definition.resolved === true)
          return;
      definition.resolved = true;
      var dependencies = definition.dependencies.map(function (id) {
          return (id === "exports")
              ? definition.exports
              : (function () {
                  if(modules[id] !== undefined) {
                    resolve(modules[id]);
                    return modules[id].exports;
                  } else if(id === "three") {
                    return window["THREE"];
                  } else {
                    try {
                      return require(id);
                    } catch(e) {
                      throw Error("module '" + id + "' not found.");
                    }
                  }
              })();
      });
      definition.factory.apply(null, dependencies);
  }
  function collect() {
      Object.keys(modules).map(function (key) { return modules[key]; }).forEach(resolve);
      return (main !== null) 
        ? main.exports
        : undefined
  }

  define("instanced/geometry/instanced", ["require", "exports", "three"], function (require, exports, THREE) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function createInstancedBufferGeometry(instanceCount, geometry) {
          const translations = new Float32Array(instanceCount * 3);
          const rotations = new Float32Array(instanceCount * 3);
          const scales = new Float32Array(instanceCount * 3);
          const instanceTransalations = new THREE.InstancedBufferAttribute(translations, 3);
          const instanceRotations = new THREE.InstancedBufferAttribute(rotations, 3);
          const instanceScales = new THREE.InstancedBufferAttribute(scales, 3);
          const instanced = new THREE.InstancedBufferGeometry();
          instanced.copy(geometry);
          instanced.addAttribute('instanceTranslation', instanceTransalations);
          instanced.addAttribute('instanceRotation', instanceRotations);
          instanced.addAttribute('instanceScale', instanceScales);
          return instanced;
      }
      exports.createInstancedBufferGeometry = createInstancedBufferGeometry;
  });
  define("instanced/materials/depth", ["require", "exports", "three"], function (require, exports, THREE) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      const VERTEXSHADER = `
  #ifdef INSTANCED
    attribute vec3 instanceTranslation;
    attribute vec3 instanceRotation;
    attribute vec3 instanceScale;
  #endif
  #include <common>
  #include <uv_pars_vertex>
  #include <displacementmap_pars_vertex>
  #include <morphtarget_pars_vertex>
  #include <skinning_pars_vertex>
  #include <logdepthbuf_pars_vertex>
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
    // instanced
    #ifdef INSTANCED
      transformed = transformed + instanceTranslation;
    #endif
    #include <morphtarget_vertex>
    #include <skinning_vertex>
    #include <displacementmap_vertex>
    #include <project_vertex>
    #include <logdepthbuf_vertex>
    #include <clipping_planes_vertex>
  }`;
      function createInstancedMeshDepthMaterial() {
          const material = new THREE['MeshDistanceMaterial']();
          material['onBeforeCompile'] = shader => {
              shader.vertexShader = VERTEXSHADER;
              return shader;
          };
          material.defines = material.defined || {};
          material.defines['INSTANCED'] = '';
          material.defines['DEPTH_PACKING'] = THREE.RGBADepthPacking;
          return material;
          return material;
      }
      exports.createInstancedMeshDepthMaterial = createInstancedMeshDepthMaterial;
  });
  define("instanced/materials/distance", ["require", "exports", "three"], function (require, exports, THREE) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
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
  }`;
      function createInstancedMeshDistanceMaterial() {
          const material = new THREE['MeshDistanceMaterial']();
          material['onBeforeCompile'] = shader => {
              shader.vertexShader = VERTEXSHADER;
              return shader;
          };
          material.defines = material.defined || {};
          material.defines['INSTANCED'] = '';
          material.defines['DEPTH_PACKING'] = THREE.RGBADepthPacking;
          return material;
      }
      exports.createInstancedMeshDistanceMaterial = createInstancedMeshDistanceMaterial;
  });
  define("instanced/materials/standard", ["require", "exports"], function (require, exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
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
  }`;
      function createInstancedMeshStandardMaterial(material) {
          const instanced = material.clone();
          instanced['onBeforeCompile'] = shader => {
              shader.vertexShader = VERTEXSHADER;
              return shader;
          };
          instanced.defines = material.defines || {};
          instanced.defines['INSTANCED'] = '';
          return instanced;
      }
      exports.createInstancedMeshStandardMaterial = createInstancedMeshStandardMaterial;
  });
  define("instanced/materials/material", ["require", "exports", "three", "instanced/materials/standard"], function (require, exports, THREE, standard_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      function createInstancedMaterial(material) {
          if (material instanceof THREE.MeshStandardMaterial) {
              return standard_1.createInstancedMeshStandardMaterial(material);
          }
          throw Error('unsupported material type');
      }
      exports.createInstancedMaterial = createInstancedMaterial;
  });
  define("instanced/materials/index", ["require", "exports", "instanced/materials/depth", "instanced/materials/distance", "instanced/materials/standard", "instanced/materials/material"], function (require, exports, depth_1, distance_1, standard_2, material_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.createInstancedMeshDepthMaterial = depth_1.createInstancedMeshDepthMaterial;
      exports.createInstancedMeshDistanceMaterial = distance_1.createInstancedMeshDistanceMaterial;
      exports.createInstancedMeshStandardMaterial = standard_2.createInstancedMeshStandardMaterial;
      exports.createInstancedMaterial = material_1.createInstancedMaterial;
  });
  define("instanced/mesh", ["require", "exports", "three", "instanced/geometry/instanced", "instanced/materials/index", "instanced/materials/index", "instanced/materials/index"], function (require, exports, THREE, instanced_1, index_1, index_2, index_3) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      class Instance {
          constructor(index, position, rotation, scale) {
              this.index = index;
              this.position = position;
              this.rotation = rotation;
              this.scale = scale;
          }
      }
      exports.Instance = Instance;
      class InstancedMesh extends THREE.Mesh {
          constructor(instanceCount, geometry, material) {
              super(instanced_1.createInstancedBufferGeometry(instanceCount, geometry), index_3.createInstancedMaterial(material));
              this.frustumCulled = false;
              this['customDepthMaterial'] = index_1.createInstancedMeshDepthMaterial();
              this['customDistanceMaterial'] = index_2.createInstancedMeshDistanceMaterial();
              this.instances = Array.from({ length: instanceCount }).map((n, index) => new Instance(index, new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()));
              const instancedGeometry = this.geometry;
              this.instanceTranslation = instancedGeometry.getAttribute('instanceTranslation');
              this.instanceRotation = instancedGeometry.getAttribute('instanceRotation');
              this.instanceScale = instancedGeometry.getAttribute('instanceScale');
          }
          updateInstances() {
              for (const instance of this.instances) {
                  this.instanceTranslation.set([instance.position.x, instance.position.y, instance.position.z], instance.index * 3);
                  this.instanceRotation.set([instance.rotation.x, instance.rotation.y, instance.rotation.z], instance.index * 3);
                  this.instanceScale.set([instance.scale.x, instance.scale.y, instance.scale.z], instance.index * 3);
              }
              this.instanceTranslation.needsUpdate = true;
              this.instanceRotation.needsUpdate = true;
              this.instanceScale.needsUpdate = true;
          }
      }
      exports.InstancedMesh = InstancedMesh;
  });
  define("index", ["require", "exports", "three", "instanced/mesh"], function (require, exports, THREE, mesh_1) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      const WIDTH = 1200;
      const HEIGHT = 800;
      function createRenderer() {
          const element = document.getElementById('renderer');
          const renderer = new THREE.WebGLRenderer({ antialias: true });
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          renderer.setSize(WIDTH, HEIGHT);
          element.appendChild(renderer.domElement);
          return renderer;
      }
      function createCamera() {
          const camera = new THREE.PerspectiveCamera(90, WIDTH / HEIGHT, 0.1, 1000);
          camera.position.set(0, 20, 0);
          camera.up.set(0, 1, 0);
          camera.lookAt(0, 0, 0);
          return camera;
      }
      function createCubes() {
          const geometry = new THREE.BoxBufferGeometry(1, 1, 1);
          const material = new THREE.MeshStandardMaterial({
              color: 0x888888,
              metalness: 0.1,
              roughness: 0.4,
              dithering: true,
              emissive: 0.3
          });
          const mesh = new mesh_1.InstancedMesh(4096, geometry, material);
          for (const instance of mesh.instances) {
              instance.position.x = (Math.random() * 16) - 8;
              instance.position.y = (Math.random() * 16) - 8;
              instance.position.z = (Math.random() * 16) - 8;
          }
          mesh.updateInstances();
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          return mesh;
      }
      function createPlane() {
          const geometry = new THREE.BoxBufferGeometry(64, 64, 64);
          const material = new THREE.MeshStandardMaterial({
              color: 0x444444,
              metalness: 0.1,
              roughness: 0.8,
              emissive: 0.3
          });
          material.side = THREE.DoubleSide;
          const mesh = new THREE.Mesh(geometry, material);
          mesh.receiveShadow = true;
          return mesh;
      }
      function createLights() {
          const ambient = new THREE.AmbientLight(0x333333);
          const white = new THREE.PointLight(0xffffff, 2, 48);
          white.position.set(16, 16, 16);
          white.shadow.mapSize.width = 1024;
          white.shadow.mapSize.height = 1024;
          white.castShadow = true;
          const red = new THREE.PointLight(0xff8888, 1, 64);
          red.position.set(-16, -16, -16);
          red.shadow.mapSize.width = 1024;
          red.shadow.mapSize.height = 1024;
          red.castShadow = true;
          const green = new THREE.PointLight(0x88ff88, 2, 48);
          green.position.set(16, 16, -16);
          green.shadow.mapSize.width = 1024;
          green.shadow.mapSize.height = 1024;
          green.castShadow = true;
          const blue = new THREE.PointLight(0x8888ff, 2, 48);
          blue.position.set(-16, 16, 16);
          blue.shadow.mapSize.width = 1024;
          blue.shadow.mapSize.height = 1024;
          blue.castShadow = true;
          return [ambient, white, red, green, blue];
      }
      function createScene() {
          const scene = new THREE.Scene();
          scene.fog = new THREE.FogExp2(0x000000, 0.02);
          const cubes = new THREE.Object3D();
          cubes.add(createCubes());
          scene.add(cubes);
          scene.add(...createLights());
          scene.add(createPlane());
          return scene;
      }
      const renderer = createRenderer();
      const camera = createCamera();
      const scene = createScene();
      let angle = 0;
      function loop() {
          angle += 0.01;
          scene.children[0].rotation.y = angle;
          scene.children[0].rotation.x = angle;
          scene.rotation.y = -angle;
          scene.rotation.z = -angle;
          renderer.render(scene, camera);
          requestAnimationFrame(() => loop());
      }
      loop();
  });
  
  return collect(); 
})();