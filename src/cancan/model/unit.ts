import { Permission } from './types';

export abstract class Unit {
  protected _id: string;
  constructor(id: string) {
    this._id = id;
  }
  get id(): string {
    return this._id;
  }
  abstract get name(): string;

  get permission(): Permission {
    return Permission.READ;
  }
}
