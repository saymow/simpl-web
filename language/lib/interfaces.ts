import { Expr, Value } from "./expr";

export interface WithVariableResolution {
  resolve: (expr: Expr, depth: number) => void;
}

export interface System {
  input(): Promise<string>;
  log(message?: string | number): void;
  clear(): void;
}

export abstract class Callable {
  public abstract arity(): number;
}

export abstract class SysCall extends Callable {
  public abstract call(system: System, args: Value[]): Promise<Value>;
}

export abstract class UserCall extends Callable {
  public abstract call(interpreter: any, args: Value[]): Promise<Value>;
}
