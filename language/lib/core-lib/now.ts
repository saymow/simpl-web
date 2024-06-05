import { Value } from "../expr";
import { SysCall, System } from "../interfaces";

class Now extends SysCall {
  public arity(): number {
    return 0;
  }

  public async call(_: System, __: Value[]) {
    return new Date().getTime();
  }
}

export default Now;
