import { Member } from '../model/member';
import { allow, _can as can } from './cancan';
import { Node } from '../model/node';
import { and, isCreator } from './helper';

allow(Member, 'createNode', Node, (member, node) => and(isCreator(member, node), member.isAdmin));

allow(Member, 'readNode', Node);

allow(Member, 'updateNode', Node);
