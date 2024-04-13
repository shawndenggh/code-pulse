import { Unit } from './model/unit';
import compact from 'lodash/compact';

type ACL = {
  id: string;
  privileges: Record<string, boolean>;
};

function presentAcl(unit: Unit, objects: (Record<string, any> | null)[]): ACL[] {
  const { toVO } = require('./acl');

  return compact(objects).map((object) => ({
    id: object.id,
    privileges: toVO(unit, object),
  }));
}

export default presentAcl;
