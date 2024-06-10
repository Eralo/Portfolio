import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.135.0/build/three.module.js';
import { EffectComposer } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/postprocessing/ShaderPass.js';
import { HorizontalBlurShader } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/shaders/VerticalBlurShader.js';
import { BrightnessContrastShader} from 'https://cdn.jsdelivr.net/npm/three@0.135.0/examples/jsm/shaders/BrightnessContrastShader.js';

let scene, camera, renderer, composer;
let cube, spotLight, backLight, backLight2;
let mouse = { x: 0, y: 0 };

const radius = 3; // Define the radius for the light orbit
const lerpFactor = 0.07; // Adjust this factor to control the lerping speed of light and cube

const textureRepeatX = 10; // Number of texture repetitions along X axis
const textureRepeatY = 10; // Number of texture repetitions along Y axis

const spotHeight = .2; //yellow spotlight height

const backLightPos = { x: -10, y: -3, z: 7 }
const backLight2Pos = { x: 2, y: 2, z: 3 }


let targetCubePosition = { x: 0, y: 0 };
let currentCubePosition = { x: 0, y: 0 };

let targetLightPosition = { x: 0, y: 0 };
let currentLightPosition = { x: 10, y: 10 };

// Load textures
const textureLoader = new THREE.TextureLoader();
const albedo = textureLoader.load('scales/albedo.png');
const roughness = textureLoader.load('scales/roughness.png');
const normal = textureLoader.load('scales/normal.png');
const displacement = textureLoader.load('scales/displacement.png');

// Scale material
const material = new THREE.MeshStandardMaterial({
	map: albedo,
	roughnessMap: roughness,
	normalMap: normal,
	displacementMap: displacement,
	displacementScale: 0.1,
	metalness: .3,
});

// texture repeat and wrapping (is responsive !)
albedo.wrapS = THREE.RepeatWrapping;
albedo.wrapT = THREE.RepeatWrapping;
roughness.wrapS = THREE.RepeatWrapping;
roughness.wrapT = THREE.RepeatWrapping;
normal.wrapS = THREE.RepeatWrapping;
normal.wrapT = THREE.RepeatWrapping;
displacement.wrapS = THREE.RepeatWrapping;
displacement.wrapT = THREE.RepeatWrapping;

albedo.repeat.set(textureRepeatX, textureRepeatY);
roughness.repeat.set(textureRepeatX, textureRepeatY);
normal.repeat.set(textureRepeatX, textureRepeatY);
displacement.repeat.set(textureRepeatX, textureRepeatY);

function init() {

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

	//better colors
	renderer.toneMapping = THREE.CineonToneMapping;
	renderer.toneMappingExposure = 0.5;
	renderer.outputColorSpace = THREE.SRGBColorSpace;

	// Post-processing composer 
	// pipeline : (render -> bloom -> brightness and contrast -> blur)
	composer = new EffectComposer(renderer);

	//scene
	const renderScene = new RenderPass(scene, camera);
		composer.addPass(renderScene);
	//bloom (if pixel luminosity is higher than given value, saturates and glow)
	const bloomPass = 
		new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.7, 0.1);
		composer.addPass(bloomPass);
	//tweaks brightness and constrast
	const brightnessContrastPass = new ShaderPass(BrightnessContrastShader);
		brightnessContrastPass.uniforms['brightness'].value = .05;
		brightnessContrastPass.uniforms['contrast'].value = .2;
		composer.addPass(brightnessContrastPass);
	//horizontal and vertical blur (not gaussian, don't overdo). If not equal, looks terrible
	const hblur = new ShaderPass(HorizontalBlurShader);
		hblur.uniforms['h'].value = .5 / window.innerWidth;
		composer.addPass(hblur);
	const vblur = new ShaderPass(VerticalBlurShader);
		vblur.uniforms['v'].value = .5 / window.innerHeight;
		composer.addPass(vblur);

	//Cube
	let geometry = new THREE.BoxGeometry(1, 1, 1);
	cube = new THREE.Mesh(geometry, material);
	scene.add(cube);

	//Lights setup
	backLight = new THREE.SpotLight(0x3a6ca7, 1);
	backLight.position.set(backLightPos.x, backLightPos.y, backLightPos.z);	
	backLight.angle = 150 * (Math.PI / 180);
	backLight.penumbra = 0.1;
	backLight.decay = 10; 
	backLight.distance = 100;
	scene.add(backLight);
	backLight.target = cube;

	backLight2 = new THREE.PointLight(0x3a6ca7, 2);
	backLight2.position.set(backLight2Pos.x, backLight2Pos.y, backLight2Pos.z);
	scene.add(backLight2);
	backLight2.target = cube;

	spotLight = new THREE.SpotLight(0xE6991E, 10); //Bright yellow spot orbiting
	spotLight.position.set(2, 2, spotHeight);
	spotLight.angle = 150 * (Math.PI / 180);
	spotLight.penumbra = .1;
	spotLight.decay = 10;
	spotLight.distance = 10; 
	scene.add(spotLight);
	spotLight.target = cube;


	// Event listeners
	window.addEventListener('resize', onWindowResize, false);
	document.addEventListener('mousemove', onMouseMove, false);


	animate();
	updateSize();  // Initial size
}

function updateSize() {
	const scaleX = (window.innerWidth / 500) * textureRepeatX;
	const scaleY = (window.innerHeight / 500) * textureRepeatY;

	// Update cube size based on window size    
	cube.scale.set(scaleX, scaleY, 1);

	// Adjust texture repeat based on new size
	albedo.repeat.set(scaleX, scaleY);
	roughness.repeat.set(scaleX, scaleY);
	normal.repeat.set(scaleX, scaleY);
	displacement.repeat.set(scaleX, scaleY);

	backLight.position.set(window.innerWidth/500 + backLightPos.x, window.innerHeight/500 + backLightPos.y, backLightPos.z);	
	backLight2.position.set(window.innerWidth/500 + backLight2Pos.x, window.innerHeight/500 + backLight2Pos.y, backLight2Pos.z);	
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
	updateSize();  // Update elements size on window resize
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
    spotLight.position.z = spotHeight;
	// Render scene with post-process
	composer.render();
}


init();
