import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray, isInteger, isNumber, isString } from "../helpers";

class Slice extends SysCall {
  public arity(): number {
    return 3;
  }

  public async call(_: System, args: Value[]) {
    let [value, startIdx, endIdx] = args;

    if (!(isString(value) || isArray(value))) {
      throw new CoreLibError("Expected value to be string or array.");
    }
    if (!isInteger(startIdx)) {
      throw new CoreLibError("startIdx must be an integer.");
    }
    if (!(endIdx === null || isInteger(endIdx))) {
      throw new CoreLibError("endIdx must be an integer or nil.");
    }

    return value.slice(startIdx, endIdx !== null ? endIdx : undefined);
  }
}

export default Slice;
