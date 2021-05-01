import { Chunk, ChunkState } from "./chunk";
import { Grid } from "./grid";
import { Point } from "./point";

export class Board {
  private grid_: Grid;
  private openChunks_: Chunk[] = [];
  private closedChunks_: Chunk[] = [];
  private startChunk_!: Chunk;
  private goalChunk_!: Chunk;

  constructor(size: [number, number]) {
    this.grid_ = new Grid(size);
  }

  public pickRandom(max: number) {
    return Math.round(Math.random() * (max - 0) + 0);
  }

  public setStart(point: Point): void {
    this.startChunk_ = this.grid_.getChunk(point);
    this.startChunk_.state = ChunkState.START;
  }

  public setGoal(point: Point): void {
    this.goalChunk_ = this.grid_.getChunk(point);
    this.goalChunk_.state = ChunkState.GOAL;
  }

  public initialDraw(): void {
    for (let y = 0; y < this.grid_.rows; y++) {
      for (let x = 0; x < this.grid_.columns; x++) {
        const currentChunk = this.grid_.getChunk({ x, y });
        currentChunk.state = this.canBeObsticle(x, y) ? ChunkState.OBSTACLE : currentChunk.state;
        currentChunk.draw();
      }
    }
  }

  private canBeObsticle(x: number, y: number): boolean {
    const chunk = this.grid_.getChunk({ x, y })
    return (Math.random() > 0.65
      && !this.isGoalChunk(chunk)
      && !this.isStartChunk(chunk)
    )
  }

  public async findPath() {
    this.openChunks_.push(this.startChunk_);

    while (this.openChunks_.length) {
      let active: Chunk = this.findLowestCostInOpen();
      this.removeFromOpen(active);

      if (!this.isStartChunk(active) && !this.isGoalChunk(active)) {
        active.state = ChunkState.CLOSED;
      }

      await this.reDraw()

      this.closedChunks_.push(active);

      if (this.isGoalChunk(active)) {
        const path: Chunk[] = this.retraceFinalPath();
        this.printPath(path);
        return
      }

      let neighbors: Chunk[] = this.findNeighboursOf(active);
      neighbors.forEach(neighbor => {
        if (neighbor.state === ChunkState.OBSTACLE || this.closedChunks_.includes(neighbor)) {
          return
        }

        if (!this.isStartChunk(neighbor) && !this.isGoalChunk(neighbor) && neighbor.state !== ChunkState.CLOSED) {
          neighbor.state = ChunkState.OPEN;
        }

        const distanceToNb = active.getDistanceTo(neighbor)
        let newHomeCost = active.homeCost + distanceToNb;
        if (neighbor.homeCost > newHomeCost || !this.openChunks_.includes(neighbor)) {
          //set final cost
          neighbor.homeCost = newHomeCost
          neighbor.goalCost = neighbor.getDistanceTo(this.goalChunk_)
          neighbor.parent = active;
          if (!this.openChunks_.includes(neighbor)) {
            this.openChunks_.push(neighbor)
          }

        }
      });
    }
  }

  private findLowestCostInOpen(): Chunk {
    return this.openChunks_.sort(this.sortByCost)[0];
  }

  private sortByCost = (a: Chunk, b: Chunk) => {
    return (a.finalCost < b.finalCost) || (a.finalCost === b.finalCost && a.goalCost < b.goalCost) ? -1 : 1;
  }

  private removeFromOpen(chunk: Chunk) {
    const index = this.openChunks_.indexOf(chunk)
    if (index !== -1) {
      this.openChunks_.splice(index, 1);
    }
  }

  private isStartChunk(chunk: Chunk): boolean {
    return chunk.y === this.startChunk_?.y && this.startChunk_?.x === chunk.x;
  }

  private isGoalChunk(chunk: Chunk): boolean {
    return chunk.x === this.goalChunk_.x && this.goalChunk_.y == chunk.y
  }

  private async reDraw(delay: number = 150) {
    await this.delay(delay)
    for (let y = 0; y < this.grid_.rows; y++) {
      for (let x = 0; x < this.grid_.columns; x++) {
        this.grid_.getChunk({ x, y }).draw();
      }
    }
  }

  private async delay(t: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null), t)
    });
  }

  private findNeighboursOf(chunk: Chunk): Chunk[] {
    const neighbors: Chunk[] = [];
    for (let x = - 1; x <= 1; x++) {
      for (let y = - 1; y <= 1; y++) {

        const point: Point = {
          x: chunk.x + x,
          y: chunk.y + y
        }

        if (point.x == chunk.x && point.y == chunk.y) { continue; }

        if (point.x >= 0 && point.x < this.grid_.columns && point.y >= 0 && point.y < this.grid_.rows) {
          neighbors.push(this.grid_.getChunk(point));
        }
      }
    }
    return neighbors;
  }

  private retraceFinalPath() {
    let finalPath: Chunk[] = []
    let current: Chunk = this.goalChunk_;
    while (current !== this.startChunk_) {
      finalPath.push(current)
      current = current.parent
    }

    return finalPath.reverse();
  }
  
  private async printPath(path: Chunk[]) {
    for (const chunk of path) {
      chunk.state = ChunkState.PATH
      await this.reDraw()
    }
  }
}
