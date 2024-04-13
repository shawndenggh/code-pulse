import { Member } from "./member";
import { Unit } from "./unit";

export class Team extends Unit {
  private readonly _name: string;

  constructor(id: string, name: string) {
    super(id);
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get members(): Member[] {
    return [];
  }
}
