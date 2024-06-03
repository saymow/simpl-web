import { Value } from "../expr";
import { SysCall, System } from "../interfaces";

class Output extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const text = args[0];
    return system.log(text);
  }
}

export default Output;
