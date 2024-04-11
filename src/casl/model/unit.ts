export enum Permission {
    READ = "READ",
    EDIT = "EDIT",
    FULL_ACCESS = "FULL_ACCESS",
}

export abstract class Unit {

    abstract get id(): string;

    abstract get name(): string;

    abstract permission(): Promise<Permission>;

    isAdmin(): boolean {
        return true;
    }
}