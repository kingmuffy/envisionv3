// FresnelMaterial.js
import { shaderMaterial } from "@react-three/drei";
import { Color } from "three";
import { extend } from "@react-three/fiber";

const FresnelMaterial = shaderMaterial(
  {
    uFresnelColor: new Color(1, 0, 0), // default fresnel color
    uBaseColor: new Color(0.1, 0.1, 0.1), // default base color to avoid white-out
    uFresnelAmount: 1.5, // fresnel intensity
    uFresnelOffset: 0.05, // fresnel offset
    uFresnelIntensity: 1.5, // intensity multiplier
    uAlpha: 1.0, // alpha for blending
  },
  /* vertexShader */ `
    varying vec3 vViewDir;
    varying vec3 vNormal;

    void main() {
      vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
      vViewDir = -viewPosition.xyz;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * viewPosition;
    }
  `,
  /* fragmentShader */ `
    uniform vec3 uFresnelColor;
    uniform vec3 uBaseColor;
    uniform float uFresnelAmount;
    uniform float uFresnelOffset;
    uniform float uFresnelIntensity;
    uniform float uAlpha;

    varying vec3 vViewDir;
    varying vec3 vNormal;

    void main() {
      float fresnel = uFresnelOffset + (1.0 - uFresnelOffset) * pow(1.0 - dot(normalize(vNormal), normalize(vViewDir)), uFresnelAmount);
      vec3 color = mix(uBaseColor, uFresnelColor, fresnel * uFresnelIntensity);
      gl_FragColor = vec4(color, uAlpha);
    }
  `
);

extend({ FresnelMaterial }); // Register it as a custom component

export default FresnelMaterial;
