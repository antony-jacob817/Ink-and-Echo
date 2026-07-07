import { Colors } from './Colors';

export const LevelData = [
  {
    id: 1,
    title: "GLOWING SHALLOWS",
    pulseTarget: 10,
    maxLives: 3,
    stalker: null, // No predator in level 1, easy introduction
    portal: { xRatio: 0.85, yRatio: 0.5, size: 40, hitRadius: 20 },
    obstacles: [
      { id: 1, xRatio: 0.3, yRatio: 0.3, size: 60, color: Colors.CYAN, hitRadius: 25, path: "M 30,0 L 50,20 L 60,50 L 30,60 L 0,40 Z M 30,0 L 30,60 M 0,40 L 30,20 L 60,50" },
      { id: 2, xRatio: 0.6, yRatio: 0.7, size: 70, color: Colors.LIME, hitRadius: 30, path: "M 35,5 L 65,25 L 70,65 L 35,75 L 5,50 Z M 35,5 L 35,75 M 5,50 L 35,25 L 65,25" },
      { id: 3, xRatio: 0.5, yRatio: 0.25, size: 85, color: Colors.MAGENTA, hitRadius: 38, path: "M 40,5 L 75,30 L 85,75 L 45,90 L 15,70 L 5,35 Z M 40,5 L 45,90 M 15,70 L 40,35 M 5,35 L 40,35" },
    ]
  },
  {
    id: 2,
    title: "WHISPERING TRENCH",
    pulseTarget: 12,
    maxLives: 3,
    stalker: { xRatio: 0.9, yRatio: 0.1, speed: 1.0 },
    portal: { xRatio: 0.85, yRatio: 0.8, size: 40, hitRadius: 20 },
    obstacles: [
      { id: 1, xRatio: 0.2, yRatio: 0.4, size: 70, color: Colors.YELLOW, hitRadius: 30, path: "M 35,5 L 65,25 L 70,65 L 35,75 L 5,50 Z M 35,5 L 35,75 M 5,50 L 35,25 L 65,25" },
      { id: 2, xRatio: 0.5, yRatio: 0.6, size: 60, color: Colors.CYAN, hitRadius: 25, path: "M 30,0 L 50,20 L 60,50 L 30,60 L 0,40 Z M 30,0 L 30,60" },
      { id: 3, xRatio: 0.75, yRatio: 0.3, size: 80, color: Colors.MAGENTA, hitRadius: 35, path: "M 40,5 L 75,30 L 85,75 L 45,90 L 15,70 L 5,35 Z M 40,5 L 45,90" },
      { id: 4, xRatio: 0.3, yRatio: 0.8, size: 55, color: Colors.LIME, hitRadius: 25, path: "M 25,0 L 50,25 L 40,55 L 10,50 L 0,20 Z" }
    ]
  },
  {
    id: 3,
    title: "CRYSTAL CAVERNS",
    pulseTarget: 15,
    maxLives: 3,
    stalker: { xRatio: 0.1, yRatio: 0.9, speed: 1.3 },
    portal: { xRatio: 0.5, yRatio: 0.5, size: 40, hitRadius: 20 },
    obstacles: [
      { id: 1, xRatio: 0.2, yRatio: 0.2, size: 60, color: Colors.CYAN, hitRadius: 25, path: "M 30,0 L 50,20 L 60,50 L 30,60 L 0,40 Z" },
      { id: 2, xRatio: 0.8, yRatio: 0.2, size: 70, color: Colors.LIME, hitRadius: 30, path: "M 35,5 L 65,25 L 70,65 L 35,75 L 5,50 Z" },
      { id: 3, xRatio: 0.2, yRatio: 0.8, size: 80, color: Colors.MAGENTA, hitRadius: 35, path: "M 40,5 L 75,30 L 85,75 L 45,90 L 15,70 L 5,35 Z" },
      { id: 4, xRatio: 0.8, yRatio: 0.8, size: 55, color: Colors.YELLOW, hitRadius: 25, path: "M 25,0 L 50,25 L 40,55 L 10,50 L 0,20 Z" },
      { id: 5, xRatio: 0.5, yRatio: 0.2, size: 65, color: Colors.CYAN, hitRadius: 28, path: "M 30,0 L 50,20 L 60,50 L 30,60 L 0,40 Z" }
    ]
  },
  {
    id: 4,
    title: "THE SHADOW'S REEF",
    pulseTarget: 15,
    maxLives: 3,
    stalker: { xRatio: 0.9, yRatio: 0.8, speed: 1.5 },
    portal: { xRatio: 0.15, yRatio: 0.5, size: 40, hitRadius: 20 },
    obstacles: [
      { id: 1, xRatio: 0.2, yRatio: 0.25, size: 60, color: Colors.CYAN, hitRadius: 25, path: "M 30,0 L 50,20 L 60,50 L 30,60 L 0,40 Z M 30,0 L 30,60 M 0,40 L 30,20 L 60,50 M 50,20 L 30,20" },
      { id: 2, xRatio: 0.75, yRatio: 0.2, size: 80, color: Colors.MAGENTA, hitRadius: 35, path: "M 40,5 L 75,30 L 85,75 L 45,90 L 15,70 L 5,35 Z M 40,5 L 45,90 M 15,70 L 40,35 L 75,30 M 5,35 L 40,35" },
      { id: 3, xRatio: 0.6, yRatio: 0.8, size: 55, color: Colors.YELLOW, hitRadius: 25, path: "M 25,0 L 50,25 L 40,55 L 10,50 L 0,20 Z M 25,0 L 40,55 M 0,20 L 25,25 L 50,25" },
      { id: 4, xRatio: 0.35, yRatio: 0.75, size: 70, color: Colors.CYAN, hitRadius: 30, path: "M 35,5 L 65,25 L 70,65 L 35,75 L 5,50 Z M 35,5 L 35,75 M 5,50 L 35,25 L 65,25" }
    ]
  },
  {
    id: 5,
    title: "ABYSSAL ABANDON",
    pulseTarget: 18,
    maxLives: 3,
    stalker: { xRatio: 0.5, yRatio: 0.9, speed: 1.8 },
    portal: { xRatio: 0.85, yRatio: 0.2, size: 40, hitRadius: 20 },
    obstacles: [
      { id: 1, xRatio: 0.15, yRatio: 0.3, size: 70, color: Colors.MAGENTA, hitRadius: 30, path: "M 40,5 L 75,30 L 85,75 L 45,90 L 15,70 L 5,35 Z" },
      { id: 2, xRatio: 0.4, yRatio: 0.15, size: 60, color: Colors.CYAN, hitRadius: 25, path: "M 30,0 L 50,20 L 60,50 L 30,60 L 0,40 Z" },
      { id: 3, xRatio: 0.7, yRatio: 0.4, size: 85, color: Colors.LIME, hitRadius: 38, path: "M 35,5 L 65,25 L 70,65 Z" },
      { id: 4, xRatio: 0.3, yRatio: 0.6, size: 55, color: Colors.YELLOW, hitRadius: 25, path: "M 25,0 L 50,25 L 40,55 L 10,50 L 0,20 Z" },
      { id: 5, xRatio: 0.6, yRatio: 0.75, size: 75, color: Colors.CYAN, hitRadius: 32, path: "M 35,5 L 65,25 L 70,65 L 35,75 Z" },
      { id: 6, xRatio: 0.85, yRatio: 0.7, size: 60, color: Colors.MAGENTA, hitRadius: 25, path: "M 40,5 L 75,30 L 85,75 Z" }
    ]
  }
];
