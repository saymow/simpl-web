import { Expr } from "./expression";

class Stmt {}

class ExprStmt extends Stmt {
  constructor(public expr: Expr) {
    super();
  }
}

export { Stmt, ExprStmt };
