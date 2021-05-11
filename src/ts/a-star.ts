import { BoardAbstract, BoardI } from './board-abstract';
import { Chunk, ChunkState } from './chunk';

export class AStar extends BoardAbstract {
  private openChunks_: Chunk[] = [];

  constructor(canvas: HTMLCanvasElement, board: BoardI) {
    super(canvas, board);
  }

  public async findPath(): Promise<void> {
    const start = new Date().getTime();
    this.openChunks_.push(this.start);

    while (this.openChunks_.length) {
      await this.reDraw();

      this.currentChunk_ = this.findLowestCostInOpen();
      this.removeCurrentFromOpen();

      this.addCurrentToClosedChunks();

      if (this.isGoalChunk(this.currentChunk_)) {
        const stop = new Date().getTime() - start;
        console.log('stop:', stop);
        this.finish();
        return;
      }

      this.findNeighboursOfCurrent().forEach(neighbor => {
        if (this.isObstacleOrIsClosed(neighbor)) { return; }

        if (!this.isStartOrFinish(neighbor)) {
          neighbor.state = ChunkState.OPEN;
        }

        this.addChunkToRedraw(neighbor);

        if (this.newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor)) { return; }

        this.setNewCostAndParent(neighbor);

        if (this.openChunks_.includes(neighbor)) { return; }

        this.openChunks_.push(neighbor);
      });
    }
  }

  protected newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor: Chunk): boolean {
    return neighbor.homeCost <= this.getNewHomeCost(neighbor) && this.openChunks_.includes(neighbor);
  }

  private findLowestCostInOpen(): Chunk {
    return this.openChunks_.sort(this.sortByCost)[0];
  }

  protected sortByCost = (a: Chunk, b: Chunk) => {
    return (a.finalCost < b.finalCost) || (a.finalCost === b.finalCost && a.goalCost < b.goalCost) ? -1 : 1;
  }

  private removeCurrentFromOpen(): void {
    const index = this.openChunks_.indexOf(this.currentChunk_);
    if (index !== -1) {
      this.openChunks_.splice(index, 1);
    }
  }
}
