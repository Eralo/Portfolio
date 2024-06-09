import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.1/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/ShaderPass.js';
import { HorizontalBlurShader } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/shaders/VerticalBlurShader.js';
import { BrightnessContrastShader} from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/shaders/BrightnessContrastShader.js';
import { vertexShader, fragmentShader } from './shaderScales.js';

let scene, camera, renderer, composer;
let cube, spotLight, backLight, backLight2;
let mouse = { x: 0, y: 0 };
const radius = 3; // Define the radius for the orbit
const lerpFactor = 0.07; // Adjust this factor to control the delay speed

let targetCubePosition = { x: 0, y: 0 }; // Target positions for cube
let currentCubePosition = { x: 0, y: 0 }; // Current positions for cube

let targetLightPosition = { x: 0, y: 0 }; // Target positions for spotlight
let currentLightPosition = { x: 0, y: 0 }; // Current positions for spotlight

// Load textures
const textureLoader = new THREE.TextureLoader();
const albedo = textureLoader.load('scales/albedo.png');
const roughness = textureLoader.load('scales/roughness.png');
const normal = textureLoader.load('scales/normal.png');
const displacement = textureLoader.load('scales/displacement.png');

// Create the material with textures
const material = new THREE.MeshStandardMaterial({
	map: albedo,
	roughnessMap: roughness,
	normalMap: normal,
	displacementMap: displacement,
	displacementScale: 0.1, // Adjust the scale of the displacement map

	metalness: .3, // Set metalness to 1 to highlight reflections
	clearcoat: 1.0, // Add clearcoat for additional highlights
	clearcoatRoughness: 0.1 // Adjust clearcoat roughness
});

// Set texture wrapping and repeat
albedo.wrapS = THREE.RepeatWrapping;
albedo.wrapT = THREE.RepeatWrapping;
roughness.wrapS = THREE.RepeatWrapping;
roughness.wrapT = THREE.RepeatWrapping;
normal.wrapS = THREE.RepeatWrapping;
normal.wrapT = THREE.RepeatWrapping;
displacement.wrapS = THREE.RepeatWrapping;
displacement.wrapT = THREE.RepeatWrapping;

const repeatX = 4; // Number of repetitions along X axis
const repeatY = 4; // Number of repetitions along Y axis

albedo.repeat.set(repeatX, repeatY);
roughness.repeat.set(repeatX, repeatY);
normal.repeat.set(repeatX, repeatY);
displacement.repeat.set(repeatX, repeatY);

function init() {
	// Scene setup
	scene = new THREE.Scene();

	// Camera setup
	camera = new THREE.PerspectiveCamera(
		75, 
		window.innerWidth / window.innerHeight, 
		0.1, 
		1000
	);
	camera.position.z = 2;

	// Renderer setup
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);

	renderer.toneMapping = THREE.CineonToneMapping;
	renderer.toneMappingExposure = 0.5;
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	// Post-processing composer setup
	const renderScene = new RenderPass(scene, camera);
	composer = new EffectComposer(renderer);
	composer.addPass(renderScene);
	const bloomPass = 
		new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.7, 0.1);
	composer.addPass(bloomPass);

	const brightnessContrastPass = new ShaderPass(BrightnessContrastShader);
	brightnessContrastPass.uniforms['brightness'].value = .05; // Ajustez la luminosité (valeur entre -1 et 1)
	brightnessContrastPass.uniforms['contrast'].value = .2;   // Ajustez le contraste (valeur entre -1 et 1)
	composer.addPass(brightnessContrastPass);

	// Ajouter le shader de flou horizontal
	const hblur = new ShaderPass(HorizontalBlurShader);
	hblur.uniforms['h'].value = .5 / window.innerWidth;
	composer.addPass(hblur);

	// Ajouter le shader de flou vertical
	const vblur = new ShaderPass(VerticalBlurShader);
	vblur.uniforms['v'].value = .5 / window.innerHeight;
	composer.addPass(vblur);

	// Cube setup
	let geometry = new THREE.BoxGeometry(1, 1, 1);
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	// Light setup
	backLight = new THREE.SpotLight(0x3a6ca7, 1);
	backLight.position.set(-10, -3, 7);	
	backLight.angle = 150 * (Math.PI / 180); // Adjust the angle of the spotlight
	backLight.penumbra = 0.1; // Adjust the penumbra (edge softness)
	backLight.decay = 10; // Adjust the decay (falloff of light intensity)
	backLight.distance = 100; // Set the distance the light reaches
	scene.add(backLight);
	backLight.target = cube;

	backLight2 = new THREE.PointLight(0x3a6ca7, 2);
	backLight2.position.set(0, 0, 10);
	scene.add(backLight2);
	backLight2.target = cube;

	spotLight = new THREE.SpotLight(0xE6991E, 10); // Yellow spotlight for localized illumination
	spotLight.position.set(2, 2, .2);
	spotLight.angle = 160 * (Math.PI / 180); // Adjust the angle of the spotlight
	spotLight.penumbra = .1; // Adjust the penumbra (edge softness)
	spotLight.decay = 10; // Adjust the decay (falloff of light intensity)
	spotLight.distance = 10; // Set the distance the light reaches
	scene.add(spotLight);
	spotLight.target = cube;

	// Event listeners
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('mousemove', onMouseMove, false);

	// Start animation
	animate();
	updateSize();  // Initial size update
}

function updateSize() {
	const scaleX = (window.innerWidth / 500) * 10;
	const scaleY = (window.innerHeight / 500) * 10;
	const scaleZ = (Math.min(window.innerWidth, window.innerHeight) / 500) * 10;

	// Update cube size based on window size    
	cube.scale.set(scaleX, scaleY, 1);

	// Adjust texture repeat based on new size
	albedo.repeat.set(scaleX, scaleY);
	roughness.repeat.set(scaleX, scaleY);
	normal.repeat.set(scaleX, scaleY);
	displacement.repeat.set(scaleX, scaleY);

	backLight.position.set(window.innerWidth/500-10, window.innerHeight/500-3, 7);	
	backLight2.position.set(window.innerWidth/500+2, window.innerHeight/500+2, 3);	
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
	updateSize();  // Update cube size on window resize
}

function onMouseMove(event) {
	// Normalize mouse coordinates to range [-1, 1]
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

	// Update target positions based on mouse movement
	targetCubePosition.x = mouse.x * 0.2;
	targetCubePosition.y = mouse.y * 0.1;

    // Calculate the angle for the orbit based on mouse.x and mouse.y
    const angleX = Math.atan2(-targetCubePosition.y, -targetCubePosition.x);
    const angleY = Math.atan2(-targetCubePosition.y, -targetCubePosition.x);
    targetLightPosition.x = radius * Math.cos(angleX);
    targetLightPosition.y = radius * Math.sin(angleX);
}

function animate() {
	requestAnimationFrame(animate);

    currentCubePosition.x += (targetCubePosition.x - currentCubePosition.x) * lerpFactor;
    currentCubePosition.y += (targetCubePosition.y - currentCubePosition.y) * lerpFactor;

    cube.position.x = currentCubePosition.x;
    cube.position.y = currentCubePosition.y;

    // Lerp spotlight position
    currentLightPosition.x += (targetLightPosition.x - currentLightPosition.x) * lerpFactor;
    currentLightPosition.y += (targetLightPosition.y - currentLightPosition.y) * lerpFactor;

    spotLight.position.x = currentLightPosition.x;
    spotLight.position.y = currentLightPosition.y;
    spotLight.position.z = 0.2; // Fixed height
	// Render scene with composer
	composer.render();
}

// Initialize the scene
init();
