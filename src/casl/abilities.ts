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
  teams: Team[];
  roles: Role[];

  constructor(id: number, isAdmin: boolean, teams: Team[], roles: Role[]) {
    this.id = id;
    this.isAdmin = isAdmin;
    this.teams = teams;
    this.roles = roles;
  }

  async getTeams(): Promise<Team[]> {
    return Promise.resolve(this.teams);
  }

  async getRoles(): Promise<Role[]> {
    return Promise.resolve(this.roles);
  }

  async getPrivilege(nodeId: string): Promise<Privilege> {
    const memberships = await loadMemberships(nodeId);
    const teams = await this.getTeams();
    const roles = await this.getRoles();
    const ids = [this.id, ...teams.map((t) => t.id), ...roles.map((r) => r.id)];
    // may be user has multiple privileges, so we need to pick the highest one
    const privileges = memberships.filter((m) => ids.includes(m.visitorId)).map((m) => m.privilege);
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
  // user_id | team_id | role_id
  visitorId: number;
  nodeId: string;
  privilege: Privilege;

  constructor(userId: number, nodeId: string, privilege: Privilege) {
    this.visitorId = userId;
    this.nodeId = nodeId;
    this.privilege = privilege;
  }
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

type NodeActions = 'read' | 'create' | 'update' | 'delete' | 'move' | 'export' | 'grant' | 'share';
type DatabaseActions = 'read' | 'update' | 'delete';

type Actions = NodeActions | DatabaseActions;
type Subjects = typeof Node | Node | typeof Database | Database;
// type Subjects = 'Node' | 'Database';

// const actions = ['update', 'manage', 'invite'] as const;
// const subjects = ['User', 'all'] as const;
// type AppAbilities = [(typeof actions)[number], (typeof subjects)[number] | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>];

type AppAbility = MongoAbility<[Actions, Subjects]>;
const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

type DefinePermissions = (user: User, builder: AbilityBuilder<AppAbility>) => void;
type Privilege = 'FULL_ACCESS' | 'CAN_EDIT' | 'CAN_VIEW';

const aclPermissions: Record<Privilege, DefinePermissions> = {
  CAN_VIEW(user, { can, cannot }) {
    cannot('grant', Node);
    cannot('delete', Node);
    cannot('update', Node);
    can('read', Node);
  },
  CAN_EDIT(user, { can, cannot }) {
    cannot('grant', Node);
    cannot('delete', Node);
    can('update', Node);
  },
  FULL_ACCESS(user, { can }) {
    can('delete', Node);
    can('grant', Node);
  },
};

const resolveAction = createAliasResolver({
  read: ['share'],
  update: ['read', 'create'],
  delete: ['update', 'move', 'export'],
});

async function defineAbilityFor(user: User, nodeId: string): Promise<AppAbility> {
  const builder = new AbilityBuilder(createAppAbility);

  // if user is admin, give full access
  if (user.isAdmin) {
    // admin can grant privilege
    builder.can('grant', Node);
    aclPermissions.FULL_ACCESS(user, builder);
    return builder.build({ resolveAction });
  }

  // fetch this user's team and role
  // const teams = await user.getTeams();
  // const roles = await user.getRoles();

  // fetch node's privilege for this user
  const node = await findNode(nodeId);
  const privilege = await user.getPrivilege(nodeId);

  console.log(`current abilities for: ${user.id}, privilege: ${privilege}`);

  if (typeof aclPermissions[privilege] === 'function') {
    aclPermissions[privilege](user, builder);
  } else {
    throw new Error(`Trying to use unknown role "${privilege}"`);
  }

  return builder.build({ resolveAction });
}

// test

const teams: Record<string, Team> = {
  hr: new Team(11, 'HR'),
  dev: new Team(12, 'Dev'),
  product: new Team(3, 'Product'),
};

const roles: Record<string, Role> = {
  sales: new Role(21, 'Sales'),
  market: new Role(22, 'Market'),
};

const users: Record<string, User> = {
  shawn: new User(1, true, [], []),
  kelvin: new User(2, false, [teams.hr, teams.dev], [roles.sales, roles.market]),
  benson: new User(3, false, [teams.product], [roles.market]),
};

const shawn = users.shawn;
const kelvin = users.kelvin;
const benson = users.benson;

const nodes: Node[] = [new Node('table-1', false), new Node('table-2', false), new Node('table-3', false)];

async function findNode(nodeId: string): Promise<Node> {
  const found = nodes.find((n) => n.id === nodeId);
  if (!found) {
    throw new Error(`Node with id ${nodeId} not found`);
  }
  return Promise.resolve(found);
}

// equal same as in permission table in database
const permissions: Permission[] = [
  new Permission(shawn.id, 'table-1', 'FULL_ACCESS'),
  new Permission(kelvin.id, 'table-1', 'CAN_EDIT'),
  new Permission(benson.id, 'table-1', 'CAN_VIEW'),
];

async function loadMemberships(nodeId: string): Promise<Permission[]> {
  const privileges = permissions.filter((p) => p.nodeId === nodeId);
  return Promise.resolve(privileges);
}

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

console.log(`Shawn - Admin and with full_access`);
const abilityForShawn = await defineAbilityFor(shawn, target.id);
console.log(serialize(abilityForShawn, target));

console.log(`Kelvin - not admin and with can_edit`);
const abilityForKelvin = await defineAbilityFor(kelvin, target.id);
console.log(serialize(abilityForKelvin, target));

console.log(`Benson - not admin and with can_view`);
const abilityForBenson = await defineAbilityFor(benson, target.id);
console.log(serialize(abilityForBenson, target));
