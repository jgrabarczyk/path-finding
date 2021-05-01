import { Board } from "./board";
import { Canvas } from "./canvas";
import { BOARD_SIZE } from "./settings";

const canvas = new Canvas();
const board = new Board(BOARD_SIZE);

canvas.setCanvasSize(BOARD_SIZE);

board.setStart({
    x: board.pickRandom(BOARD_SIZE[0]),
    y: board.pickRandom(BOARD_SIZE[1])
  });

board.setGoal({
    x: board.pickRandom(BOARD_SIZE[0]),
    y: board.pickRandom(BOARD_SIZE[1])
  });

board.initialDraw();

board.findPath();