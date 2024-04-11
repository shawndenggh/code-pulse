export class User {
    private readonly _id: string;
    private readonly _name: string;

    constructor(id: string, name: string) {
        this._id = id;
        this._name = name;
    }

    get name() {
        return this._name;
    }


    get id(): string {
        return this._id;
    }
}