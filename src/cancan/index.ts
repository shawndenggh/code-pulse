import { toVO } from './acl';
import { Member } from './model/member';
import { Node } from './model/node';

const member = new Member('1', 'shawn');
const node = new Node('node-1');

const privilegeVO = toVO(member, node);
console.log(privilegeVO);
