import { LibraryError } from "../errors";
import { Value } from "../expr";
import { SysCall, System } from "../interfaces";

class MyNumber extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (value === undefined || value === null) {
      throw new LibraryError("Cannot cast 'nil' to string.");
    }

    return parseFloat(value);
  }
}

export default MyNumber;
