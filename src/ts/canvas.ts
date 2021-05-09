import { BLOCK_SIZE, CANVAS_ELEMENT } from "./settings";

export class Canvas {
  private canvas_:HTMLCanvasElement;
  private blockSize_: number = BLOCK_SIZE;

  protected ctx:CanvasRenderingContext2D;


  get blockSize(){
    return this.blockSize_;
  }
  constructor(canvas?: HTMLCanvasElement){
    this.canvas_ = canvas || CANVAS_ELEMENT;
    this.ctx =  this.canvas_.getContext("2d") as CanvasRenderingContext2D;
  }

  public setCanvasSize([x,y]: [number,number]){
    this.setHeight(y);
    this.setWidth(x)
  }

  private setWidth(width:number){
    this.ctx.canvas.width = width * this.blockSize_
  }

  private setHeight(height:number){
    this.ctx.canvas.height = height * this.blockSize_
  }
}
