import { Value } from "../expr";
import { SysCall, System } from "../interfaces";

class Input extends SysCall {
  public arity(): number {
    return 0;
  }

  public async call(system: System, _: Value[]) {
    return system.input();
  }
}

export default Input;
