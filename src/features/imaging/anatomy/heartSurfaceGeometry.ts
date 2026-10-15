import * as THREE from 'three';

export const DEFAULT_HEART_SURFACE_PARAMETERS = {
  lveddMm: 52,
  septalThicknessMm: 11.2,
  sphericity: 0.62,
  longitudinalSegments: 56,
  circumferentialSegments: 56,
} as const;

export function getAnatomicalHeartPoint(
  uNorm: number,
  vNorm: number,
  radialOffset: number = 0,
  scaleFactor: number = 1,
  septalThickness: number = DEFAULT_HEART_SURFACE_PARAMETERS.septalThicknessMm,
  sphericity: number = DEFAULT_HEART_SURFACE_PARAMETERS.sphericity,
): THREE.Vector3 {
  const theta = uNorm * Math.PI * 2;
  const baseRadius = 4.6 * scaleFactor * (1 + sphericity * 0.10);
  const totalHeight = 12.0;
  const basalFullness = 0.78 + 0.34 * Math.sin(Math.min(vNorm, 0.82) / 0.82 * Math.PI * 0.5);
  const apicalTaper = 1 - Math.pow(vNorm, 2.35);
  let effectiveRadius = baseRadius * basalFullness * apicalTaper + radialOffset;

  let shapeFactor = 1.0;
  if (theta > 0.15 && theta < 2.3) {
    shapeFactor += 0.22 * Math.sin((theta - 0.15) / 2.15 * Math.PI);
  }
  const ladDifference = Math.abs(theta - 0.82);
  if (ladDifference < 0.4) {
    shapeFactor -= 0.07 * Math.cos((ladDifference / 0.4) * (Math.PI / 2));
  }
  if (theta > 3.1 && theta < 5.7) {
    shapeFactor += (septalThickness / 11.2 - 1.0) * 0.10 + 0.10;
  }

  effectiveRadius *= shapeFactor;
  const apexProgress = Math.pow(vNorm, 1.7);

  return new THREE.Vector3(
    Math.cos(theta) * effectiveRadius - 0.70 * apexProgress,
    3.0 - vNorm * totalHeight,
    Math.sin(theta) * effectiveRadius + 0.85 * apexProgress,
  );
}

export function createSculptedCardiacGeometry(
  lvedd: number,
  septalThickness: number,
  sphericity: number,
): THREE.BufferGeometry {
  const uSegments = DEFAULT_HEART_SURFACE_PARAMETERS.circumferentialSegments;
  const vSegments = DEFAULT_HEART_SURFACE_PARAMETERS.longitudinalSegments;
  const positions: number[] = [];
  const textureCoordinates: number[] = [];
  const indices: number[] = [];
  const scaleFactor = lvedd / DEFAULT_HEART_SURFACE_PARAMETERS.lveddMm;

  for (let row = 0; row <= vSegments; row += 1) {
    const vNorm = row / vSegments;
    for (let column = 0; column <= uSegments; column += 1) {
      const uNorm = column / uSegments;
      const point = getAnatomicalHeartPoint(uNorm, vNorm, 0, scaleFactor, septalThickness, sphericity);
      positions.push(point.x, point.y, point.z);
      textureCoordinates.push(uNorm, vNorm);
    }
  }

  const baseCenterIndex = positions.length / 3;
  positions.push(-0.1, 3.05, 0.15);
  textureCoordinates.push(0.5, 0);

  for (let row = 0; row < vSegments; row += 1) {
    for (let column = 0; column < uSegments; column += 1) {
      const topLeft = row * (uSegments + 1) + column;
      const bottomLeft = (row + 1) * (uSegments + 1) + column;
      const bottomRight = (row + 1) * (uSegments + 1) + column + 1;
      const topRight = row * (uSegments + 1) + column + 1;
      indices.push(topLeft, bottomLeft, topRight, bottomLeft, bottomRight, topRight);
    }
  }

  for (let column = 0; column < uSegments; column += 1) {
    indices.push(baseCenterIndex, column + 1, column);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(textureCoordinates, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}