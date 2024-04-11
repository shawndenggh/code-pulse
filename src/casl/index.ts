import defineAbilityFor from './acl/node-acl';
import {Node} from "./model/node";
import {Member} from "./model/member";
import {Permission} from "./model/unit";

const unit = new Member("1", "admin", Permission.READ);
const ability = defineAbilityFor(unit);

const node = new Node("unknown-file");

const canReadFile = ability.can("read", node);

console.log(`canReadFile: ${canReadFile}`)

const canUpdateFile = ability.can("update", node);

console.log(`canUpdateFile: ${canUpdateFile}`)
