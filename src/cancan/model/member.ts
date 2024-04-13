import { Team } from "./team";
import { Unit } from "./unit";

export class Member extends Unit {
  private readonly _name: string;

  constructor(id: string, name: string) {
    super(id);
    this._name = name;
  }

  get name() {
    return this._name;
  }

  get teams(): Team[] {
    return [];
  }
}
