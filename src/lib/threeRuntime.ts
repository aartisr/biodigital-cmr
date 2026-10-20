/**
 * Deliberately narrow Three.js surface for the cardiac visualizer.
 *
 * Importing the `three` namespace exposes its entire public API to the bundler,
 * which prevents effective tree-shaking. Keeping this explicit also makes the
 * visualizer's rendering dependencies auditable.
 */
export {
  ACESFilmicToneMapping,
  AdditiveBlending,
  AmbientLight,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Line,
  LineBasicMaterial,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Plane,
  Raycaster,
  RepeatWrapping,
  RingGeometry,
  Scene,
  SphereGeometry,
  TubeGeometry,
  Vector2,
  Vector3,
} from 'three/src/Three.Core.js';

// The WebGL renderer is intentionally imported separately: Three's package
// entry point re-exports the complete rendering surface.
export { WebGLRenderer } from 'three/src/renderers/WebGLRenderer.js';
