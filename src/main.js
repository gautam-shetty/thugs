import './base.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Clock
const clock = new THREE.Clock()

// Sizes
 const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
}, false)


// Renderer
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    canvas: canvas,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)

// Base camera
const fov = 60
const aspect = 1920/1080
const near = 1.0
const far = 1000.0
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
camera.position.set(75, 20, 0)
scene.add(camera)

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
scene.add(light)

light = new THREE.AmbientLight(0xFFFFFF, 4.0)
scene.add(light)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 20, 0)
controls.update()

// Loader
const loader = new THREE.CubeTextureLoader()
const texture = loader.load([
    './assets/Yokohama3/posx.jpg',
    './assets/Yokohama3/negx.jpg',
    './assets/Yokohama3/posy.jpg',
    './assets/Yokohama3/negy.jpg',
    './assets/Yokohama3/posz.jpg',
    './assets/Yokohama3/negz.jpg',
])
scene.background = texture


// Plane Generator
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100, 10, 10), 
    new THREE.MeshStandardMaterial({
        color: 0x202020 
    }))
plane.castShadow = false
plane.receiveShadow = true
plane.rotation.x = -Math.PI / 2
scene.add(plane)

let mixer;

// Loader Progression Handler
var onProgress = function (xhr) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100
        console.log(Math.round(percentComplete, 2) + '% loaded')
    } 
}

// Loader Error Handler 
var onError = function (xhr) {
    console.log('Failed to load model! Error-'+ xhr)
}

// FBXLoader 
const loadFBXModel = function () {
    
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
        mixer = new THREE.AnimationMixer(model)
        model.animations.forEach( ( clip ) => {
        mixer.clipAction( clip ).play()
        })

        // Load External Animation
        // const anim = new FBXLoader()
        // anim.setPath('./assets/')
        // anim.load('walk.fbx', (anim) => {
        //     mixer = new THREE.AnimationMixer(fbx)
        //     const idle = mixer.clipAction(anim.animations[0])
        //     idle.play()
        // })
        scene.add(model)
    }, onProgress, onError)

}

// GLTFLoader
const loadGLTFModel = function () {

    const loader = new GLTFLoader()
    loader.setPath('./terrorist/')
    loader.load('scene.gltf', (gltf) => {
      const mesh = gltf.scene  
      mesh.scale.setScalar(0.5)
      mesh.traverse(c => {
        c.castShadow = true
      })

      scene.add(mesh)

      // Load animation
      mixer = new THREE.AnimationMixer(mesh)
      gltf.animations.forEach( ( clip ) => {
        mixer.clipAction( clip ).play()
        })
      
    }, onProgress, onError)

}

loadFBXModel()
// loadGLTFModel()

const gameLoop = function () {

    // required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

    requestAnimationFrame( gameLoop )

    if (mixer) mixer.update(clock.getDelta())

    renderer.render( scene, camera )

}

gameLoop()