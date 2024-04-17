import defineAbilityFor from './acl/node-acl';
import { Node } from './model/node';
import { Member } from './model/member';
import { Permission } from './model/unit';

const unit = new Member('1', 'admin', Permission.READ);
const ability = defineAbilityFor(unit);

console.log(ability.rules);

const node = new Node('unknown-file');

ability.rules.forEach((rule) => {
  console.log(rule.action);
  if (typeof rule.action !== 'string') {
    rule.action.forEach((action) => {
      console.log(ability.can(action, node));
    });
  } else {
    console.log(ability.can(rule.action, node));
  }
});

const canReadFile = ability.can('read', node);

console.log(`canReadFile: ${canReadFile}`);

const canUpdateFile = ability.can('update', node);

console.log(`canUpdateFile: ${canUpdateFile}`);
