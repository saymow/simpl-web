import { Value } from "./expr";

export class VariableNotFound extends Error {}

class Context {
  private readonly keywords = new Map<string, Value>();

  constructor(public enclosing?: Context) {}

  assign(name: string, value: Value) {
    if (this.keywords.has(name)) {
      return false;
    }

    this.keywords.set(name, value);

    return true;
  }

  get(name: string): Value {
    if (!this.keywords.has(name)) {
      if (!this.enclosing) {
        throw new VariableNotFound()
      }

      return this.enclosing.get(name);
    };

    return this.keywords.get(name);
  }
}

export default Context;
