import { Canvas } from "./canvas";
import { Chunk, ChunkState } from "./chunk";
import { Grid } from "./grid";
import { Heap } from "./heap";
import { Point } from "./point";
import { OBSTACLE_CHANCE } from "./settings";


interface BoardI {
  size: [number, number],
  delay?: number,
  canvas: HTMLCanvasElement;
}
export class Board extends Canvas {
  private grid_: Grid;
  private startChunk_!: Chunk;
  private goalChunk_!: Chunk;
  private currentChunk_!: Chunk;
  private delay_: number;
  private chunksToRedraw_: Chunk[] = [];

  private sortByCost = (a: Chunk, b: Chunk) =>
    (a.finalCost < b.finalCost) || (a.finalCost === b.finalCost && a.goalCost < b.goalCost);

  private heap_ = new Heap<Chunk>(this.sortByCost);
  private closedChunks_: Chunk[] = [];

  constructor(board: BoardI) {
    super(board.canvas);

    this.grid_ = new Grid(board.size, this.ctx);
    this.delay_ = board.delay || 0
  }

  exportGrid() {
    let gridToExport: ChunkState[][] = new Array();
    this.grid_.body_.forEach((row, y) => {
      gridToExport.push([])
      row.forEach((chunk, x) => {
        gridToExport[y][x] = chunk.state
      })
    })
    return gridToExport;
  }

  importGrid(gridBody: ChunkState[][]) {
    let newBody: Chunk[][] = new Array();

    gridBody.forEach((row, y) => {
      newBody.push([]);
      row.forEach((chunkState, x) => {
        newBody[y][x] = new Chunk(x, y, this.ctx, chunkState)
        newBody[y][x].draw();
      })
    })
    this.grid_.body_ = newBody;
  }

  public pickRandom(max: number): number {
    return Math.round(Math.random() * max);
  }

  public setStart(point: Point): void {
    this.startChunk_ = this.grid_.getChunk(point);
    this.startChunk_.state = ChunkState.START;
    this.addChunkToRedraw(this.startChunk_)
  }

  public setGoal(point: Point): void {
    this.goalChunk_ = this.grid_.getChunk(point);
    this.goalChunk_.state = ChunkState.GOAL;
    this.addChunkToRedraw(this.goalChunk_)
  }

  public initialDraw(gridBody?: ChunkState[][]): void {
    if (gridBody) {
      this.importGrid(gridBody);
    } else {

      for (let y = 0; y < this.grid_.rows; y++) {
        for (let x = 0; x < this.grid_.columns; x++) {
          const currentChunk = this.grid_.getChunk({ x, y });
          currentChunk.state = this.canBeObstacle(x, y) ? ChunkState.OBSTACLE : currentChunk.state;
          currentChunk.draw();
        }
      }
    }

  }

  private canBeObstacle(x: number, y: number): boolean {
    const chunk = this.grid_.getChunk({ x, y })
    return (Math.random() > (1 - OBSTACLE_CHANCE)
      && !this.isGoalChunk(chunk)
      && !this.isStartChunk(chunk)
    )
  }

  public async findPath(): Promise<void> {
    this.heap_.add(this.startChunk_);

    while (this.heap_.length()) {
      await this.reDraw();

      this.currentChunk_ = this.heap_.getFirst();
      this.heap_.removeRoot();

      this.addCurrentToClosedChunks();

      if (this.isGoalChunk(this.currentChunk_)) {
        this.finish();
        return
      }

      this.findNeighboursOfCurrent().forEach(neighbor => {
        if (this.isObstacleOrIsClosed(neighbor)) { return }

        neighbor.state = ChunkState.OPEN;
        this.addChunkToRedraw(neighbor);

        if (this.newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor)) { return; }

        this.setNewCostAndParent(neighbor);

        if (this.heap_.contains(neighbor)) { return; }

        this.heap_.add(neighbor);
      });
    }
  }

  private newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor: Chunk): boolean {
    return neighbor.homeCost <= this.getNewHomeCost(neighbor) && this.heap_.contains(neighbor)
  }



  private isStartChunk(chunk: Chunk): boolean {
    return chunk.y === this.startChunk_.y && this.startChunk_.x === chunk.x;
  }

  private isGoalChunk(chunk: Chunk): boolean {
    return chunk.x === this.goalChunk_.x && this.goalChunk_.y == chunk.y
  }

  private async reDraw(delay: number = this.delay_): Promise<void> {
    await this.delay(delay);
    this.chunksToRedraw_.forEach(chunk => {
      chunk.draw();
    })
    this.chunksToRedraw_ = [];
  }

  private async delay(t: number): Promise<void> {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null), t)
    });
  }

  private findNeighboursOfCurrent(): Chunk[] {
    const neighbors: Chunk[] = [];
    for (let x = - 1; x <= 1; x++) {
      for (let y = - 1; y <= 1; y++) {

        const point: Point = {
          x: this.currentChunk_.x + x,
          y: this.currentChunk_.y + y
        }

        if (!this.isInGrid(point) || this.isCurrentChunkPosition(point)) { continue; }

        neighbors.push(this.grid_.getChunk(point));
      }
    }
    return neighbors;
  }

  private isInGrid(point: Point): boolean {
    return (point.x >= 0 && point.x < this.grid_.columns
      && point.y >= 0 && point.y < this.grid_.rows)
  }

  private isCurrentChunkPosition(point: Point) {
    return point.x == this.currentChunk_.x && point.y == this.currentChunk_.y
  }

  private getRetracedFinalPath(): Chunk[] {
    let finalPath: Chunk[] = []
    let current: Chunk = this.goalChunk_;
    while (current !== this.startChunk_) {
      finalPath.push(current)
      current = current.parent
    }

    return finalPath.reverse();
  }

  private async printPath(path: Chunk[]): Promise<void> {
    path.pop()
    for (const chunk of path) {
      chunk.state = ChunkState.PATH
      this.addChunkToRedraw(chunk);
      await this.reDraw()
    }
  }

  private addCurrentToClosedChunks(): void {
    if (!this.isStartChunk(this.currentChunk_) && !this.isGoalChunk(this.currentChunk_)) {
      this.currentChunk_.state = ChunkState.CLOSED;
      this.addChunkToRedraw(this.currentChunk_)
    }
    this.closedChunks_.push(this.currentChunk_);
  }

  private finish(): void {
    this.currentChunk_.state = ChunkState.GOAL
    this.addChunkToRedraw(this.currentChunk_)
    this.printPath(this.getRetracedFinalPath());
  }

  private isObstacleOrIsClosed(chunk: Chunk): boolean {
    return chunk.state === ChunkState.OBSTACLE || this.closedChunks_.includes(chunk)
  }

  private getNewHomeCost(neighbor: Chunk): number {
    return this.currentChunk_.homeCost + this.currentChunk_.getDistanceTo(neighbor);
  }

  private setNewCostAndParent(neighbor: Chunk): void {
    neighbor.homeCost = this.getNewHomeCost(neighbor)
    neighbor.goalCost = neighbor.getDistanceTo(this.goalChunk_)
    neighbor.parent = this.currentChunk_;
  }


  private addChunkToRedraw(chunk: Chunk) {
    this.chunksToRedraw_.push(chunk);
  }
}
