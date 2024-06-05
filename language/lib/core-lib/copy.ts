import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray } from "../helpers";

class Copy extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(_: System, args: Value[]): Promise<Value> {
    const value = args[0];

    if (!isArray(value)) {
      throw new CoreLibError("Expected array.");
    }

    return value.slice();
  }
}

export default Copy;
