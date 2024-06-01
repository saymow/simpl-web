import { Value } from "../expr";
import { SysCall, System } from "../interfaces";
import { LibraryError } from "../errors";

class MyString extends SysCall {
  public arity(): number {
    return 1;
  }

  public async call(system: System, args: Value[]) {
    const value = args[0];

    if (value === undefined || value === null) {
      throw new LibraryError("Cannot cast 'nil' to string.");
    }

    return value.toString();
  }
}

export default MyString;
