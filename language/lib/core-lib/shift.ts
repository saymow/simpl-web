import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray } from "../helpers";

class Shift extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(_: System, args: Value[]): Promise<Value> {
    const value = args[0];

    if (!isArray(value)) {
      throw new CoreLibError("Expected array.");
    }
    if (value.length === 0) {
      throw new CoreLibError("Cannot shift empty array.");
    }

    return value.shift();
  }
}

export default Shift;
