import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray, isString } from "./helpers";

class Len extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (!(isArray(value) || isString(value))) {
      throw new CoreLibError("Expected string or array.");
    }

    return value.length;
  }
}

export default Len;
