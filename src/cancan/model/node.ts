export class Node {
  constructor(id: string) {
    this._id = id;
  }

  private _id: string;

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this.id;
  }

  get userId(): string {
    return '2';
  }
}
