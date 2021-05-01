import { Chunk } from "./chunk";
import { Point } from "./point";

export class Grid {
  public body_: Chunk[][];
  private columns_: number;
  private rows_: number;
  constructor(size: [number, number]) {
    this.columns_ = size[0]
    this.rows_ = size[0]
    this.body_ = this.emptyBoard()
  }
  private emptyBoard = () => Array.from(Array(this.rows_), (v: any, index) => this.newLine(index))
  private newLine = (y: number) => Array.from(Array(this.columns_), (v: any, index) => new Chunk(index, y));

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