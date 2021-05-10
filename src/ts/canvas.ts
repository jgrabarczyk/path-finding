
export class Canvas {
  private canvas_:HTMLCanvasElement;
  protected blockSize_: number;

  protected ctx:CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement, blockSize: number){
    this.canvas_ = canvas 
    this.ctx =  this.canvas_.getContext("2d") as CanvasRenderingContext2D;
    this.blockSize_ = blockSize;
  }

  setCanvasSize([x,y]: [number,number]){
    this.setHeight(y);
    this.setWidth(x)
  }

  pickRandom(max: number): number {
    return Math.round(Math.random() * max);
  }

  private setWidth(width:number){
    this.ctx.canvas.width = width * this.blockSize_
  }

  private setHeight(height:number){
    this.ctx.canvas.height = height * this.blockSize_
  }

}
