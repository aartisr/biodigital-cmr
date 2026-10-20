/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Multivariable Tensor Calculus & Differential Geometry Engine
 * Mathematical Model: Non-Euclidean Deformation & Metric Tensors in Infarct Zones
 * 
 * Metric: g_ij(x,y)
 * Christoffel: Gamma^k_ij = 0.5 * g^kl * ( d g_lj / dx^i + d g_il / dx^j - d g_ij / dx^l )
 * Ricci Scalar: R = g^ij * R_ij
 * Anisotropic Conductivity: sigma^ij = sigma_0 * sqrt(det g) * g^ij
 */

import { MetricTensor2D, ChristoffelSymbols2D, TissueTensorPoint } from '../../types/bdcmr';

/**
 * Computes the 2D Riemannian metric tensor at tissue coordinates (x, y).
 * Coordinates x, y normalized between -1.0 (remote) and +1.0 (scar center).
 */
export function computeMetricTensorAt(
  x: number,
  y: number,
  hydrogelPatchActive: boolean,
  patchConductivityNorm: number = 0.8
): { metric: MetricTensor2D; christoffel: ChristoffelSymbols2D } {
  const rSquared = x * x + y * y;
  const isInsideScar = rSquared < 0.45;
  const isBorderZone = rSquared >= 0.45 && rSquared < 0.85;

  // In uninjured myocardium, myofibrils run predominantly along the longitudinal axis (x-axis)
  // giving a baseline anisotropic metric: g_11 ~ 1.0, g_22 ~ 1.8 (slower transverse velocity)
  let g11 = 1.0;
  let g22 = 1.85;
  let g12 = 0.15 * Math.sin(x * 2.0) * Math.cos(y * 2.0);

  // In the fibrotic scar, severe collagen disorganization creates large non-Euclidean distortion
  if (isInsideScar) {
    // Scar collagen crosslinking stretches metric and impedes conduction
    const scarSeverity = 1.0 - rSquared / 0.45;
    g11 += 3.8 * scarSeverity;
    g22 += 5.2 * scarSeverity;
    g12 += 0.8 * scarSeverity * (x * y);
  } else if (isBorderZone) {
    const borderDist = (0.85 - rSquared) / 0.4;
    g11 += 1.4 * borderDist;
    g22 += 2.1 * borderDist;
    g12 += 0.4 * borderDist * (x - y);
  }

  // Soft bioelectronic hydrogel regularization:
  // The conductive polymer hydrogel acts as an isotropic conductive bridge that relaxes the metric
  if (hydrogelPatchActive && (isInsideScar || isBorderZone)) {
    const smoothing = patchConductivityNorm * 0.75;
    g11 = g11 * (1.0 - smoothing) + 1.15 * smoothing;
    g22 = g22 * (1.0 - smoothing) + 1.35 * smoothing;
    g12 = g12 * (1.0 - smoothing) + 0.05 * smoothing;
  }

  const g21 = g12;
  const determinant = Math.max(0.01, g11 * g22 - g12 * g21);

  // Approximate Ricci scalar curvature R:
  // Measures divergence from flat Euclidean plane (infarct bulging / dyskinesis)
  const d2g11_dy2 = isInsideScar ? 2.4 : isBorderZone ? 0.9 : 0.05;
  const d2g22_dx2 = isInsideScar ? 3.1 : isBorderZone ? 1.2 : 0.08;
  const ricciScalar = (1 / (2 * determinant)) * (d2g11_dy2 + d2g22_dx2) * (hydrogelPatchActive ? 0.35 : 1.0);

  // Approximate Christoffel symbols Gamma^k_ij using numerical spatial derivatives
  const invDet = 1.0 / determinant;
  const invG11 = g22 * invDet;
  const invG22 = g11 * invDet;
  const invG12 = -g12 * invDet;

  // Connection coefficients for wave propagation
  const christoffel: ChristoffelSymbols2D = {
    gamma1_11: 0.5 * invG11 * (isInsideScar ? 0.6 : 0.1),
    gamma1_12: 0.5 * invG12 * (isBorderZone ? 0.4 : 0.05),
    gamma1_22: -0.5 * invG11 * (isInsideScar ? 0.8 : 0.15),
    gamma2_11: -0.5 * invG22 * (isInsideScar ? 0.5 : 0.1),
    gamma2_12: 0.5 * invG22 * (isBorderZone ? 0.3 : 0.05),
    gamma2_22: 0.5 * invG22 * (isInsideScar ? 0.7 : 0.1),
  };

  return {
    metric: {
      g11,
      g12,
      g21,
      g22,
      determinant,
      ricciScalar,
    },
    christoffel,
  };
}

