import { Value } from "../expr";
import { isTruthy } from "../helpers";
import { SysCall, System } from "../interfaces";

class Boolean extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    return isTruthy(args[0]);
  }
}

export default Boolean;
