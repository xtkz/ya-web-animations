// import * as dat from 'lil-gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

import stationVertexShader from './shaders/station/vertex.glsl'
import stationFragmentShader from './shaders/station/fragment.glsl'

import soundVertexShader from   './shaders/sound/vertex.glsl'
import soundFragmentShader from './shaders/sound/fragment2.glsl'

let isThreeFullyLoaded = false

/**
 * Base
 */
// Debug
// const gui = new dat.GUI({
// 	width: 800,
// })

// Canvas
const canvas_start = document.querySelector('canvas.webgl_start')

// Scene
const scene_start = new THREE.Scene()
scene_start.name = "Scene Start"


/**
 * Loaders
 */
const headlineImage = document.querySelector('img.headline-img');
const progressBar = document.querySelector('progress.top__progress');

const loadingManager = new THREE.LoadingManager(
	// Loaded
	() =>
	{
		console.log('loaded')
		isThreeFullyLoaded = true
		headlineImage.classList.add('visibility-hidden')
		progressBar.classList.add('visibility-hidden')
	},

	// Progress
	(itemUrl, itemsLoaded, itemsTotal) =>
	{
		progressBar.value = itemsLoaded;
		progressBar.max = itemsTotal;
		headlineImage.classList.add('remove-animation')
		const progressRatio = itemsLoaded / itemsTotal
		console.log(progressRatio)
	},
)

// Texture loader
const textureLoader = new THREE.TextureLoader(loadingManager)

// Draco loader
const dracoLoader = new DRACOLoader(loadingManager)

// GLTF loader
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)
dracoLoader.setDecoderPath('/draco/')

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
	'/textures/environmentMaps/4/px-q.png',
	'/textures/environmentMaps/4/nx-q.png',
	'/textures/environmentMaps/4/py-q.png',
	'/textures/environmentMaps/4/ny-q.png',
	'/textures/environmentMaps/4/pz-q.png',
	'/textures/environmentMaps/4/nz-q.png'
])

/**
 * Object
 */
const stationGroup = new THREE.Group()
scene_start.add(stationGroup)

const stationShadow = textureLoader.load('/textures/station/station_shadow.png')
const shadowPlane = new THREE.Mesh(
	new THREE.PlaneGeometry(0.5, 0.5,),
	new THREE.MeshBasicMaterial( {color: '#000000', alphaMap: stationShadow, transparent: true,} )
)
shadowPlane.rotateX(-Math.PI/2)
shadowPlane.position.set(0,-0.002,0)
stationGroup.add(shadowPlane)


/**
 * Textures
 */
const stationBodyTex = textureLoader.load('/textures/station/station_textile.jpg')
const stationBodyNorms = textureLoader.load('/textures/station/station_textile_normals.jpg')
const stationTop = textureLoader.load('/textures/station/station_top_color.png')
const stationTopAlpha = textureLoader.load('/textures/station/station_top_alpha.png')
stationTop.flipY = false
stationTopAlpha.flipY = false
stationTop.generateMipmaps = false
stationTop.minFilter = THREE.NearestFilter
stationTopAlpha.generateMipmaps = false
stationTopAlpha.minFilter = THREE.NearestFilter

/**
 * Materials
 */
const YSTopEffectMaterial = new THREE.ShaderMaterial({
	vertexShader: stationVertexShader,
	fragmentShader: stationFragmentShader,
	uniforms: {
			uTime: { value: 0 },
			uIntensity: {value: 0},
		}
})

const YSBodyMaterial = new THREE.MeshStandardMaterial({
	map: stationBodyTex,
	normalMap: stationBodyNorms,
})

const YSTopSideMaterial = new THREE.MeshPhysicalMaterial({
	color: '#111111',
	metalness: 0.1,
	roughness: 1,
	clearcoat: 1,
	clearcoatRoughness: 0.2,
	side: THREE.DoubleSide,
	// side: THREE.FrontSide,
})

const YSTopCoverMaterial = new THREE.MeshPhysicalMaterial({
	color: '#000000',
	transparent: true,
	roughness: 1,
	clearcoat: .3,
	clearcoatRoughness: 0.5,
	blending: THREE.AdditiveBlending,
})

const YSTopPlateMaterial = new THREE.MeshStandardMaterial({
	color: '#ffffff',
	map: stationTop,
	alphaMap: stationTopAlpha,
	transparent: true,
	roughness: 1,
})

