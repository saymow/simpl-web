import { Value } from "./expr";

export class VariableNotFound extends Error {}

class Context {
  private readonly keywords = new Map<string, Value>();

  assign(name: string, value: Value) {
    if (this.keywords.has(name)) {
      return false;
    }

    this.keywords.set(name, value);

    return true;
  }

  get(name: string) {
    if (!this.keywords.has(name)) throw new VariableNotFound();
    return this.keywords.get(name);
  }
}

export default Context;
