import { Unit } from '../model/unit';
import { Node } from '../model/node';
import { _abilities, _can, _cannot, _authorize } from './cancan';
import './node';

export const authorize: typeof _authorize = _authorize;

export const can = _can;

export const cannot = _cannot;

export const abilities = _abilities;

export const toVO = (unit: Unit, target: Node) => {
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