/**
 * Models
 */
gltfLoader.load(
	'/station4.glb',
	(gltf) => {
		gltf.scene.traverse((child) => {
			switch (child.name) {
				case 'YSBody':
					child.material = YSBodyMaterial;
					break;
				case 'YSTopSide':
					child.material = YSTopSideMaterial;
					break;
				case 'YSTopCover':
					child.material = YSTopCoverMaterial
					break;
				case 'YSTopPlate':
					child.material = YSTopPlateMaterial
					break;
				case 'YSTopEffect':
					child.material = YSTopEffectMaterial;
					break;
			}

			if(child instanceof THREE.Mesh) {
				child.material.envMap = environmentMap
				child.material.envMapIntensity = 2
			}
		})
		stationGroup.add(gltf.scene)
	}
)


// scene_start.add(new THREE.AxesHelper(1))

/**
 * Lights
 */
const ambLight = new THREE.AmbientLight(0xFFFFFF, 1.5);

const pointLightGlimpse = new THREE.PointLight('#fff', 2)
pointLightGlimpse.position.set(0.6, 0.5, -1.67)

const pointLightLeft = new THREE.PointLight('#fff', 1.5)
pointLightLeft.position.set(-0.3, 0.25, -0.5)

const pointLightRight = new THREE.PointLight('#fff', 1)
pointLightRight.position.set(0.43, 0.2, 0.007)

scene_start.add(
	ambLight,
	pointLightGlimpse,
	pointLightLeft,
	pointLightRight,
)

// gui.add(pointLightGlimpse.position, 'x').name('lightPosition x').min(-3).max(3).step(0.01)
// gui.add(pointLightGlimpse.position, 'y').name('lightPosition y').min(0).max(5).step(0.01)
// gui.add(pointLightGlimpse.position, 'z').name('lightPosition z').min(-3).max(3).step(0.01)

/**
 * Sizes
 */
const sizes_start = {
	width: 1180,
	height: 1440,
}

/**
 * Camera
 */
// Base camera
const aspectRatio = sizes_start.width / sizes_start.height
const camera = new THREE.PerspectiveCamera(15, aspectRatio, 0.01, 100)
camera.position.x = -0.388
camera.position.y = 0.326
camera.position.z = 0.607
// camera.zoom = 6.2
camera.zoom = 0.6
camera.updateProjectionMatrix()
scene_start.add(camera)

// Controls
const controls = new OrbitControls(camera, document.querySelector('section.top'))
controls.enableDamping = true;
controls.enableZoom = false;
controls.enablePan = true;

controls.maxAzimuthAngle = Math.PI/3;
controls.minAzimuthAngle = -Math.PI/3;
controls.maxPolarAngle = Math.PI * 4/8 - 0.01;
controls.minPolarAngle = Math.PI * 2/8;

