import { Expr } from "./expr";
import Token from "./token";

interface StmtVisitor<T> {
  visitVarStmt(stmt: VarStmt): T;
  visitExprStmt(stmt: ExprStmt): T;
  visitBlockStmt(stmt: BlockStmt): T;
  visitPrintStmt(stmt: PrintStmt): T;
  visitIfStmt(stmt: IfStmt): T;
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

class VarStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitVarStmt(this);
  }

  constructor(public token: Token, public initializer?: Expr) {
    super();
  }
}

class IfStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): T {
    return visitor.visitIfStmt(this);
  }

  constructor(public expr: Expr, public thenStmt: Stmt, public elseStmt?: Stmt) {
    super();
  }
}

export type { StmtVisitor };
export { Stmt, ExprStmt, BlockStmt, PrintStmt, VarStmt, IfStmt };
