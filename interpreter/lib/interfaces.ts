import { Value } from "./expr";

export interface System {
  log(message?: string | number): void;
  error(message: string): void;
}

export abstract class Callable {
  public abstract arity(): number;
  public abstract call(interpreter: any, args: Value[]): Value;
}
