import { Point } from './point';

export class Canvas {
  private canvas_: HTMLCanvasElement;
  protected blockSize_: number;

  protected ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, blockSize: number) {
    this.canvas_ = canvas;
    this.ctx = this.canvas_.getContext('2d') as CanvasRenderingContext2D;
    this.blockSize_ = blockSize;
  }

  setCanvasSize([x, y]: [number, number]): void {
    this.setHeight(y);
    this.setWidth(x);
  }

  pickRandom(max: number): number {
    return Math.floor(Math.random() * max);
  }

  pickPoint(BOARD_SIZE: [number, number]): Point {
    return {
      x: this.pickRandom(BOARD_SIZE[0]),
      y: this.pickRandom(BOARD_SIZE[1])
    };
  }

  private setWidth(width: number): void {
    this.ctx.canvas.width = width * this.blockSize_;
  }

  private setHeight(height: number): void {
    this.ctx.canvas.height = height * this.blockSize_;
  }

}
