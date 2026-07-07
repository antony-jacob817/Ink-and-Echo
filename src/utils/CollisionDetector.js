const OBSTACLE_SEGMENTS = [
  // Path 0 segments
  [
    [30, 0, 50, 20], [50, 20, 60, 50], [60, 50, 30, 60], [30, 60, 0, 40], [0, 40, 30, 0],
    [30, 0, 30, 60], [0, 40, 30, 20], [30, 20, 60, 50], [50, 20, 30, 20]
  ],
  // Path 1 segments
  [
    [40, 5, 75, 30], [75, 30, 85, 75], [85, 75, 45, 90], [45, 90, 15, 70], [15, 70, 5, 35], [5, 35, 40, 5],
    [40, 5, 45, 90], [15, 70, 40, 35], [40, 35, 75, 30], [5, 35, 40, 35]
  ],
  // Path 2 segments
  [
    [25, 0, 50, 25], [50, 25, 40, 55], [40, 55, 10, 50], [10, 50, 0, 20], [0, 20, 25, 0],
    [25, 0, 40, 55], [0, 20, 25, 25], [25, 25, 50, 25]
  ],
  // Path 3 segments
  [
    [35, 5, 65, 25], [65, 25, 70, 65], [70, 65, 35, 75], [35, 75, 5, 50], [5, 50, 35, 5],
    [35, 5, 35, 75], [5, 50, 35, 25], [35, 25, 65, 25]
  ]
];

// Helper to calculate shortest distance from point (px, py) to line segment (x1, y1) -> (x2, y2)
function getDistanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(px - x1, py - y1);
  }

  // Projection factor t clamped between 0 and 1
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const nearestX = x1 + t * dx;
  const nearestY = y1 + t * dy;

  return Math.hypot(px - nearestX, py - nearestY);
}

