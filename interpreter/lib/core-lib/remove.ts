import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray, isInteger, isNumber } from "./helpers";

class Remove extends SysCall {
  public arity(): number {
    return 2;
  }

  public async call(system: System, args: Value[]): Promise<void> {
    const [arr, idx] = args;

    if (!isArray(arr)) {
      throw new CoreLibError("Expected array.");
    }
    if (!isInteger(idx)) {
      throw new CoreLibError("Index must be an integer.");
    }
    if (idx < 0 || idx >= arr.length) {
      throw new CoreLibError("Index out of bounds.");
    }

    arr.splice(idx, 1);
  }
}

export default Remove;
