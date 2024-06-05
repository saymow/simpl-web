import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray, isInteger } from "../helpers";

class Insert extends SysCall {
  public arity(): number {
    return 3;
  }

  public async call(_: System, args: Value[]): Promise<void> {
    const [arr, idx, value] = args;

    if (!isArray(arr)) {
      throw new CoreLibError("Expected array.");
    }
    if (!isInteger(idx)) {
      throw new CoreLibError("Index must be an integer.");
    }
    if (idx < 0 || idx > arr.length) {
      throw new CoreLibError("Index out of bounds.");
    }

    arr.splice(idx, 0, value);
  }
}

export default Insert;
