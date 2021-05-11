import { BoardAbstract, BoardI } from './board-abstract';
import { Chunk, ChunkState } from './chunk';
import { Heap, Sort } from './heap';

export class BoardHeap extends BoardAbstract {
  private heap_ = new Heap<Chunk>(this.sortByCost as Sort<Chunk>);

  constructor(canvas: HTMLCanvasElement, board: BoardI) {
    super(canvas, board);
  }

  public async findPath(): Promise<void> {
    const start = new Date().getTime();
    this.heap_.add(this.start);

    while (this.heap_.size()) {
      await this.reDraw();

      this.currentChunk_ = this.heap_.getFirst();
      this.heap_.removeRoot();

      this.addCurrentToClosedChunks();

      if (this.isGoalChunk(this.currentChunk_)) {
        const stop = new Date().getTime() - start;
        console.log('stop heap:', stop);
        this.finish();
        return;
      }

      this.findNeighboursOfCurrent().forEach(neighbor => {
        if (this.isObstacleOrIsClosed(neighbor)) { return; }

        neighbor.state = ChunkState.OPEN;
        this.addChunkToRedraw(neighbor);

        if (this.newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor)) { return; }

        this.setNewCostAndParent(neighbor);

        if (this.heap_.contains(neighbor)) { return; }

        this.heap_.add(neighbor);
      });
    }
  }

  protected sortByCost(a: Chunk, b: Chunk): boolean {
    return (a.finalCost < b.finalCost) || (a.finalCost === b.finalCost && a.goalCost < b.goalCost);
  }

  protected newCostIsNotBetterAndIsAlreadyInOpenChunks(neighbor: Chunk): boolean {
    return neighbor.homeCost <= this.getNewHomeCost(neighbor) && this.heap_.contains(neighbor);
  }


}
