import { Canvas } from "./canvas";
import { BASIC_COST, DIAGONAL_COST } from "./settings";

export enum ChunkState {
  START = '#FFFF00', // yellow
  EMPTY = '#FFF', // white
  OPEN = '#00FF00', // green
  OBSTACLE = '#000000', // black
  GOAL = '#0000FF', // blue
  CLOSED = '#FF0000', // red
  PATH = '#00FFFF', // cyan
}
export class Chunk extends Canvas {
  public goalCost: number = 0;
  public homeCost: number = 0;
  public parent!: Chunk;
  public state = ChunkState.EMPTY;

  get finalCost(): number {
    return this.goalCost + this.homeCost;
  }

  constructor(
    public x: number,
    public y: number,
  ) {
    super()
  }

  draw(): void {
    let xPos = this.x * this.blockSize;
    let yPos = this.y * this.blockSize;

    this.drawBorder(xPos, yPos, this.blockSize, this.blockSize);
    this.ctx.fillStyle = this.state;
    this.ctx.fillRect(xPos, yPos, this.blockSize, this.blockSize);
    
    if (!this.finalCost) { return; }

    this.ctx.strokeStyle = "#000";
    this.ctx.fillStyle = "#abc";
    this.ctx.font = "10px Georgia";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(
      this.finalCost.toString(),
      (xPos + (this.blockSize / 2)),
      (yPos + (this.blockSize / 2))
    );
  }

  private drawBorder(xPos: number, yPos: number, width: number, height: number, thickness = 1): void {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(
      xPos - thickness,
      yPos - thickness,
      width + thickness * 2,
      height + thickness * 2
    );
  }

  public getDistanceTo(chunk: Chunk): number {
    const distX = Math.abs(this.x - chunk.x);
    const distY = Math.abs(this.y - chunk.y);
    return distX > distY ? this.getMovementCost(distX,distY) : this.getMovementCost(distY,distX);
  }

  private getMovementCost(higherNo: number ,lowerNo:number): number {
    return DIAGONAL_COST * lowerNo + BASIC_COST * (higherNo - lowerNo)
  }
}