import CanCan from 'cancan';

class MyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MyError';
  }
}

const cancan = new CanCan({ createError: () => new MyError('Permission denied') });

export const _can = cancan.can;

export const _authorize = cancan.authorize;

export const _cannot = cancan.cannot;

export const _abilities = cancan.abilities;

export const allow = cancan.allow;
