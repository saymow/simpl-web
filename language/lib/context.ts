import { Value } from "./expr";

export class VariableNotFound extends Error {}

class Context<T> {
  private readonly keywords = new Map<string, T>();

  constructor(public enclosing?: Context<T>) {}

  define(name: string, value: Value) {
    this.keywords.set(name, value);
  }

  assign(name: string, value: Value) {
    if (this.keywords.has(name)) {
      this.keywords.set(name, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new VariableNotFound();
  }

  get(name: string): Value {
    if (!this.keywords.has(name)) {
      if (!this.enclosing) {
        throw new VariableNotFound();
      }

      return this.enclosing.get(name);
    }

    return this.keywords.get(name);
  }
}

export default Context;
