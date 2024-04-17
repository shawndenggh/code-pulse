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
  role: Roles;
  teams: Team[];
  roles: Role[];

  constructor(id: number, isAdmin: boolean, role: Roles, teams: Team[], roles: Role[]) {
    this.id = id;
    this.isAdmin = isAdmin;
    this.role = role;
    this.teams = teams;
    this.roles = roles;
  }
}

class Node {
  sharing: boolean;
  memberships: Record<number, Roles>;

  constructor(sharing: boolean, memberships: Record<string, Roles>) {
    this.sharing = sharing;
    this.memberships = memberships;
  }
}

function and(...args: boolean[]) {
  return args.every(Boolean);
}

function or(...args: boolean[]) {
  return args.some(Boolean);
}

type Actions = 'all' | 'read' | 'create' | 'edit' | 'update' | 'delete' | 'move' | 'export';
type Subjects = typeof Node | Node;

// const actions = ['update', 'manage', 'invite'] as const;
// const subjects = ['User', 'all'] as const;
// type AppAbilities = [(typeof actions)[number], (typeof subjects)[number] | ForcedSubject<Exclude<(typeof subjects)[number], 'all'>>];

type AppAbility = MongoAbility<[Actions, Subjects]>;
const createAppAbility = createMongoAbility as CreateAbility<AppAbility>;

type DefinePermissions = (user: User, builder: AbilityBuilder<AppAbility>) => void;
type Roles = 'FULL_ACCESS' | 'CAN_EDIT';

const rolePermissions: Record<Roles, DefinePermissions> = {
  CAN_EDIT(user, { can }) {
    can('edit', Node, { memberships: { [user.id]: 'CAN_EDIT' } });
  },
  FULL_ACCESS(user, { can }) {
    can('all', Node, { memberships: { [user.id]: 'FULL_ACCESS' } });
  },
};

const resolveAction = createAliasResolver({
  edit: ['update', 'read'],
  all: ['create', 'edit', 'delete', 'move', 'export'],
});

function defineAbilityFor(user: User): AppAbility {
  const builder = new AbilityBuilder(createAppAbility);

  if (typeof rolePermissions[user.role] === 'function') {
    rolePermissions[user.role](user, builder);
  } else {
    throw new Error(`Trying to use unknown role "${user.role}"`);
  }

  return builder.build({ resolveAction });
}

// test

const hr = new Team(1, 'HR');
const dev = new Team(2, 'Dev');

const sales = new Role(1, 'Sales');

const shawn = new User(1, true, 'FULL_ACCESS', [hr], [sales]);
const kelvin = new User(2, true, 'FULL_ACCESS', [dev], []);

const target = new Node(false, {
  '1': 'CAN_EDIT',
  '2': 'FULL_ACCESS',
});

const ability = defineAbilityFor(shawn);

const canCreate = ability.can('create', target);

console.log(`canCreate: ${canCreate}`);

const canUpdate = ability.can('update', target);

console.log(`canUpdate: ${canUpdate}`);

ability.rules.forEach((rule) => {
  console.log(rule.action);
  console.log(typeof rule.action);
  if (typeof rule.action !== 'string') {
    rule.action.forEach((action) => {
      console.log(`action: ${action} - ${ability.can(action, target)}`);
    });
  } else {
    console.log(`action: ${rule.action} - ${ability.can(rule.action, target)}`);
  }
});
