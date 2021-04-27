import { Canvas } from "./canvas";

export class Chunk extends Canvas {
  public goalCost!: number;
  public homeCost!: number;
  public parent!: Chunk;
  get finalCost(){
    return this.goalCost + this.homeCost;
  }

  constructor(
    public x:number, 
    public y:number,
    public state: ChunkState = ChunkState.EMPTY
    ){
      super()
    }
  
  draw() {		
		let xPos = this.x * this.blockSize;
		let yPos = this.y * this.blockSize;
    
    this.drawBorder(xPos, yPos, this.blockSize, this.blockSize);
		this.ctx.fillStyle = this.state;
    this.ctx.fillRect(xPos , yPos, this.blockSize, this.blockSize);

  }
  private  drawBorder(xPos:number, yPos:number, width:number, height:number, thickness = 1) {
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(
      xPos - thickness,
      yPos - thickness,
      width + thickness * 2,
      height + thickness * 2
    );
  }

  getDistanceTo(chunk:Chunk): number {
    const distX = Math.abs( this.x - chunk.x);
    const distY = Math.abs( this.y - chunk.y);

    return  distX > distY ? 14*distY + 10*distX : 14*distX + 10*distY;
  }
}





export enum ChunkState {
  START = '#FFFF00', // yellow
  EMPTY = '#FFF', // white
  OPEN = '#00FF00', // green
  OBSTACLE = '#000000', // blask
  PATH = '#0000FF', // blue
  CLOSED = '#FF0000', // red
  GOAL = '#00FFFF', // cyan
}