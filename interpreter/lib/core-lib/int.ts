import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";

class Int extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (value === undefined || value === null) {
      throw new CoreLibError("Cannot cast 'nil' to integer.");
    }

    return parseInt(value);
  }
}

export default Int;
