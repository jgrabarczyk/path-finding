import { Board } from "./board";
import { BoardI } from "./board-abstract";
import { BoardHeap } from "./board-heap";
import { Canvas } from "./canvas";

export const BLOCK_SIZE = 25;

export const BOARD_SIZE: [number,number] = [
  Math.floor(((window.innerWidth / BLOCK_SIZE) - 1)/1),
  Math.floor(((window.innerHeight / BLOCK_SIZE) -1)/2)
];

const CANVAS_ELEMENT = document.getElementById("board") as HTMLCanvasElement;
const CANVAS_ELEMENT_HEAP = document.getElementById("board-heap") as HTMLCanvasElement;
const canvas = new Canvas(CANVAS_ELEMENT, BLOCK_SIZE);
const canvasHeap = new Canvas(CANVAS_ELEMENT_HEAP, BLOCK_SIZE);


const start = {
  x: canvas.pickRandom(BOARD_SIZE[0]),
  y: canvas.pickRandom(BOARD_SIZE[1])
}
const goal = {
  x: canvas.pickRandom(BOARD_SIZE[0]),
  y: canvas.pickRandom(BOARD_SIZE[1])
}
canvas.setCanvasSize(BOARD_SIZE);
canvasHeap.setCanvasSize(BOARD_SIZE)
const boardSettings: BoardI = {
  size: BOARD_SIZE,
  blockSize: BLOCK_SIZE,
  delay: 1
}
const board = new Board(CANVAS_ELEMENT, boardSettings);
board.setStart(start);
board.setGoal(goal);
board.initialDraw();

const boardHeap = new BoardHeap(CANVAS_ELEMENT_HEAP, boardSettings);
const grid = board.getGrid()
boardHeap.initialDraw(grid);
boardHeap.setStart(start);
boardHeap.setGoal(goal);

board.findPath();
boardHeap.findPath();