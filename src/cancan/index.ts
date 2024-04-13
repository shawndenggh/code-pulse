import CanCan from 'cancan';
import { Unit } from './model/unit';

const cancan = new CanCan();
const { allow, can, cannot, authorize, abilities } = cancan;

class User {
  private readonly _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}
class Article {
  private readonly _name: string;

  constructor(name: string) {
    this._name = name;
  }

  get name() {
    return this._name;
  }
}

const user1 = new User('shawn');

allow(User, 'read', Article);

const user = new User('shawn');
const article = new Article('Animal');

const canRead = can(user, 'read', article);
console.log(`canRead: ${canRead}`);

const canEdit = can(user, 'edit', article);
console.log(`canEdit: ${canEdit}`);
