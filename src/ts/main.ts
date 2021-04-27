import { Board } from "./board";
import { Canvas } from "./canvas";

const canvas = new Canvas()
const size: [number,number] = [25,25];
const board = new Board(size);

canvas.setCanvasSize(size);
board.setStart({
    x: board.pickRandom(24),
    y: board.pickRandom(24)
  });
board.setGoal({x:24,y:15});
board.initialDraw();

board.findPath()