export const CANVAS_ELEMENT = document.getElementById("board");
export const BLOCK_SIZE = 25;
export const DIAGONAL_COST = 14; 
export const BASIC_COST = 10;
export const BOARD_SIZE: [number,number] = [
  Math.floor(window.innerWidth / BLOCK_SIZE) - 1,
  Math.floor(window.innerHeight / BLOCK_SIZE) -1,
];
