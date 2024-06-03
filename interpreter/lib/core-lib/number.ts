import { CoreLibError } from "../errors";
import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { isNumber, isString } from "./helpers";

class MyNumber extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (!(isString(value) || isNumber(value))) {
      throw new CoreLibError("Expect string or number.");
    }

    return parseFloat(value);
  }
}

export default MyNumber;
