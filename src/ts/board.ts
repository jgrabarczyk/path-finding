import { Chunk, ChunkState } from "./chunk";
import { Grid } from "./grid";
import { Point } from "./point";


interface BoardI {
  size: [number, number],
  delay?: number,
}
export class Board {
  private grid_: Grid;
  private openChunks_: Chunk[] = [];
  private closedChunks_: Chunk[] = [];
  private startChunk_!: Chunk;
  private goalChunk_!: Chunk;
  private currentChunk_!: Chunk;
  private delay_: number;
  private chunksToRedraw_: Chunk[] = [];

  constructor(board: BoardI | [number, number]) {
    if (Array.isArray(board)) {
      this.grid_ = new Grid(board);
      this.delay_ = 0
    } else {
      this.grid_ = new Grid(board.size);
      this.delay_ = board.delay || 0
    }
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

  public initialDraw(): void {
    for (let y = 0; y < this.grid_.rows; y++) {
      for (let x = 0; x < this.grid_.columns; x++) {
        const currentChunk = this.grid_.getChunk({ x, y });
        currentChunk.state = this.canBeObstacle(x, y) ? ChunkState.OBSTACLE : currentChunk.state;
        currentChunk.draw();
      }
    }
  }

  private canBeObstacle(x: number, y: number): boolean {
    const chunk = this.grid_.getChunk({ x, y })
    return (Math.random() > 0.45
      && !this.isGoalChunk(chunk)
      && !this.isStartChunk(chunk)
    )
  }

  public async findPath(): Promise<void> {
    this.openChunks_.push(this.startChunk_);

    while (this.openChunks_.length) {
      await this.reDraw();

      this.currentChunk_ = this.findLowestCostInOpen();
      this.removeCurrentFromOpen();
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

        if (this.openChunks_.includes(neighbor)) { return; }

        this.openChunks_.push(neighbor)
      });
    }
  }

  private newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor: Chunk): boolean {
    return neighbor.homeCost <= this.getNewHomeCost(neighbor) && this.openChunks_.includes(neighbor)
  }

  private findLowestCostInOpen(): Chunk {
    return this.openChunks_.sort(this.sortByCost)[0];
  }

  private sortByCost = (a: Chunk, b: Chunk) => {
    return (a.finalCost < b.finalCost) || (a.finalCost === b.finalCost && a.goalCost < b.goalCost) ? -1 : 1;
  }

  private removeCurrentFromOpen(): void {
    const index = this.openChunks_.indexOf(this.currentChunk_)
    if (index !== -1) {
      this.openChunks_.splice(index, 1);
    }
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
