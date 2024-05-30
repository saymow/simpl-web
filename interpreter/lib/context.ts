import { Value } from "./expr";
import Token from "./token";

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
    return this.keywords.get(name);
  }
}

export default Context;
