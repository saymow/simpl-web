import { UserCall } from "./interfaces";
import { FunctionStmt } from "./stmt";
import Context from "./context";

export class ReturnValue<T> {
  constructor(public value: T) {}
}

class Function<T> extends UserCall {
  constructor(public closure: Context<T>, public declaration: FunctionStmt) {
    super();
  }

  public arity(): number {
    return this.declaration.parameters.length;
  }

  public async call(interpreter: any, args: any[]) {
    const context = new Context<T>(this.closure);

    for (let idx = 0; idx < this.arity(); idx++) {
      context.define(this.declaration.parameters[idx].literal, args[idx]);
    }

    try {
      await interpreter.executeBlock(this.declaration.body, context);
    } catch (errOrReturnValue) {
      if (errOrReturnValue instanceof ReturnValue) {
        return errOrReturnValue.value;
      }

      throw errOrReturnValue;
    }
  }
}

export default Function;
