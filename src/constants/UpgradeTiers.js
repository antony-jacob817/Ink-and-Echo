export const UpgradeTiers = {
  AFTERGLOW: {
    id: 'afterglow',
    title: 'AFTERGLOW',
    description: 'Increase neon fade time.',
    maxLevel: 5,
    costs: [800, 1400, 2200, 3500, 5000],
    multipliers: [1.0, 1.3, 1.7, 2.1, 2.6], // multiplier for how long obstacles remain visible
  },
  DAMPENED_FINS: {
    id: 'dampened_fins',
    title: 'DAMPENED FINS',
    description: 'Slow down predator movement.',
    maxLevel: 5,
    costs: [1000, 1700, 2600, 4000, 6000],
    multipliers: [1.0, 0.85, 0.75, 0.65, 0.5], // multiplier for predator speed
  },
  PULSE_CAPACITY: {
    id: 'pulse_capacity',
    title: 'PULSE CAPACITY',
    description: 'Reduce sonar pulse cooldown.',
    maxLevel: 5,
    costs: [1200, 2000, 3000, 4800, 7000],
    values: [2000, 1750, 1500, 1250, 1000], // cooldown durations in milliseconds
  }
};
