import {Node} from "../model/node";
import {createMongoAbility} from "@casl/ability";
import {Unit} from "../model/unit";

export type Actions = "create" | "read" | "update" | "delete";

export type Subjects = typeof Unit | Unit | typeof Node | Node;

export const ability = createMongoAbility<[Actions, Subjects]>();