controls.target = new THREE.Vector3(-0.001,0.118,0)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
	canvas: canvas_start,
	antialias: true,
	alpha: true,
})
renderer.setSize(sizes_start.width, sizes_start.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true;

/**
 * Scroll event
 */
const topButton = document.querySelector('.top__button');
let topButtonVisible = true

let scrollY
window.addEventListener('scroll', function ()
{
	scrollY = window.scrollY
	stationGroup.rotation.set(0,-scrollY/1440,0)
	console.log(scrollY)
	if (scrollY > 0.1 && topButtonVisible) {
		topButtonVisible = false;
		topButton.classList.add('fade-out')
	}
	if (scrollY === 0 && !topButtonVisible) {
		topButtonVisible = true;
		topButton.classList.remove('fade-out')
	}
})


/**
 * Sound scene
 */

const canvas_sound = document.querySelector('canvas.webgl_sound')

const scene_sound = new THREE.Scene()
scene_sound.name = "Scene SOUND"

/*const cube = new THREE.Mesh(
	new THREE.BoxGeometry(.1, .1, .1),
	new THREE.MeshBasicMaterial( {color: 0xff00ff} ),
)
scene_sound.add(cube)*/

// Sizes
const sizes_sound = {
	width: window.innerWidth,
	height: 1180
}

const aspectRatio_sound = sizes_sound.width / sizes_sound.height

const camera_sound = new THREE.PerspectiveCamera(75, aspectRatio_sound, 0.01, 10)
camera_sound.position.set(1,1,1)
camera_sound.lookAt(0,0,0)

// Shader
const shaderPlateMaterial = new THREE.ShaderMaterial({
	vertexShader: soundVertexShader,
	fragmentShader: soundFragmentShader,
	uniforms: {
		uTime: {value: 0},
		uPixelWidth: {value: sizes_sound.width},
	},
	transparent: true,
})

const shaderPlane = new THREE.Mesh(
	new THREE.PlaneGeometry(2, 2,),
	shaderPlateMaterial,
)
scene_sound.add(shaderPlane)

const renderer_sound = new THREE.WebGLRenderer({
	canvas: canvas_sound,
	antialias: true,
	alpha: true,
})
renderer_sound.setSize(sizes_sound.width, sizes_sound.height)
renderer_sound.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Resize event
 */

window.addEventListener('resize', () =>
{
	// Update sizes
	sizes_sound.width = window.innerWidth
	shaderPlateMaterial.uniforms.uPixelWidth.value = sizes_sound.width

	// Update camera
	camera_sound.aspect = sizes_sound.width / sizes_sound.height
	camera_sound.updateProjectionMatrix()

	// Update renderer
	renderer_sound.setSize(sizes_sound.width, sizes_sound.height)
	renderer_sound.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Observers
 * @type {boolean}
 */

let canvStartVisible = false;
let canvSoundVisible = false;

const sectionAlice = document.querySelector('section.alice')
const aliceVideo = document.querySelector('.alice__video')

const speechTitle = document.querySelector('.alice__speech span')
const speechList = document.querySelectorAll('.alice__speech-item')

const observer = new IntersectionObserver(([entry]) => {
	console.log(entry.target.className, entry.isIntersecting)
	if (entry.target.className === 'webgl_start headline-img') {
		canvStartVisible = entry.isIntersecting
	} else if (entry.target.className === 'webgl_sound') {
		canvSoundVisible = entry.isIntersecting;
		if (entry.isIntersecting) {
			explosionUnfold()
		} else {
			explosionFold()
		}
	}
	else if (entry.target.className === 'alice') {
		if (entry.isIntersecting) {
			aliceVideo.play()
			speechTitle.classList.remove('speech_hidden')
			speechList.forEach((item) => {
				item.classList.remove('speech_hidden')
			})
		} else {
			speechTitle.classList.add('speech_hidden')
			speechList.forEach((item) => {
				item.classList.add('speech_hidden')
			})
		}
	}
})

observer.observe(canvas_start)
observer.observe(canvas_sound)
observer.observe(sectionAlice)

/**
 * Animate ALL
 */
const clock = new THREE.Clock()

let loadTime = 0

const tick = () =>
{
	const elapsedTime = clock.getElapsedTime()

	// Update material
	canvStartVisible && (YSTopEffectMaterial.uniforms.uTime.value = elapsedTime)
	canvSoundVisible && (shaderPlateMaterial.uniforms.uTime.value = elapsedTime)


	// Update controls
	controls.update()

	if (isThreeFullyLoaded) {
		if (loadTime === 0) {
			loadTime = elapsedTime
		} else if (YSTopEffectMaterial.uniforms.uIntensity.value < 1) {
			YSTopEffectMaterial.uniforms.uIntensity.value = Math.pow((elapsedTime - loadTime) / 3, 2);
			pointLightGlimpse.position.x = 0.6 + (elapsedTime - loadTime) / 2;
			console.log(pointLightGlimpse.position)
		}
	}

	// Render
	if (isThreeFullyLoaded && canvStartVisible) {
		renderer.render(scene_start, camera)
	}

	if (isThreeFullyLoaded && canvSoundVisible) {
		renderer_sound.render(scene_sound, camera_sound)
	}

	// Call tick again on the next frame
	window.requestAnimationFrame(tick)
}

tick()


const xploParts = document.querySelectorAll('img.sound__kv')
const xploImg = document.querySelector('img.kv-all')
function explosionUnfold() {
	xploParts.forEach((item) => {
		item.classList.remove('kv-folded');
		item.classList.add('kv-unfolded');
	})
}
function explosionFold() {
	xploImg.classList.remove('visible')
	xploParts.forEach((item) => {
		item.classList.add('kv-folded');
	})
}

xploParts[1].addEventListener('transitionend', () => {
	if (xploParts[1].classList.contains('kv-unfolded')) {
		xploParts.forEach((item) => {
			item.classList.remove('kv-unfolded');
		})
		xploImg.classList.add('visible')
	}
})