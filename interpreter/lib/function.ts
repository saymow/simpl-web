import { Callable } from "./interfaces";
import { FunctionStmt } from "./stmt";
import Context from "./context";

class Function<T> extends Callable {
  constructor(public closure: Context<T>, public declaration: FunctionStmt) {
    super();
  }

  public arity(): number {
    return this.declaration.parameters.length;
  }

  public call(interpreter: any, args: any[]) {
    const context = new Context<T>(this.closure);

    for (let idx = 0; idx < this.arity(); idx++) {
      context.define(this.declaration.parameters[idx].literal, args[idx]);
    }

    interpreter.executeBlock(this.declaration.body, context);
  }
}

export default Function;
