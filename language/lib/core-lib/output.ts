import { CoreLibError } from "../errors";
import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { isString, isNumber } from "../helpers";

class Output extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    let text = args[0];
    
    if (!isString(text)) {
      if (!isNumber(text)) {
        throw new CoreLibError("Expected string or number.");
      }

      text = text.toString();
    }

    return system.log(text);
  }
}

export default Output;
