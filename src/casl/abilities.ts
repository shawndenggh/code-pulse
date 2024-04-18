import { AbilityBuilder, CreateAbility, MongoAbility, createAliasResolver, createMongoAbility } from '@casl/ability';

class Team {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

class Role {
  id: number;
  name: string;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

class User {
  id: number;
  isAdmin: boolean;

  constructor(id: number, isAdmin: boolean) {
    this.id = id;
    this.isAdmin = isAdmin;
  }

  async getTeams(): Promise<Team[]> {
    return Promise.resolve([new Team(1, 'HR')]);
  }

  async getRoles(): Promise<Role[]> {
    return Promise.resolve([new Role(1, 'Sales')]);
  }

  async getPrivilege(nodeId: string): Promise<Privilege> {
    const memberships = await loadMemberships(nodeId);
    const teams = await this.getTeams();
    const roles = await this.getRoles();
    const ids = [this.id, ...teams.map((t) => t.id), ...roles.map((r) => r.id)];
    const privileges = memberships.filter((m) => ids.includes(m.userId)).map((m) => m.privilege);
    // const privileges = permissions.filter((p) => p.userId === this.id && p.nodeId === nodeId);
    return Promise.resolve(privileges[0]);
  }
}

class Node {
  id: string;
  sharing: boolean;

  constructor(id: string, sharing: boolean) {
    this.id = id;
    this.sharing = sharing;
  }
}

class Permission {
  userId: number;
  nodeId: string;
  privilege: Privilege;

  constructor(userId: number, nodeId: string, privilege: Privilege) {
    this.userId = userId;
    this.nodeId = nodeId;
    this.privilege = privilege;
  }
}

async function loadMemberships(nodeId: string): Promise<Permission[]> {
  const privileges = permissions.filter((p) => p.nodeId === nodeId);
  // const output: Record<string, Privilege> = {};
  // privileges.forEach((p) => {
  //   output[p.userId] = p.privilege;
  // });
  return Promise.resolve(privileges);
}

class Database {
  // user_id => privilege
  privileges: Record<number, Privilege>;

  constructor(privileges: Record<number, Privilege>) {
    this.privileges = privileges;
  }
}

function and(...args: boolean[]) {
  return args.every(Boolean);
}

function or(...args: boolean[]) {
  return args.some(Boolean);
}

// const nodeActions = ['all', 'read', 'create', 'edit', 'update', 'delete', 'move', 'export'];

type NodeActions = 'all' | 'read' | 'create' | 'edit' | 'update' | 'delete' | 'move' | 'export';
type DatabaseActions = 'read' | 'update' | 'delete';

type Actions = NodeActions | DatabaseActions;
type Subjects = typeof Node | Node | typeof Database | Database;

// const actions = ['update', 'manage', 'invite'] as const;
// const subjects = ['User', 'all'] as const;
// type AppAbilities = [(typeof actions)[number], (typeof subjects)[number] | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>];

type AppAbility = MongoAbility<[Actions, Subjects]>;
const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

type DefinePermissions = (user: User, builder: AbilityBuilder<AppAbility>) => void;
type Privilege = 'FULL_ACCESS' | 'CAN_EDIT' | 'CAN_VIEW';

const rolePermissions: Record<Privilege, DefinePermissions> = {
  CAN_VIEW(user, { can }) {
    can('read', Node);
  },
  CAN_EDIT(user, { can }) {
    can('edit', Node);
  },
  FULL_ACCESS(user, { can }) {
    // 判断privileges中是否有user.id,并且权限为FULL_ACCESS
    can('all', Node);
  },
};

const resolveAction = createAliasResolver({
  edit: ['update', 'read'],
  all: ['create', 'edit', 'delete', 'move', 'export'],
});

async function defineAbilityFor(user: User, nodeId: string): Promise<AppAbility> {
  const builder = new AbilityBuilder(createAppAbility);

  // if user is admin, give full access
  if (user.isAdmin) {
    builder.can('all', Node);
    return builder.build({ resolveAction });
  }

  // fetch this user's team and role
  // const teams = await user.getTeams();
  // const roles = await user.getRoles();

  // fetch node's privilege for this user
  const privilege = await user.getPrivilege(nodeId);

  if (typeof rolePermissions[privilege] === 'function') {
    rolePermissions[privilege](user, builder);
  } else {
    throw new Error(`Trying to use unknown role "${privilege}"`);
  }

  return builder.build({ resolveAction });
}

// test

const teams: Record<string, Team> = {
  hr: new Team(1, 'HR'),
  dev: new Team(2, 'Dev'),
  product: new Team(3, 'Product'),
};

const roles: Record<string, Role> = {
  sales: new Role(1, 'Sales'),
  market: new Role(2, 'Market'),
};

const users: Record<string, User> = {
  shawn: new User(1, true),
  kelvin: new User(2, false),
  benson: new User(3, false),
};

// equal same as in permission table in database
const permissions: Permission[] = [
  new Permission(1, 'table-1', 'FULL_ACCESS'),
  new Permission(2, 'table-1', 'CAN_EDIT'),
  new Permission(3, 'table-1', 'CAN_VIEW'),
];

const shawn = users.shawn;
const kelvin = users.kelvin;
const benson = users.benson;

const target = new Node('table-1', false);

function serialize(ability: AppAbility, target: Node | Database): Record<string, boolean> {
  const output: Record<string, boolean> = {};
  ability.rules
    .filter((rule) => rule.subject === target.constructor)
    .forEach((rule) => {
      // console.log(rule.action);
      if (typeof rule.action !== 'string') {
        rule.action.forEach((action) => {
          // console.log(`action: ${action} - ${ability.can(action, target)}`);
          output[action] = ability.can(action, target);
        });
      } else {
        // console.log(`action: ${rule.action} - ${ability.can(rule.action, target)}`);
        const canDo = ability.can(rule.action, target);
        output[rule.action] = canDo;
        resolveAction(rule.action).forEach((subAction) => {
          // console.log(`subAction: ${subAction}`);
          output[subAction] = canDo;
        });
      }
    });
  // iterate Actions
  return output;
}

console.log(`Shawn`);
const abilityForShawn = await defineAbilityFor(shawn, target.id);
console.log(serialize(abilityForShawn, target));

console.log(`Kelvin`);
const abilityForKelvin = await defineAbilityFor(kelvin, target.id);
console.log(serialize(abilityForKelvin, target));

console.log(`Benson`);
const abilityForBenson = await defineAbilityFor(benson, target.id);
console.log(serialize(abilityForBenson, target));
