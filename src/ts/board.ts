import { Chunk, ChunkState } from "./chunk";

export interface Point {
  x: number
  y: number
}

export class Board {
  columns: number;
  rows: number;
  body: Chunk[][];

  openChunks: Chunk[] = [];
  closedChunks: Chunk[] = [];

  private startChunk_!: Chunk;
  private goalChunk_!: Chunk;

  constructor(size: [number, number]) {
    this.columns = size[0];
    this.rows = size[1];
    this.body = this.emptyBoard();
  }

  setStart(point: Point): void {
    this.startChunk_ = this.body[point.y][point.x]
    this.startChunk_.state = ChunkState.START;

  }

  setGoal(point: Point): void {
    this.goalChunk_ = this.body[point.y][point.x];
    this.goalChunk_.state = ChunkState.GOAL;
  }

  getChunk(point: Point) {
    return this.body[point.y][point.x];
  }

  reDraw() {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        this.body[y][x].draw();
      }
    }
  }

  initialDraw(): void {
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        const currentChunk = this.body[y][x];
        currentChunk.state = this.canBeObsticle(x, y) ? ChunkState.OBSTACLE : currentChunk.state;
        currentChunk.draw();
      }
    }
  }

  private canBeObsticle(x: number, y: number): boolean {
    return (Math.random() > 0.65
      && !this.isGoalPoint(x, y)
      && !this.isStartPoint(x, y)
    )
  }

  private isGoalPoint(x: number, y: number): boolean {
    return y === this.goalChunk_?.y && this.goalChunk_?.x === x;
  }

  private isStartPoint(x: number, y: number): boolean {
    return y === this.startChunk_?.y && this.startChunk_?.x === x;
  }

  private emptyBoard = () => Array.from(Array(this.rows), (v: any, index) => this.newLine(index))

  private newLine = (y: number) => Array.from(Array(this.columns), (v: any, index) => new Chunk(index, y));

  private async delay(t: number = 100) {
    return new Promise(function (resolve) {
      setTimeout(resolve.bind(null), t)
    });
  }
  async findPath() {
    this.openChunks.push(this.startChunk_);

    while (this.openChunks.length) {
      let active: Chunk = this.findLowestCostInOpen()
      this.removeFromOpen(active);

      if (!this.isStartPoint(active.x, active.y) && !this.isGoalPoint(active.x, active.y)) {
        active.state = ChunkState.CLOSED;
      }
      await this.delay();
      this.reDraw()

      this.closedChunks.push(active);

      if (this.isGoalChunk(active)) {
        const path: Chunk[] = this.getFinalPath();
        this.printPath(path);
        return
      }

      let neighbors: Chunk[] = this.findNeighboursOf(active);
      neighbors.forEach(neighbor => {

        if (!this.isStartPoint(neighbor.x, neighbor.y) && !this.isGoalPoint(neighbor.x, neighbor.y) && neighbor.state !== ChunkState.CLOSED) {
          neighbor.state = ChunkState.OPEN;
        }

        //if new path to neighbor is shorter OR neighbor is not in OPEN
        const distanceToNb = active.getDistanceTo(neighbor)
        let newHomeCost = active.homeCost + distanceToNb;
        if (neighbor.homeCost > newHomeCost || !this.openChunks.includes(neighbor)) {
          //set final cost
          neighbor.homeCost = newHomeCost
          neighbor.goalCost = neighbor.getDistanceTo(this.goalChunk_)
          neighbor.parent = active;
          if (!this.openChunks.includes(neighbor)) {
            this.openChunks.push(neighbor)
          }

        }
      });
    }
  }

  removeFromOpen(chunk: Chunk) {
    const index = this.openChunks.indexOf(chunk)
    if (index !== -1) {
      this.openChunks.splice(index, 1);
    }
  }

  removeFromClosed(chunk: Chunk) {
    const index = this.closedChunks.indexOf(chunk)
    if (index !== -1) {
      this.openChunks.splice(index, 1);
    }
  }

  findLowestCostInOpen(): Chunk {
    return this.openChunks.sort(this.sortByCost)[0];
  }

  private sortByCost = (a: Chunk, b: Chunk) => {
    return (a.finalCost < b.finalCost) || (a.finalCost === b.finalCost && a.goalCost < b.goalCost) ? -1 : 1;
  }

  isGoalChunk(chunk: Chunk): boolean {
    return chunk.x === this.goalChunk_.x && this.goalChunk_.y == chunk.y
  }

  findNeighboursOf(chunk: Chunk): Chunk[] {
    const neighbors: Chunk[] = [];
    for (let x = - 1; x <= 1; x++) {
      for (let y = - 1; y <= 1; y++) {
        const point: Point = {
          x: chunk.x + x,
          y: chunk.y + y
        }
        if (point.x === 0 && point.y == 0
          || point.x == chunk.x && point.y == chunk.y
        ) {
          continue;
        }

        if (point.x >= 0 && point.x < this.columns && point.y >= 0 && point.y < this.rows) {
          const newChunk = this.getChunk(point)
          if (newChunk.state !== ChunkState.OBSTACLE && !this.closedChunks.includes(newChunk)) {
            neighbors.push(newChunk);
          }
        }
      }
    }
    return neighbors;
  }

  pickRandom(max: number) {
    return Math.round(Math.random() * (max - 0) + 0);
  }

  getFinalPath() {
    let finalPath: Chunk[] = []
    let current: Chunk = this.goalChunk_;
    while (current !== this.startChunk_) {
      finalPath.push(current)
      current = current.parent
    }

    return finalPath.reverse();
  }

  async printPath(path: Chunk[]) {
    for (const chunk of path) {
      await this.delay(200);
      chunk.state = ChunkState.PATH
      this.reDraw()
    }
  }
}
