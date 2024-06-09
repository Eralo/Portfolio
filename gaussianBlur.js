// GaussianBlurShader.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.126.1/build/three.module.js';

export const GaussianBlurShader = {

    uniforms: {
        'tDiffuse': { value: null },
        'resolution': { value: new THREE.Vector2() },
        'direction': { value: new THREE.Vector2(1, 0) },
        'size': { value: 5.0 }
    },

    vertexShader: `
        attribute float type;
        attribute float size;
        attribute float phase;
        attribute float increment;

        uniform float time;
        uniform vec2 resolution;
        uniform sampler2D textureA;
        uniform sampler2D textureB;

        varying float t;

        void main() {

            t = type;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );

            if(t == 0.) { 
                gl_PointSize = size * 0.8;
            } else {
                gl_PointSize = size * sin(phase + time * increment) * 12.;
            }
            gl_Position = projectionMatrix * mvPosition;
        }
    `,

    fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform sampler2D textureA;
        uniform sampler2D textureB;
        varying float t;

        uniform sampler2D texture;

        vec4 blur2D(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {

            vec4 color = vec4(0.0);
            vec2 off1 = vec2(1.3846153846) * direction;
            vec2 off2 = vec2(3.2307692308) * direction;
            color += texture2D(image, uv) * 0.2270270270;
            color += texture2D(image, uv + (off1 / resolution)) * 0.3162162162;
            color += texture2D(image, uv - (off1 / resolution)) * 0.3162162162;
            color += texture2D(image, uv + (off2 / resolution)) * 0.0702702703;
            color += texture2D(image, uv - (off2 / resolution)) * 0.0702702703;
            return color;
        }

        void main() {

            vec2 direction = vec2(1., 0.);
            vec2 uv = vec2(gl_FragCoord.xy / resolution.xy);

            gl_FragColor = vec4(vec3(1.0, 1.0, 1.0), 1.);

            if(t == 0.){
                gl_FragColor = gl_FragColor * texture2D(textureA, gl_PointCoord);
            } else {
                gl_FragColor = gl_FragColor * texture2D(textureB, gl_PointCoord);
            }
            gl_FragColor = blur2D(texture, uv, resolution.xy, direction);
        }
    `
};
