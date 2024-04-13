import { Member } from './model/member';
import { Node } from './model/node';
import { _abilities, _can, _cannot, _authorize } from './acl/cancan';
import './acl/node';

export const authorize: typeof _authorize = _authorize;

export const can = _can;

export const cannot = _cannot;

export const abilities = _abilities;

const member = new Member('1', 'shawn');
const node = new Node('node-1');

export const toVO = (unit: Member, target: Node) => {
  const output: Record<string, boolean> = {};

  abilities.forEach((ability) => {
    if (unit instanceof ability.model && target instanceof ability.target) {
      let hasPrivilege = true;

      try {
        hasPrivilege = can(unit, ability.action, target);
      } catch (err) {
        hasPrivilege = false;
      }

      output[ability.action] = hasPrivilege;
    }
  });
  return output;
};

const canCreate = can(member, 'createNode', node);
console.log(`canRead: ${canCreate}`);

const canEdit = can(member, 'updateNode', node);
console.log(`canEdit: ${canEdit}`);

const privilegeVO = toVO(member, node);
console.log(privilegeVO);
