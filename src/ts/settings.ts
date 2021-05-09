export const CANVAS_ELEMENT = document.getElementById("board") as HTMLCanvasElement;
export const CANVAS_ELEMENT_HEAP = document.getElementById("board-heap") as HTMLCanvasElement;
export const BLOCK_SIZE = 25;
export const DIAGONAL_COST = 14; 
export const BASIC_COST = 10;
export const OBSTACLE_CHANCE = 0.55; 
export const BOARD_SIZE: [number,number] = [
  Math.floor(((window.innerWidth / BLOCK_SIZE) - 1)/2),
  Math.floor(((window.innerHeight / BLOCK_SIZE) -1/2))
];
