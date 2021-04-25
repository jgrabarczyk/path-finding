import { Chunk, ChunkState } from "./chunk";

export interface Point {
  x: number
  y: number
}

export class Board {
  columns: number;
  rows: number;
  body: Chunk[][];

  private start_!: Point;
  private goal_!: Point;

  constructor(size: [number, number]) {
    this.columns = size[0];
    this.rows = size[1];
    this.body = this.emptyBoard();
  }

  setStart(point: Point): void {
    this.start_ = point;
    this.body[point.y][point.x].state = ChunkState.START;

  }

  setGoal(point: Point): void {
    this.goal_ = point;
    this.body[point.y][point.x].state = ChunkState.GOAL;
  }

  calcDistanceToGoal(current?: Point) {
    const first: Point = current ? current : this.start_;
    const second: Point = this.goal_;

    return Math.sqrt(Math.pow((second.x - first.x), 2) + Math.pow((second.y - first.y), 2))
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
    return (Math.random() > 0.85
      && !this.isGoalPoint(x, y)
      && !this.isStartPoint(x, y)
    )
  }

  private isGoalPoint(x: number, y: number): boolean {
    return y === this.goal_?.y && this.goal_?.x === x;
  }

  private isStartPoint(x: number, y: number): boolean {
    return y === this.start_?.y && this.start_?.x === x;
  }

  private emptyBoard = () => Array.from(Array(this.rows), (v: any, index) => this.newLine(index))
  
  private newLine = (y: number) => Array.from(Array(this.columns), (v: any, index) => new Chunk(index, y));
}
