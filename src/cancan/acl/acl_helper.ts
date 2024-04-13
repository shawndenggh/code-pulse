import { Permission } from '../model/types';

export class AclHelper {
  /**
   * List of all privilege in order from lowest to highest.
   */
  private static privileges = [Permission.READ, Permission.EDIT, Permission.FULL_ACCESS];

  static isHigher(privilege: Permission, otherPrivilege: Permission): boolean {
    return this.privileges.indexOf(privilege) > this.privileges.indexOf(otherPrivilege);
  }

  static isLower(privilege: Permission, otherPrivilege: Permission): boolean {
    return this.privileges.indexOf(privilege) < this.privileges.indexOf(otherPrivilege);
  }
}
