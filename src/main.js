import './base.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

class ThugGame{

    constructor() {
        this._Initialize()
    }

    _Initialize() {
        // Renderer
        this._renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            canvas: canvas,
        })
        this._renderer.shadowMap.enabled = true
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this._renderer.setSize(window.innerWidth, window.innerHeight)
        this._renderer.setPixelRatio(window.devicePixelRatio)

        window.addEventListener('resize', () =>{
            this._OnWindowResize()
        }, false)

        // Scene
        this._scene = new THREE.Scene()

        // Clock
        this._clock = new THREE.Clock()

        // Base camera
        const fov = 60
        const aspect = 1920/1080
        const near = 1.0
        const far = 1000.0
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this._camera.position.set(75, 20, 0)

        /**
         * Lights
         */
        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0)
        light.position.set(20, 100, 10)
        light.target.position.set(0, 0, 0)
        light.castShadow = true
        light.shadow.bias = -0.001
        light.shadow.mapSize.width = 2048
        light.shadow.mapSize.height = 2048
        light.shadow.camera.near = 0.5
        light.shadow.camera.far = 500.0
        light.shadow.camera.left = 100
        light.shadow.camera.right = -100
        light.shadow.camera.top = 100
        light.shadow.camera.bottom = -100
        this._scene.add(light)

        light = new THREE.AmbientLight(0xFFFFFF, 4.0)
        this._scene.add(light)

        // Controls
        const controls = new OrbitControls(this._camera, canvas)
        controls.target.set(0, 20, 0)
        controls.update()

        // Cube Texture Loader
        const loader = new THREE.CubeTextureLoader()
        const texture = loader.load([
            './assets/Yokohama3/posx.jpg',
            './assets/Yokohama3/negx.jpg',
            './assets/Yokohama3/posy.jpg',
            './assets/Yokohama3/negy.jpg',
            './assets/Yokohama3/posz.jpg',
            './assets/Yokohama3/negz.jpg',
        ])
        this._scene.background = texture

        // Plane Generator
        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10), 
            new THREE.MeshStandardMaterial({
                color: 0x202020 
            }))
        plane.castShadow = false
        plane.receiveShadow = true
        plane.rotation.x = -Math.PI / 2
        this._scene.add(plane)

        this._mixer = null

        this._LoadFBXModel()
        this._RAF()
    }

    _LoadFBXModel() {
        // Load model
        const loader = new FBXLoader()
        loader.setPath('./assets/')
        loader.load('Male_Suit.fbx', (fbx) => {
            const model = fbx
            model.scale.setScalar(0.1)
            model.traverse( c => {
                c.castShadow = true
            })

            // Load Internal Animation
            this._mixer = new THREE.AnimationMixer(model)
            model.animations.forEach( ( clip ) => {
                this._mixer.clipAction( clip ).play()
            })

            // Load External Animation
            // const anim = new FBXLoader()
            // anim.setPath('./assets/')
            // anim.load('walk.fbx', (anim) => {
            //     mixer = new THREE.AnimationMixer(fbx)
            //     const idle = mixer.clipAction(anim.animations[0])
            //     idle.play()
            // })
            this._scene.add(model)
        }, this._OnProgress, this._OnError)
    }

    _OnWindowResize() {
        // Update camera
        this._camera.aspect = window.innerWidth / window.innerHeight
        this._camera.updateProjectionMatrix()
    
        // Update renderer
        this._renderer.setSize(window.innerWidth, window.innerHeight)
    }

    _OnProgress(xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100
            console.log(Math.round(percentComplete, 2) + '% loaded')
        } 
    }

    _OnError(xhr) {
        console.log('Failed to load model! Error-'+ xhr)
    }

    _RAF() {
        requestAnimationFrame((t) => {
      
            this._RAF()
      
            if (this._mixer) this._mixer.update(this._clock.getDelta())

            this._renderer.render(this._scene, this._camera)
          })
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new ThugGame()
})

// GLTFLoader
// const loadGLTFModel = function () {

//     const loader = new GLTFLoader()
//     loader.setPath('./terrorist/')
//     loader.load('scene.gltf', (gltf) => {
//       const mesh = gltf.scene  
//       mesh.scale.setScalar(0.5)
//       mesh.traverse(c => {
//         c.castShadow = true
//       })

//       scene.add(mesh)

//       // Load animation
//       mixer = new THREE.AnimationMixer(mesh)
//       gltf.animations.forEach( ( clip ) => {
//         mixer.clipAction( clip ).play()
//         })
      
//     }, onProgress, onError)

// }