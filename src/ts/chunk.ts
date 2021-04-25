import { Canvas } from "./canvas";

export class Chunk extends Canvas {

  constructor(
    private x:number, 
    private y:number,
    private state_: ChunkState = ChunkState.EMPTY
    ){
      super()
    }
  
  set state(state: ChunkState){
    this.state_ = state;
  }
  get state(): ChunkState{
    return this.state_;
  }

  draw() {		
		let xPos = this.x * this.blockSize;
		let yPos = this.y * this.blockSize;
    
    this.drawBorder(xPos, yPos, this.blockSize, this.blockSize);
		this.ctx.fillStyle = this.state_;
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
}





export enum ChunkState {
  START = '#FFFF00', // yellow
  EMPTY = '#FFF', // white
  CURRENT = '#00FF00', // green
  OBSTACLE = '#000000', // blask
  CHECKED = '#0000FF', // blue
  GOAL = '#00FFFF', // cyan
}