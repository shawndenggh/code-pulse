import CanCan from 'cancan';

const cancan = new CanCan();
const {allow, can, cannot, authorize} = cancan;

class User{}
class Article{}

allow(User, 'read', Article);

const user = new User();
const article = new Article();

const canRead = can(user, 'read', article);
console.log(`canRead: ${canRead}`);

const canEdit = can(user, 'edit', article);
console.log(`canEdit: ${canEdit}`);