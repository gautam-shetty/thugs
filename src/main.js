import './base.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

class BasicCharacterControls {
    constructor(params) {
        this._Init(params)
    }
  
    _Init(params) {
        this._params = params
        this._move = {
            forward: false,
            backward: false,
            left: false,
            right: false,
        }
        this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0)
        this._acceleration = new THREE.Vector3(1, 0.25, 50.0)
        this._velocity = new THREE.Vector3(0, 0, 0)
  
        document.addEventListener('keydown', (e) => this._onKeyDown(e), false)
        document.addEventListener('keyup', (e) => this._onKeyUp(e), false)
    }
  
    _onKeyDown(event) {
        switch (event.keyCode) {
            case 87: // w
                this._move.forward = true
                break
            case 65: // a
                this._move.left = true
                break
            case 83: // s
                this._move.backward = true
                break
            case 68: // d
                this._move.right = true
                break
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break
        }
    }
  
    _onKeyUp(event) {
        switch (event.keyCode) {
            case 87: // w
                this._move.forward = false
                break
            case 65: // a
                this._move.left = false
                break
            case 83: // s
                this._move.backward = false
                break
            case 68: // d
                this._move.right = false
                break
            case 38: // up
            case 37: // left
            case 40: // down
            case 39: // right
                break
        }
    }
  
    Update(timeInSeconds) {
        const velocity = this._velocity
        const frameDecceleration = new THREE.Vector3(
            velocity.x * this._decceleration.x,
            velocity.y * this._decceleration.y,
            velocity.z * this._decceleration.z
            )
        frameDecceleration.multiplyScalar(timeInSeconds)
        frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
            Math.abs(frameDecceleration.z), Math.abs(velocity.z))
        velocity.add(frameDecceleration)
  
        const controlObject = this._params.target
        const _Q = new THREE.Quaternion()
        const _A = new THREE.Vector3()
        const _R = controlObject.quaternion.clone()
  
        if (this._move.forward) {
            velocity.z += this._acceleration.z * timeInSeconds
        }
        if (this._move.backward) {
            velocity.z -= this._acceleration.z * timeInSeconds
        }
        if (this._move.left) {
            _A.set(0, 1, 0)
            _Q.setFromAxisAngle(_A, Math.PI * timeInSeconds * this._acceleration.y)
            _R.multiply(_Q)
        }
        if (this._move.right) {
            _A.set(0, 1, 0)
            _Q.setFromAxisAngle(_A, -Math.PI * timeInSeconds * this._acceleration.y)
            _R.multiply(_Q)
        }
        
        controlObject.quaternion.copy(_R)
  
        const oldPosition = new THREE.Vector3()
        oldPosition.copy(controlObject.position)
  
        const forward = new THREE.Vector3(0, 0, 1)
        forward.applyQuaternion(controlObject.quaternion)
        forward.normalize()
  
        const sideways = new THREE.Vector3(1, 0, 0)
        sideways.applyQuaternion(controlObject.quaternion)
        sideways.normalize()
  
        sideways.multiplyScalar(velocity.x * timeInSeconds)
        forward.multiplyScalar(velocity.z * timeInSeconds)
    
        controlObject.position.add(forward)
        controlObject.position.add(sideways)
    
        oldPosition.copy(controlObject.position)
    }
  }

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
        const controls = new OrbitControls(this._camera, this._renderer.domElement)
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

        this._mixer = []
        this._previousRAF = null

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

            const params = {
                target: model,
                camera: this._camera,
            }
            this._controls = new BasicCharacterControls(params)

            // Load Internal Animation
            const m = new THREE.AnimationMixer(model)
            this._mixer.push(m)
            // model.animations.forEach( ( clip ) => {
            //     console.log(clip.name)
            // })
            const idle = m.clipAction(model.animations[0])
            idle.play()
            // model.animations.forEach( ( clip ) => {
            //     this._mixer.clipAction( clip ).play()
            // })

            // Load External Animation
            // const anim = new FBXLoader()
            // anim.setPath('./assets/')
            // anim.load('walk.fbx', (anim) => {
            //     this._mixer = new THREE.AnimationMixer(fbx)
            //     const idle = mixer.clipAction(anim.animations[0])
            //     idle.play()
            // })
            this._scene.add(model)
        }, this._OnProgress, this._OnError)
    }

    _LoadGLTFModel() {
        //Load model
        const loader = new GLTFLoader()
        loader.setPath('./terrorist/')
        loader.load('scene.gltf', (gltf) => {
            const mesh = gltf.scene  
            mesh.scale.setScalar(0.5)
            mesh.traverse(c => {
                c.castShadow = true
            })

            this._scene.add(mesh)

            // Load animation
            this._mixer = new THREE.AnimationMixer(mesh)
            gltf.animations.forEach( ( clip ) => {
                this._mixer.clipAction( clip ).play()
                })
        
        }, this._OnProgressm, this._OnError)
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

            if (this._previousRAF === null) {
                this._previousRAF = t
            }
      
            this._RAF()
      
            // if (this._mixer) this._mixer[0].update(this._clock.getDelta())

            this._renderer.render(this._scene, this._camera)

            this._Step(t - this._previousRAF)
            this._previousRAF = t
          })
    }

    _Step(timeElapsed) {
        const timeElapsedS = timeElapsed * 0.001
        if (this._mixer) {
            this._mixer.map(m => m.update(timeElapsedS))
        }
        if (this._controls) {
            this._controls.Update(timeElapsedS)
        }
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
  _APP = new ThugGame()
})