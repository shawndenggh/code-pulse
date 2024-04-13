export type NodeAction = 'createNode' | 'readNode' | 'updateNode' | 'deleteNode' | 'exportNode';
export type TeamAction = 'createTeam' | 'readTeam' | 'updateTeam' | 'deleteTeam';

export type Action = NodeAction & TeamAction;

export enum Permission {
  READ = 'READ',
  EDIT = 'EDIT',
  FULL_ACCESS = 'FULL_ACCESS',
}
