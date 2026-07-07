export const VectorPhysics = {
  applyInput: (velocity, inputVector, acceleration) => {
    velocity.x += inputVector.x * acceleration;
    velocity.y += inputVector.y * acceleration;
  },

  applyFriction: (velocity, friction) => {
    velocity.x *= friction;
    velocity.y *= friction;
  },

  integrate: (position, velocity) => {
    position.x += velocity.x;
    position.y += velocity.y;
  },

  clampToScreen: (position, velocity, width, height, padding = 20, bounce = -0.5) => {
    let bounced = false;
    
    if (position.x < padding) {
      position.x = padding;
      velocity.x *= bounce;
      bounced = true;
    } else if (position.x > width - padding) {
      position.x = width - padding;
      velocity.x *= bounce;
      bounced = true;
    }
    
    if (position.y < padding) {
      position.y = padding;
      velocity.y *= bounce;
      bounced = true;
    } else if (position.y > height - padding) {
      position.y = height - padding;
      velocity.y *= bounce;
      bounced = true;
    }
    
    return bounced;
  },

  getRotation: (velocity, threshold = 0.5) => {
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    if (speed > threshold) {
      return Math.atan2(velocity.y, velocity.x);
    }
    return null;
  }
};
