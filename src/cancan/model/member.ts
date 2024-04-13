import { Team } from './team';
import { Unit } from './unit';

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

  get isAdmin() {
    return true;
  }

  get isGuest() {
    return false;
  }
}
