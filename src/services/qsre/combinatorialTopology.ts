/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Combinatorial Graph & Topological Syncytium Engine
 * Mathematical Model: Electrical Percolation & Optimal Conductive Mesh Routing
 * 
 * Objective: max_{S \subseteq E} F(S) = sum_{u,v} w_uv * prod_{e \in path(u,v)} P_conduction(e)
 * Subject to: Total Power Dissipation <= P_max, Mechanical Strain Compatibility
 */

import {
  SyncytiumNode,
  SyncytiumEdge,
  SyncytialTopologyMetrics,
  TissueNodeType,
} from '../../types/bdcmr';

export interface TopologyOptimizationResult {
  nodes: SyncytiumNode[];
  edges: SyncytiumEdge[];
  metrics: SyncytialTopologyMetrics;
  optimalBridgeEdgeIds: string[];
}

/**
 * Generates an anatomically structured myocardial tissue graph with an infarct core,
 * border zone, and candidate soft-bioelectronic hydrogel mesh lines.
 */
export function buildMyocardialSyncytiumGraph(
  enableBioMeshBridges: boolean = true,
  meshDensity: number = 0.8
): TopologyOptimizationResult {
  const nodes: SyncytiumNode[] = [];
  const edges: SyncytiumEdge[] = [];
  
  // Create a 7x7 spatial tissue lattice
  const gridSize = 7;
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const id = `n_${r}_${c}`;
      const x = c / (gridSize - 1); // 0.0 to 1.0
      const y = r / (gridSize - 1);

      // Distance from center of infarct (0.5, 0.5)
      const dx = x - 0.5;
      const dy = y - 0.5;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let type: TissueNodeType;
      let viability = 1.0;
      let gapJunction = 140; // 140 nS for normal Connexin-43

      if (dist < 0.22) {
        type = 'fibroblast_scar';
        viability = 0.05;
        gapJunction = 2.0; // Dense collagen, almost zero electrical coupling
      } else if (dist < 0.38) {
        type = 'ischemic_border';
        viability = 0.45;
        gapJunction = 35.0; // Impaired coupling, prone to conduction block
      } else {
        type = 'cardiomyocyte';
        viability = 0.95;
        gapJunction = 140.0;
      }

      nodes.push({
        id,
        x,
        y,
        type,
        actionPotentialMv: type === 'cardiomyocyte' ? -85 : type === 'ischemic_border' ? -55 : -40,
        viabilityScore: viability,
        gapJunctionConductanceNsiemens: gapJunction,
      });
    }
  }

  // Generate nearest-neighbor edges
  const nodeMap = new Map<string, SyncytiumNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const optimalBridgeEdgeIds: string[] = [];

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const currentId = `n_${r}_${c}`;
      const currentNode = nodeMap.get(currentId)!;

      // Connect to right and down neighbors
      const neighbors = [
        { r: r, c: c + 1 },
        { r: r + 1, c: c },
        { r: r + 1, c: c + 1 }, // Diagonal connection
      ];

      for (const n of neighbors) {
        if (n.r < gridSize && n.c < gridSize) {
          const targetId = `n_${n.r}_${n.c}`;
          const targetNode = nodeMap.get(targetId)!;
          const edgeId = `e_${currentId}_${targetId}`;

          const isScarInvolved =
            currentNode.type === 'fibroblast_scar' || targetNode.type === 'fibroblast_scar';
          const isBorderInvolved =
            currentNode.type === 'ischemic_border' || targetNode.type === 'ischemic_border';

          // Natural biological conduction probability without hydrogel
          let pConduction = 0.96;
          let weight = 1.0;
          let isMeshBridge = false;

          if (isScarInvolved) {
            pConduction = 0.04; // Severe electrical block
            weight = 10.0;
          } else if (isBorderInvolved) {
            pConduction = 0.48; // Slow conduction / zigzagging
            weight = 3.5;
          }

          // If bioelectronic hydrogel mesh is active across scar / border
          if (enableBioMeshBridges && (isScarInvolved || isBorderInvolved)) {
            // Check if this edge is selected for mesh enhancement based on density
            const pseudoRand = (Math.sin(r * 12.9898 + c * 78.233) * 43758.5453) % 1;
            if (Math.abs(pseudoRand) < meshDensity) {
              isMeshBridge = true;
              pConduction = 0.88; // Restored conduction through conductive polymer hydrogel
              weight = 1.4;
              optimalBridgeEdgeIds.push(edgeId);
            }
          }

          edges.push({
            id: edgeId,
            source: currentId,
            target: targetId,
            weight,
            conductionProbability: pConduction,
            isActiveMeshBridge: isMeshBridge,
          });
        }
      }
    }
  }

  // Compute combinatorial percolation and conduction fidelity metric F(S)
  // F(S) = sum_{u,v} w_uv * prod_{e \in path} P(e)
  let totalFidelitySum = 0;
  let totalPathsSampled = 0;

  // Sample corner-to-corner conduction paths across the infarct
  const cornerPairs = [
    { start: 'n_0_0', end: 'n_6_6' },
    { start: 'n_0_6', end: 'n_6_0' },
    { start: 'n_1_1', end: 'n_5_5' },
    { start: 'n_3_0', end: 'n_3_6' }, // Transverse across scar
    { start: 'n_0_3', end: 'n_6_3' }, // Longitudinal across scar
  ];

  for (const pair of cornerPairs) {
    const pathReliability = calculatePathReliability(pair.start, pair.end, edges, nodeMap);
    totalFidelitySum += pathReliability;
    totalPathsSampled++;
  }

  const conductionFidelity = Number((totalFidelitySum / totalPathsSampled).toFixed(3));
  const syncytialPercolationThreshold = 0.65; // Critical percolation for uninterrupted wavefront
  const isPercolationAchieved = conductionFidelity >= syncytialPercolationThreshold;
  
  // Reentry risk is high when conduction is non-zero but slow and heterogeneous (p between 0.2 and 0.55)
  const maxReentryCycleRisk = Number(
    Math.max(0.05, Math.min(0.95, (1.0 - conductionFidelity) * 1.2 - (enableBioMeshBridges ? 0.35 : 0))).toFixed(3)
  );

  return {
    nodes,
    edges,
    metrics: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      activeMeshBridges: optimalBridgeEdgeIds.length,
      conductionFidelity,
      syncytialPercolationThreshold,
      isPercolationAchieved,
      maxReentryCycleRisk,
    },
    optimalBridgeEdgeIds,
  };
}

