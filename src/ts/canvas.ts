export class Canvas {
  private canvas_:HTMLCanvasElement = document.getElementById("board") as HTMLCanvasElement;
  private blockSize_: number = 25;

  protected ctx:CanvasRenderingContext2D =  this.canvas_.getContext("2d") as CanvasRenderingContext2D;


  get blockSize(){
    return this.blockSize_;
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
