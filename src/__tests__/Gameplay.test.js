import { VectorPhysics } from '../utils/VectorPhysics';
import { CollisionDetector } from '../utils/CollisionDetector';

describe('VectorPhysics Engine', () => {
  test('applyInput should modify velocity based on input and acceleration', () => {
    const velocity = { x: 0, y: 0 };
    const inputVector = { x: 1, y: -1 };
    const acceleration = 0.5;
    
    VectorPhysics.applyInput(velocity, inputVector, acceleration);
    expect(velocity.x).toBe(0.5);
    expect(velocity.y).toBe(-0.5);
  });

  test('applyFriction should decay velocity', () => {
    const velocity = { x: 10, y: -10 };
    const friction = 0.9;
    
    VectorPhysics.applyFriction(velocity, friction);
    expect(velocity.x).toBe(9);
    expect(velocity.y).toBe(-9);
  });

  test('integrate should update position from velocity', () => {
    const position = { x: 100, y: 100 };
    const velocity = { x: 5, y: -5 };
    
    VectorPhysics.integrate(position, velocity);
    expect(position.x).toBe(105);
    expect(position.y).toBe(95);
  });

  test('clampToScreen should limit coordinates and bounce velocity', () => {
    const position = { x: 5, y: 50 };
    const velocity = { x: -10, y: 5 };
    const width = 500;
    const height = 500;
    const padding = 20;
    const bounce = -0.5;
    
    const bounced = VectorPhysics.clampToScreen(position, velocity, width, height, padding, bounce);
    expect(bounced).toBe(true);
    expect(position.x).toBe(20); // Clamped to padding
    expect(velocity.x).toBe(5); // -10 * -0.5 = 5
  });
});

describe('CollisionDetector Engine', () => {
  test('checkCircleCollision detects overlapping bodies', () => {
    const posA = { x: 100, y: 100 };
    const posB = { x: 110, y: 105 };
    
    const isColliding = CollisionDetector.checkCircleCollision(posA, posB, 15);
    expect(isColliding).toBe(true); // distance is sqrt(10^2 + 5^2) = 11.18 < 15
  });

  test('checkSonarReveal identifies objects within radius range', () => {
    const pulseOrigin = { x: 100, y: 100 };
    const pulseRadius = 50;
    const obstacle = { x: 140, y: 130 }; // distance = 50
    
    const isRevealed = CollisionDetector.checkSonarReveal(pulseOrigin, pulseRadius, obstacle, 5);
    expect(isRevealed).toBe(true);
  });
});