export const CollisionDetector = {
  checkCircleCollision: (posA, posB, radius) => {
    return Math.hypot(posA.x - posB.x, posA.y - posB.y) < radius;
  },

  checkObstacleCollisions: (playerPos, obstacles) => {
    // 16px perfectly represents player visual model boundary
    const PLAYER_RADIUS = 16;

    for (const obs of obstacles) {
      // Early exit optimization: skip line checks if player is far from obstacle center
      const centerDist = Math.hypot(playerPos.x - obs.x, playerPos.y - obs.y);
      if (centerDist > obs.size * 0.72 + PLAYER_RADIUS + 12) {
        continue;
      }

      const segments = OBSTACLE_SEGMENTS[obs.pathIndex];
      if (!segments) continue;

      const topLeftX = obs.x - obs.size / 2;
      const topLeftY = obs.y - obs.size / 2;
      const scale = obs.size / 100;

      for (const seg of segments) {
        const sx1 = topLeftX + seg[0] * scale;
        const sy1 = topLeftY + seg[1] * scale;
        const sx2 = topLeftX + seg[2] * scale;
        const sy2 = topLeftY + seg[3] * scale;

        // Calculate closest point on segment to playerPos
        const dx = sx2 - sx1;
        const dy = sy2 - sy1;
        const lenSq = dx * dx + dy * dy;
        let nearestX = sx1;
        let nearestY = sy1;

        if (lenSq > 0) {
          let t = ((playerPos.x - sx1) * dx + (playerPos.y - sy1) * dy) / lenSq;
          t = Math.max(0, Math.min(1, t));
          nearestX = sx1 + t * dx;
          nearestY = sy1 + t * dy;
        }

        const dist = Math.hypot(playerPos.x - nearestX, playerPos.y - nearestY);
        if (dist < PLAYER_RADIUS) {
          const safeDist = dist > 0.01 ? dist : 0.01;
          const penetration = PLAYER_RADIUS - dist;
          const nx = (playerPos.x - nearestX) / safeDist;
          const ny = (playerPos.y - nearestY) / safeDist;

          return {
            obs,
            pushX: nx * penetration,
            pushY: ny * penetration,
          };
        }
      }
    }
    return null;
  },

  // Fallback visual geometry check for sonar reveal
  getVisualGeometry: (obs) => {
    // Return approximate bounding bounds for reveal logic
    return {
      x: obs.x,
      y: obs.y,
      r: obs.size * 0.45,
    };
  },

  checkSonarReveal: (pulseOrigin, pulseRadius, target, threshold = 30) => {
    const dist = Math.hypot(target.x - pulseOrigin.x, target.y - pulseOrigin.y);
    return Math.abs(dist - pulseRadius) < threshold;
  },

  checkPredatorCollision: (playerPos, enemy) => {
    const centerDist = Math.hypot(playerPos.x - enemy.x, playerPos.y - enemy.y);
    // Stalker size is 70% of 145px (~100px), plus 16px body radius. 120px is safe early exit!
    if (centerDist > 120) {
      return null;
    }

    const PLAYER_RADIUS = 16;
    
    // Exact segments of the new detailed shark/piranha wireframe (relative to 170,170 center)
    const segments = [
      // Head
      [{ x: 60, y: 0 }, { x: 40, y: -20 }],
      [{ x: 40, y: -20 }, { x: 10, y: -20 }],
      [{ x: 60, y: 0 }, { x: 40, y: -8 }], // upper jaw edge
      [{ x: 60, y: 0 }, { x: 45, y: 12 }], // lower jaw edge
      [{ x: 45, y: 12 }, { x: 10, y: 0 }],
      [{ x: 10, y: -20 }, { x: 10, y: 0 }],
      [{ x: 10, y: -20 }, { x: -15, y: -5 }],
      [{ x: 10, y: 0 }, { x: -15, y: -5 }],

      // Back / Dorsal Fin
      [{ x: 10, y: -20 }, { x: -10, y: -35 }],
      [{ x: -10, y: -35 }, { x: -35, y: -20 }],
      [{ x: -10, y: -35 }, { x: -20, y: -65 }], // dorsal fin tip
      [{ x: -20, y: -65 }, { x: -35, y: -30 }], // dorsal fin back
      [{ x: -35, y: -30 }, { x: -35, y: -20 }],

      // Body Center
      [{ x: 10, y: -20 }, { x: -35, y: -20 }],
      [{ x: 10, y: 0 }, { x: -35, y: -20 }],
      [{ x: 10, y: 0 }, { x: -35, y: 0 }],
      [{ x: 10, y: 0 }, { x: -15, y: 20 }],
      
      // Pectoral Fin / Belly
      [{ x: 0, y: 20 }, { x: -20, y: 50 }], // pectoral fin front
      [{ x: -20, y: 50 }, { x: -15, y: 20 }], // pectoral fin back
      [{ x: -15, y: 20 }, { x: -35, y: 20 }],
      [{ x: -35, y: 20 }, { x: -35, y: 0 }],

      // Tail Stem
      [{ x: -35, y: -20 }, { x: -60, y: -7 }],
      [{ x: -35, y: 0 }, { x: -60, y: -7 }],
      [{ x: -35, y: 0 }, { x: -60, y: 7 }],
      [{ x: -35, y: 20 }, { x: -60, y: 7 }],

      // Tail Fin
      [{ x: -60, y: -7 }, { x: -85, y: -25 }],
      [{ x: -85, y: -25 }, { x: -70, y: 0 }],
      [{ x: -60, y: 7 }, { x: -85, y: 25 }],
      [{ x: -85, y: 25 }, { x: -70, y: 0 }],
      [{ x: -60, y: -7 }, { x: -70, y: 0 }],
      [{ x: -60, y: 7 }, { x: -70, y: 0 }]
    ];

    const theta = enemy.rot._value || 0;
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    const scale = 0.7;

    // Check distance from playerPos to each of the 31 rotated segment lines
    for (const seg of segments) {
      const x1 = seg[0].x * scale;
      const y1 = seg[0].y * scale;
      const x2 = seg[1].x * scale;
      const y2 = seg[1].y * scale;

      const sx1 = enemy.x + (x1 * cos - y1 * sin);
      const sy1 = enemy.y + (x1 * sin + y1 * cos);
      const sx2 = enemy.x + (x2 * cos - y2 * sin);
      const sy2 = enemy.y + (x2 * sin + y2 * cos);

      // Calculate closest point on segment to playerPos
      const dx = sx2 - sx1;
      const dy = sy2 - sy1;
      const lenSq = dx * dx + dy * dy;
      let nearestX = sx1;
      let nearestY = sy1;

      if (lenSq > 0) {
        let t = ((playerPos.x - sx1) * dx + (playerPos.y - sy1) * dy) / lenSq;
        t = Math.max(0, Math.min(1, t));
        nearestX = sx1 + t * dx;
        nearestY = sy1 + t * dy;
      }

      const dist = Math.hypot(playerPos.x - nearestX, playerPos.y - nearestY);
      if (dist < PLAYER_RADIUS) {
        const safeDist = dist > 0.01 ? dist : 0.01;
        const penetration = PLAYER_RADIUS - dist;
        const nx = (playerPos.x - nearestX) / safeDist;
        const ny = (playerPos.y - nearestY) / safeDist;

        return {
          pushX: nx * penetration,
          pushY: ny * penetration,
        };
      }
    }
    return null;
  }
};
