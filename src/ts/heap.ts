import { Chunk } from "./chunk";

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


  getParent(index: number): T {
    return this.items_[Math.floor((index - 1) / 2)];
  }

  getLeftChild(index: number): T {
    return this.items_[(2 * index) + 1];
  }

  getRightChild(index: number): T {
    return this.items_[(2 * index) + 2];
  }

  getIndex(item: T): number {
    return this.items_.indexOf(item);
  }

  getItem(index: number): T {
    return this.items_[index]
  }

  length(){
    return this.items_.length;
  }

  add(item: T): void {
    this.items_.push(item);
    this.sortUp()
  }

  getFirst(): T{
    return this.items_[0];
  }
  
  contains(item:T): boolean{
    return this.items_.includes(item);
  }

  lastItem(): T {
    return this.items_[this.items_.length - 1];
  }

  sortUp() {
    let indexToFind = this.items_.length - 1;
    while (true) {
      let item = this.getItem(indexToFind);
      let parent = this.getParent(indexToFind);

      if (!parent) { return; }

      if (this.compare(item, parent)) {
        this.swap(item, parent)
      } else {
        indexToFind = this.getIndex(parent);
      }
    }
  }

  swap(a: T, b: T) {
    const indexA = this.getIndex(a);
    const indexB = this.getIndex(b);
    [this.items_[indexA], this.items_[indexB]] = [this.items_[indexB], this.items_[indexA]]
  }

  removeRoot() {
    //set last item as first
    let newRoot = this.lastItem()
    this.items_[0] = newRoot;

    // remove last item
    this.items_.pop();

    //sort 
    while (true) {
      const tst = newRoot as unknown as Chunk;
      console.log('current final cost' ,tst.x , tst.y, '|',tst.finalCost);
      const leftChild = this.getLeftChild(this.getIndex(newRoot));
      const rightChild = this.getRightChild(this.getIndex(newRoot));
      if (!leftChild && !rightChild) { return;}
      console.log(leftChild, rightChild)

      const smaller = this.compare(leftChild,rightChild) ? leftChild : rightChild;
      console.log(smaller, newRoot)
      if (this.compare(smaller, newRoot)) {
        this.swap(smaller, newRoot)
      } else {
        return
      }
    }
  }

}