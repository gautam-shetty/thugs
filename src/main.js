import './base.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

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
let light = new THREE.DirectionalLight(0xFFFFFF)
light.position.set(100, 100, 100)
light.target.position.set(0, 0, 0)
light.castShadow = true
light.shadow.bias = -0.01
light.shadow.mapSize.width = 2048
light.shadow.mapSize.height = 2048
light.shadow.camera.near = 1.0
light.shadow.camera.far = 500
light.shadow.camera.left = 200
light.shadow.camera.right = -200
light.shadow.camera.top = 200
light.shadow.camera.bottom = -200
scene.add(light)

light = new THREE.AmbientLight(0x404040)
scene.add(light)

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas: canvas })
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0, 0)
// controls.update()

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

const play = function () {

	requestAnimationFrame( play )

	renderer.render( scene, camera )

    // required if controls.enableDamping or controls.autoRotate are set to true
	controls.update();

}

play();