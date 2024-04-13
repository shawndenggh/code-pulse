import { Unit } from '../model/unit';

export function and(...args: boolean[]) {
  return args.every(Boolean);
}

export function or(...args: boolean[]) {
  return args.some(Boolean);
}

/**
 * Check if the actor is the owner of the model.
 *
 * @param actor The actor to check
 * @param model The model to check
 * @returns True if the actor is the owner of the model
 */
export function isCreator(actor: Unit, model: Record<string, any> | null | undefined): boolean {
  if (!model) {
    return false;
  }
  if (!(actor instanceof Unit)) {
    return false;
  }
  if ('userId' in model) {
    return actor.id === model.userId;
  }
  return false;
}
