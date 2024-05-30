import { Expr } from "./expression";

interface StmtVisitor<T> {
  visitExprStmt(stmt: ExprStmt): T;
  visitBlockStmt(stmt: BlockStmt): T;
  visitPrintStmt(stmt: PrintStmt): T;
}

abstract class Stmt {
  public abstract accept<T>(visitor: StmtVisitor<T>): T;
}

class ExprStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitExprStmt(this);
  }

  constructor(public expr: Expr) {
    super();
  }
}

class BlockStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
  
  constructor(public stmts: Stmt[]) {
    super();
  }
}

class PrintStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitPrintStmt(this);
  }
  
  constructor(public expr: Expr) {
    super();
  }
}

export type { StmtVisitor };
export { Stmt, ExprStmt, BlockStmt, PrintStmt };
