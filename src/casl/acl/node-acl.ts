import { defineAbility } from '@casl/ability';
import { Unit } from '../model/unit';

export default (unit: Unit) =>
  defineAbility((can) => {
    const isAdmin = unit.isAdmin();

    if (isAdmin) {
      can('manage', 'all');
    }

    can('read', 'Node', {
      permission: unit.permission(),
    });
    can('update', 'Node', { authorId: unit.id });
    can('create', 'Node');
    can('delete', 'Node', { authorId: unit.id });
  });
