import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { CoreLibError } from "../errors";
import { isNumber } from "./helpers";

class MyString extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (!isNumber(value)) {
      throw new CoreLibError("Expected number.");
    }

    return value.toString();
  }
}

export default MyString;
