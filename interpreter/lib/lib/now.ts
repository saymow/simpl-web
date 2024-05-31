import { Callable } from "../interfaces";

class Now extends Callable {
  public arity(): number {
    return 0;
  }

  public call(_: any, __: any[]) {
    return new Date().getTime();
  }
}

export default Now;