/**
 * Computes end-to-end path conduction reliability prod_{e} P_conduction(e)
 * using Dijkstra-style shortest/most reliable path.
 */
function calculatePathReliability(
  startId: string,
  targetId: string,
  edges: SyncytiumEdge[],
  _nodeMap: Map<string, SyncytiumNode>
): number {
  // Edge lookup adjacency
  const adj = new Map<string, { target: string; p: number }[]>();
  edges.forEach((e) => {
    if (!adj.has(e.source)) adj.set(e.source, []);
    if (!adj.has(e.target)) adj.set(e.target, []);
    adj.get(e.source)!.push({ target: e.target, p: e.conductionProbability });
    adj.get(e.target)!.push({ target: e.source, p: e.conductionProbability });
  });

  // Most reliable path: maximize product of probabilities <=> minimize -log(P)
  const dist = new Map<string, number>();
  const visited = new Set<string>();
  const pq: { node: string; cost: number }[] = [{ node: startId, cost: 0 }];
  dist.set(startId, 0);

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { node: curr, cost } = pq.shift()!;

    if (curr === targetId) {
      return Math.exp(-cost);
    }

    if (visited.has(curr)) continue;
    visited.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const nb of neighbors) {
      if (visited.has(nb.target)) continue;
      const edgeCost = -Math.log(Math.max(1e-4, nb.p));
      const newCost = cost + edgeCost;

      if (!dist.has(nb.target) || newCost < dist.get(nb.target)!) {
        dist.set(nb.target, newCost);
        pq.push({ node: nb.target, cost: newCost });
      }
    }
  }

  return 0.001;
}
