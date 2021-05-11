export type Sort<T> = (a: T, b: T) => boolean;

export class Heap<T> {
  private items_!: T[];

  get items(): T[] {
    return this.items_;
  }
  set items(newItems: T[]) {
    this.items_ = newItems;
  }

  constructor(
    private compare: Sort<T>,
  ) {
    this.items_ = [];
  }

  size(): number {
    return this.items_.length;
  }

  contains(item: T): boolean {
    return this.items_.includes(item);
  }

  getFirst(): T {
    return this.items_[0];
  }

  add(item: T): void {
    this.items_.push(item);
    this.sortUp();
  }

  // bad
  public removeRoot(): void {
    const newRoot = this.items_[this.items_.length - 1];
    this.items_[0] = newRoot;
    this.items_.pop();

    while (true) {
      const leftChild = this.getLeftChild(this.getIndex(newRoot));
      const rightChild = this.getRightChild(this.getIndex(newRoot));
      let smallerChild: T;

      if (leftChild) {
        if (rightChild) {
          smallerChild = this.compare(leftChild, rightChild) ? leftChild : rightChild;
        } else {
          smallerChild = leftChild;
        }
      } else if (rightChild) {
        smallerChild = rightChild;
      } else {
        return;
      }

      if (this.compare(smallerChild, newRoot)) {
        this.swap(smallerChild, newRoot);
      } else {
        return;
      }
    }
  }




  private getLeftChild(child: number | T): T {
    const i = Number.isInteger(child) ? child as number : this.getIndex(child as T);
    return this.items_[(2 * i) + 1];
  }

  private getRightChild(child: number | T): T {
    const i = Number.isInteger(child) ? child as number : this.getIndex(child as T);
    return this.items_[(2 * i) + 2];
  }

  private getIndex(item: T): number {
    return this.items_.indexOf(item);
  }

  private sortUp(): void {
    let indexToFind = this.items_.length - 1;
    while (true) {
      const item = this.items_[indexToFind];
      const parent = this.items_[Math.floor((indexToFind - 1) / 2)];

      if (!parent) { return; }

      if (this.compare(item, parent)) {
        this.swap(item, parent);
      } else {
        indexToFind = this.getIndex(parent);
      }
    }
  }

  private swap(a: T, b: T): void {
    const indexA = this.getIndex(a);
    const indexB = this.getIndex(b);
    [this.items_[indexA], this.items_[indexB]] = [this.items_[indexB], this.items_[indexA]];
  }

}
