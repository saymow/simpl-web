import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isArray } from "./helpers";

class IndexOf extends SysCall {
  public arity(): number {
    return 2;
  }

  public async call(system: System, args: Value[]): Promise<Value> {
    const [arr, value] = args;

    if (!isArray(arr)) {
      throw new CoreLibError("Expected array.");
    }

    return arr.indexOf(value);
  }
}

export default IndexOf;