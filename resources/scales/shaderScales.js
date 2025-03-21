import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.135.0/build/three.module.js';

const YellowGlitterShader = {
  uniforms: {
    'tDiffuse': { value: null },
    'time': { value: 0.0 },
    'resolution': { value: new THREE.Vector2() },
    'glitterIntensity': { value: 0.5 },
    'targetColor': { value: new THREE.Vector3(1.0, 1.0, 0.0) }, // Target yellow color
    'colorTolerance': { value: new THREE.Vector3(0.1, 0.1, 0.1) }, // Tolerance for matching color
    'intensityThreshold': { value: 0.5 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float time;
    uniform vec2 resolution;
    uniform sampler2D tDiffuse;
    uniform float glitterIntensity;
    uniform vec3 targetColor;
    uniform vec3 colorTolerance;
    uniform float intensityThreshold;
    varying vec2 vUv;

    void main() {
      vec2 uv = vUv;
      vec4 color = texture2D(tDiffuse, uv);

      // Check for the specified color range
      float matchColor = step(abs(color.r - targetColor.r), colorTolerance.r) *
                         step(abs(color.g - targetColor.g), colorTolerance.g) *
                         step(abs(color.b - targetColor.b), colorTolerance.b) *
                         step(intensityThreshold, dot(color.rgb, vec3(0.299, 0.587, 0.114)));

      // Apply glitter effect
      float glitter = matchColor * fract(sin(dot(uv * resolution.xy + time, vec2(12.9898, 78.233))) * 43758.5453);
      glitter = smoothstep(0.8, 1.0, glitter);

      color.rgb += glitter * glitterIntensity;

      gl_FragColor = color;
    }
  `,
  init: function (glitterIntensity, targetColor, colorTolerance, intensityThreshold) {
    this.uniforms['glitterIntensity'].value = glitterIntensity;
    this.uniforms['targetColor'].value = targetColor;
    this.uniforms['colorTolerance'].value = colorTolerance;
    this.uniforms['intensityThreshold'].value = intensityThreshold;
  },
  updateTime: function (deltaTime) {
    this.uniforms['time'].value += deltaTime;
  }
};

export default YellowGlitterShader;
