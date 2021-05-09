import { Chunk } from "./chunk";
import { Point } from "./point";

export class Grid {
  public body_: Chunk[][];
  private columns_: number;
  private rows_: number;
  private ctx:CanvasRenderingContext2D;

  constructor([columns, rows]: [number, number],ctx: CanvasRenderingContext2D) {
    this.columns_ = columns;
    this.rows_ = rows;
    this.ctx = ctx;
    this.body_ = this.emptyBoard();
  }

  private emptyBoard(): Chunk[][] {
    return Array.from(Array(this.rows_), (_, index) => this.newLine(index))
  }

  private newLine(y: number): Chunk[] {
    return Array.from(Array(this.columns_), (_, index) => new Chunk(index, y, this.ctx));
  }

  get body(): Chunk[][] {
    return this.body
  }

  get rows(): number {
    return this.rows_
  }

  get columns(): number {
    return this.columns_
  }

  getChunk(p: Point) {
    return this.body_[p.y][p.x]
  }
}