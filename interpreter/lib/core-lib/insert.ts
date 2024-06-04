import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray, isNumber } from "./helpers";

class Insert extends SysCall {
  public arity(): number {
    return 3;
  }

  public async call(system: System, args: Value[]): Promise<void> {
    const [arr, idx, value] = args;

    if (!isArray(arr)) {
      throw new CoreLibError("Expected array.");
    }
    if (!isNumber(idx)) {
      throw new CoreLibError("Index must be a number.");
    }
    if (idx > value.length) {
      throw new CoreLibError("Index out of bounds");
    }

    arr.splice(idx, 0, value);
  }
}

export default Insert;
