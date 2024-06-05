import { CoreLibError } from "../errors";
import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { isNumber, isString } from "../helpers";

class Input extends SysCall {
  public arity(): number {
    return 0;
  }

  public async call(system: System, _: Value[]) {
    return system.input();
  }
}

export default Input;
