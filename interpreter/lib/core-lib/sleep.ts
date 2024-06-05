import { CoreLibError } from "../errors";
import { Value } from "../expr";
import { isNumber } from "../helpers";
import { SysCall, System } from "../interfaces";

class Sleep extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (!isNumber(value)) {
      throw new CoreLibError("Expected a number.");
    }

    return new Promise((resolve) => {
      setTimeout(resolve, value);
    });
  }
}

export default Sleep;