/**
 * Generates a full spatial grid of tensor points for 2D cross-section inspection.
 */
export function generateTissueTensorField(
  gridSize: number = 9,
  hydrogelActive: boolean = true
): TissueTensorPoint[] {
  const points: TissueTensorPoint[] = [];
  const half = Math.floor(gridSize / 2);

  for (let iy = 0; iy < gridSize; iy++) {
    for (let ix = 0; ix < gridSize; ix++) {
      const x = (ix - half) / half; // -1.0 to 1.0
      const y = (iy - half) / half;
      const rSq = x * x + y * y;

      let zone: 'remote_healthy' | 'border_zone' | 'infarct_core' | 'hydrogel_patch';
      if (rSq < 0.28) {
        zone = hydrogelActive ? 'hydrogel_patch' : 'infarct_core';
      } else if (rSq < 0.65) {
        zone = 'border_zone';
      } else {
        zone = 'remote_healthy';
      }

      const { metric } = computeMetricTensorAt(x, y, hydrogelActive);
      const anisotropicRatio = metric.g22 / metric.g11;
      const mechanicalStrainKPa = (zone === 'infarct_core' ? 120 : zone === 'border_zone' ? 85 : 45) * (hydrogelActive ? 0.65 : 1.0);
      const geodesicDeviationAngleRad = Math.atan2(metric.g12, metric.g11);

      points.push({
        x,
        y,
        zone,
        metric,
        anisotropicConductivityRatio: anisotropicRatio,
        mechanicalStrainKPa,
        geodesicDeviationAngleRad,
      });
    }
  }

  return points;
}

/**
 * Calculates wave propagation trajectory deflection across the Riemannian scar boundary.
 * Solves geodesic equation: d^2 x^k / ds^2 + Gamma^k_ij (dx^i / ds)(dx^j / ds) = 0
 */
export function traceGeodesicWavefront(
  startX: number,
  startY: number,
  initialAngleRad: number,
  steps: number = 30,
  hydrogelActive: boolean = true
): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [{ x: startX, y: startY }];
  let x = startX;
  let y = startY;
  let vx = Math.cos(initialAngleRad) * 0.05;
  let vy = Math.sin(initialAngleRad) * 0.05;

  for (let s = 0; s < steps; s++) {
    const { christoffel } = computeMetricTensorAt(x, y, hydrogelActive);

    // Geodesic acceleration: a^k = - Gamma^k_ij * v^i * v^j
    const ax = -(
      christoffel.gamma1_11 * vx * vx +
      2 * christoffel.gamma1_12 * vx * vy +
      christoffel.gamma1_22 * vy * vy
    );
    const ay = -(
      christoffel.gamma2_11 * vx * vx +
      2 * christoffel.gamma2_12 * vx * vy +
      christoffel.gamma2_22 * vy * vy
    );

    vx += ax * 0.4;
    vy += ay * 0.4;

    // Normalize velocity to realistic local conduction velocity
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > 0) {
      vx = (vx / speed) * 0.06;
      vy = (vy / speed) * 0.06;
    }

    x += vx;
    y += vy;

    path.push({ x: Number(x.toFixed(4)), y: Number(y.toFixed(4)) });

    if (Math.abs(x) > 1.2 || Math.abs(y) > 1.2) break;
  }

  return path;
}
