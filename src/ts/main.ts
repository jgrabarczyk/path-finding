import { Board } from "./board";
import { Canvas } from "./canvas";
import { BOARD_SIZE, CANVAS_ELEMENT, CANVAS_ELEMENT_HEAP } from "./settings";

const canvas = new Canvas();
const canvasHeap = new Canvas(CANVAS_ELEMENT_HEAP);

const board = new Board({
  size: BOARD_SIZE,
  canvas: CANVAS_ELEMENT
});
const boardHeap = new Board({
  size: BOARD_SIZE,
  canvas: CANVAS_ELEMENT_HEAP
});

const start = {
  x: board.pickRandom(BOARD_SIZE[0]),
  y: board.pickRandom(BOARD_SIZE[1])
}
const goal = {
  x: board.pickRandom(BOARD_SIZE[0]),
  y: board.pickRandom(BOARD_SIZE[1])
}

canvas.setCanvasSize(BOARD_SIZE);
canvasHeap.setCanvasSize(BOARD_SIZE)

board.setStart(start);
board.setGoal(goal);



board.initialDraw();
// boardHeap.importGrid(board.exportGrid());

boardHeap.initialDraw(board.exportGrid());
boardHeap.setStart(start);
boardHeap.setGoal(goal);

board.findPath();
boardHeap.findPath();