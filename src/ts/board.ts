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

  findPath() {
    this.openChunks.push(this.startChunk_);

    while (this.openChunks.length) {
      let active: Chunk = this.findLowestCostInOpen()
      this.removeFromOpen(active);

      if (!this.isStartPoint(active.x, active.y) && !this.isGoalPoint(active.x, active.y)) {
        active.state = ChunkState.CLOSED;
      }
      
      this.closedChunks.push(active);

      if (this.isGoalChunk(active)) {
        this.printPath();
        return
      }

      let neighbors: Chunk[] = this.findNeighboursOf(active);
      neighbors.forEach(neighbor => {
        if (neighbor.state === ChunkState.OBSTACLE || this.closedChunks.includes(neighbor)) {
          return;
        }

        //if new path to neighbor is shorter OR neighbor is not in OPEN
        let newGoalCost = neighbor.getDistanceTo(this.goalChunk_);
        if (neighbor.goalCost > newGoalCost || !this.openChunks.includes(neighbor)) {
          //set final cost
          neighbor.goalCost = newGoalCost
          neighbor.homeCost = neighbor.getDistanceTo(this.startChunk_)

          neighbor.parent = active;
          if (!this.openChunks.includes(neighbor)) {
            this.openChunks.push(neighbor)
          }

        }
      });
      this.reDraw()
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
    const point: Point = {
      x: chunk.x,
      y: chunk.y
    }
    const neighbors: Chunk[] = [];
    const leftX = point.x - 1;
    const rightX = point.x + 1;
    const upY = point.y - 1;
    const downY = point.y + 1;
    if (upY >= 0) {
      // up
      neighbors.push(this.getChunk({ x: point.x, y: upY }));
    }

    if (leftX >= 0) {
      // left
      neighbors.push(this.getChunk({ x: leftX, y: point.y }));

      if (upY >= 0) {
        // left up
        neighbors.push(this.getChunk({ x: leftX, y: upY }));
      }

      if (downY < this.rows) {
        //left down
        neighbors.push(this.getChunk({ x: leftX, y: downY }));
      }

    }

    if (rightX < this.columns) {
      // right
      neighbors.push(this.getChunk({ x: rightX, y: point.y }));
      if (upY >= 0) {
        // right up
        neighbors.push(this.getChunk({ x: rightX, y: upY }));
      }
      if (downY < this.rows) {
        //right down
        neighbors.push(this.getChunk({ x: rightX, y: downY }));
      }
    }

    if (downY < this.rows) {
      //right down
      neighbors.push(this.getChunk({ x: point.x, y: downY }));
    }
    return neighbors;
  }

  pickRandom(max: number) {
    return Math.round(Math.random() * (max - 0) + 0);
  }

  printPath() {
    let current: Chunk = this.goalChunk_;
    while (current !== this.startChunk_) {
      current.state = ChunkState.PATH
      current = current.parent
    }
    this.reDraw()
  }
}
