import { Board } from "./board";
import { Canvas } from "./canvas";

const canvas = new Canvas()
const size: [number,number] = [25,25];
const board = new Board(size);

canvas.setCanvasSize(size);
board.setStart({x:0,y:0});
board.setGoal({x:24,y:24});
board.initialDraw();
