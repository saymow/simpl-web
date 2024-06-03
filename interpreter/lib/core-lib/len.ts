import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";

class Len extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (!(value instanceof Array || typeof value === "string")) {
      throw new CoreLibError("Value must be string or array.");
    }

    return value.length;
  }
}

export default Len;
