import {Permission, Unit} from "./unit";

export class Team extends Unit{
    private readonly _id: string;
    private readonly _name: string;
    private readonly _permission: Permission;

    constructor(id: string, name: string, permission: Permission) {
        super();
        this._id = id;
        this._name = name;
        this._permission = permission;
    }

    get id(): string {
        return this._id;
    }

    get name() {
        return this._name;
    }

    permission(): Promise<Permission> {
        return Promise.resolve(this._permission);
    }
}