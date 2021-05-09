import { Board } from "./board";
import { Canvas } from "./canvas";
import { BOARD_SIZE } from "./settings";

const canvas = new Canvas();
const boardHeap = new Board(BOARD_SIZE);

canvas.setCanvasSize(BOARD_SIZE);

boardHeap.setStart({
    x: boardHeap.pickRandom(BOARD_SIZE[0]),
    y: boardHeap.pickRandom(BOARD_SIZE[1])
  });

boardHeap.setGoal({
    x: boardHeap.pickRandom(BOARD_SIZE[0]),
    y: boardHeap.pickRandom(BOARD_SIZE[1])
  });

boardHeap.initialDraw();

boardHeap.findPath();