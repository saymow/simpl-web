import { CoreLibError } from "../errors";
import { Value } from "../expr";
import { SysCall, System } from "../interfaces";

class Abs extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (typeof value !== 'number') {
      throw new CoreLibError("Expected number.");
    }

    return Math.abs(value);
  }
}

export default Abs;
