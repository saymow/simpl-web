import { Expr } from "./expression";

class Stmt {}

class ExprStmt extends Stmt {
  constructor(public expr: Expr) {
    super();
  }
}

class BlockStmt extends Stmt {
  constructor(public stmts: Stmt[]) {
    super();
  }
}

class PrintStmt extends Stmt {
    constructor(public expr: Expr) {
      super();
    }
  }

export { Stmt, ExprStmt, BlockStmt, PrintStmt };
