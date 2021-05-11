import { AStar } from './a-star';
import { BoardI } from './board-abstract';
import { AStarWithHeap } from './a-star-heap';
import { Canvas } from './canvas';

const blockSize = 5;
const size: [number, number] = [
  Math.floor(((window.innerWidth / blockSize) - 1) / 1),
  Math.floor(((window.innerHeight / blockSize) - 1) / 2)
];
const boardSettings: BoardI = {
  blockSize,
  size,
  delay: 1,
  obstacleChance: .55
};
const canvasElement = document.getElementById('board') as HTMLCanvasElement;
const canvasHeapElement = document.getElementById('board-heap') as HTMLCanvasElement;

const canvas = new Canvas(canvasElement, blockSize);
const canvasHeap = new Canvas(canvasHeapElement, blockSize);

const start = canvas.pickPoint(size);
const goal = canvas.pickPoint(size);

canvas.setCanvasSize(size);
canvasHeap.setCanvasSize(size);

const board = new AStar(canvasElement, boardSettings);
board.setStart(start);
board.setGoal(goal);
board.initialDraw();

const boardHeap = new AStarWithHeap(canvasHeapElement, boardSettings);
const grid = board.getGrid();
boardHeap.initialDraw(grid);
boardHeap.setStart(start);
boardHeap.setGoal(goal);

board.findPath();
boardHeap.findPath();
