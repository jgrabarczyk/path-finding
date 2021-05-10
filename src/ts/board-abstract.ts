import { Canvas } from "./canvas";
import { Chunk, ChunkState } from "./chunk";
import { Grid } from "./grid";
import { Point } from "./point";

export interface BoardI {
  size: [number, number],
  blockSize: number,
  delay?: number,
  animate?: boolean
  obstacleChance?: number
  
}

export abstract class BoardAbstract extends Canvas {
  protected currentChunk_!: Chunk;
  private obstacleChance_: number
  private startChunk_!: Chunk;
  private goalChunk_!: Chunk;
  private delay_: number;
  private grid_: Grid;
  private chunksToRedraw_: Chunk[] = [];
  private closedChunks_: Chunk[] = [];

  constructor(canvas: HTMLCanvasElement, board: BoardI,) {
    super(canvas, board.blockSize);

    this.grid_ = new Grid(board.size, this.ctx);
    this.delay_ = board.delay || 0
    this.obstacleChance_ = board.obstacleChance || 0.25
  }

  protected abstract sortByCost(a: Chunk, b: Chunk): boolean | number
  protected abstract newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor: Chunk): boolean
  abstract findPath(): Promise<void>

  protected get goal(): Chunk {
    return this.goalChunk_;
  }

  protected get start(): Chunk {
    return this.startChunk_;
  }

  initialDraw(gridBody?: ChunkState[][]): void {
    
    if (gridBody) {
      this.importGrid(gridBody);
    } else {
      this.importGrid(this.getGrid(true));
    }
  }

  getGrid(resetBuild: boolean = false): ChunkState[][] {

    let gridToExport: ChunkState[][] = new Array();
    this.grid_.body_.forEach((row, y) => {
      gridToExport.push([])
      row.forEach((chunk, x) => {
        gridToExport[y][x] =  this.canBeObstacle(x, y) && resetBuild ? ChunkState.OBSTACLE :chunk.state
      })
    })
    return gridToExport;
  }

  setStart(point: Point): void {
    this.startChunk_ = this.getChunk(point);
    this.startChunk_.state = ChunkState.START;
    this.addChunkToRedraw(this.startChunk_)
  }

  setGoal(point: Point): void {
    this.goalChunk_ = this.getChunk(point);
    this.goalChunk_.state = ChunkState.GOAL;
    this.addChunkToRedraw(this.goalChunk_)
  }

  protected async finish(): Promise<void> {
    this.currentChunk_.state = ChunkState.GOAL
    this.addChunkToRedraw(this.currentChunk_)
    this.printPath();
    if (!this.delay_) {
      this.delay_ = 1;
      await this.reDraw();
    }
  }

  protected isObstacleOrIsClosed(chunk: Chunk): boolean {
    return chunk.state === ChunkState.OBSTACLE || this.closedChunks_.includes(chunk)
  }

  protected addChunkToRedraw(chunk: Chunk): void {
    this.chunksToRedraw_.push(chunk);
  }

  protected addCurrentToClosedChunks(): void {
    if (!this.isStartChunk(this.currentChunk_) && !this.isGoalChunk(this.currentChunk_)) {
      this.currentChunk_.state = ChunkState.CLOSED;
      this.addChunkToRedraw(this.currentChunk_)
    }
    this.closedChunks_.push(this.currentChunk_);
  }

  protected isGoalChunk(chunk: Chunk): boolean {
    return chunk.x === this.goalChunk_.x && this.goalChunk_.y == chunk.y
  }

  protected getNewHomeCost(neighbor: Chunk): number {
    return this.currentChunk_.homeCost + this.currentChunk_.getDistanceTo(neighbor);
  }

  protected setNewCostAndParent(neighbor: Chunk): void {
    neighbor.homeCost = this.getNewHomeCost(neighbor)
    neighbor.goalCost = neighbor.getDistanceTo(this.goal)
    neighbor.parent = this.currentChunk_;
  }

  protected async reDraw(): Promise<void> {
    // if (!this.delay_) { return; }
    await this.delay(this.delay_);
    this.chunksToRedraw_.forEach(chunk => chunk.draw())
    this.chunksToRedraw_ = [];
  }

  protected findNeighboursOfCurrent(): Chunk[] {
    const neighbors: Chunk[] = [];
    for (let x = - 1; x <= 1; x++) {
      for (let y = - 1; y <= 1; y++) {

        const point: Point = {
          x: this.currentChunk_.x + x,
          y: this.currentChunk_.y + y
        }

        if (this.isCurrentChunkPosition(point) || !this.isInGrid(point)) { continue; }

        neighbors.push(this.getChunk(point));
      }
    }
    return neighbors;
  }

  private isStartChunk(chunk: Chunk): boolean {
    return chunk.y === this.startChunk_.y && this.startChunk_.x === chunk.x;
  }

  private canBeObstacle(x: number, y: number): boolean {
    const chunk = this.grid_.getChunk({ x, y })
    return (Math.random() > (1 - this.obstacleChance_)
      && !this.isGoalChunk(chunk)
      && !this.isStartChunk(chunk)
    )
  }

  private importGrid(gridBody: ChunkState[][]) {
    let newBody: Chunk[][] = new Array();

    gridBody.forEach((row, y) => {
      newBody.push([]);
      row.forEach((chunkState, x) => {
        newBody[y][x] = new Chunk(x, y, this.ctx, this.blockSize_, chunkState)
        newBody[y][x].draw();
      })
    })
    this.grid_.body_ = newBody;
  }

  private async delay(t: number): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null), t)
    });
  }

  private getRetracedFinalPath(): Chunk[] {
    let finalPath: Chunk[] = []
    let current: Chunk = this.goal;
    while (current !== this.startChunk_) {
      
      finalPath.push(current)
      if(!current.parent){

        console.log('c:' ,current, 's: ',this.startChunk_,'p:' ,current.parent)
        return finalPath.reverse();
      }
      current = current.parent
    }

    return finalPath.reverse();
  }

  protected async printPath(): Promise<void> {
    const path: Chunk[] = this.getRetracedFinalPath()
    path.pop()
    for (const chunk of path) {
      chunk.state = ChunkState.PATH
      this.addChunkToRedraw(chunk);
      await this.reDraw()
    }
  }

  private isInGrid(point: Point): boolean {
    return (point.x >= 0 && point.x < this.grid_.columns
      && point.y >= 0 && point.y < this.grid_.rows)
  }

  private isCurrentChunkPosition(point: Point) {
    return point.x == this.currentChunk_.x && point.y == this.currentChunk_.y
  }

  private getChunk(point: Point): Chunk {
    return this.grid_.getChunk(point);
  }
}