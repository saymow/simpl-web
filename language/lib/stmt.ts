import { Expr } from "./expr";
import Token from "./token";
import TokenType from "./token-type";

interface StmtVisitor<T> {
  visitVarStmt(stmt: VarStmt): Promise<T>;
  visitExprStmt(stmt: ExprStmt): Promise<T>;
  visitBlockStmt(stmt: BlockStmt): Promise<T>;
  visitPrintStmt(stmt: PrintStmt): Promise<T>;
  visitIfStmt(stmt: IfStmt): Promise<T>;
  visitWhileStmt(stmt: WhileStmt): Promise<T>;
  visitFunctionStmt(stmt: FunctionStmt): Promise<T>;
  visitReturnStmt(stmt: ReturnStmt): Promise<T>;
  visitBreakStmt(stmt: BreakStmt): Promise<T>;
  visitSwitchStmt(stmt: SwitchStmt): Promise<T>;
}

abstract class Stmt {
  public abstract accept<T>(visitor: StmtVisitor<T>): Promise<T>;
}

class ExprStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitExprStmt(this);
  }

  constructor(public readonly expr: Expr) {
    super();
  }
}

class BlockStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitBlockStmt(this);
  }

  constructor(public readonly stmts: Stmt[]) {
    super();
  }
}

class PrintStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitPrintStmt(this);
  }

  constructor(public readonly expr: Expr) {
    super();
  }
}

class VarStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitVarStmt(this);
  }

  constructor(
    public readonly token: Token,
    public readonly initializer?: Expr
  ) {
    super();
  }
}

class IfStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitIfStmt(this);
  }

  constructor(
    public readonly expr: Expr,
    public readonly thenStmt: Stmt,
    public readonly elseStmt?: Stmt
  ) {
    super();
  }
}

class WhileStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitWhileStmt(this);
  }

  constructor(public readonly expr: Expr, public readonly stmt: Stmt) {
    super();
  }
}

class FunctionStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitFunctionStmt(this);
  }

  constructor(
    public readonly name: Token,
    public readonly parameters: Token[],
    public readonly body: Stmt[]
  ) {
    super();
  }
}

class ReturnStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitReturnStmt(this);
  }

  constructor(public readonly keyword: Token, public readonly expr?: Expr) {
    super();
  }
}

class BreakStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitBreakStmt(this);
  }

  constructor(public readonly keyword: Token<TokenType.BREAK>) {
    super();
  }
}

class SwitchStmt extends Stmt {
  public accept<T>(visitor: StmtVisitor<T>): Promise<T> {
    return visitor.visitSwitchStmt(this);
  }

  constructor(
    public readonly token: Token<TokenType.SWITCH>,
    public readonly expr: Expr,
    public readonly cases: Array<{ token: Token<TokenType.CASE>; expr: Expr; stmt: Stmt }>,
    public readonly dflt?: { token: Token<TokenType.DEFAULT>; stmt: Stmt }
  ) {
    super();
  }
}

export type { StmtVisitor };
export {
  Stmt,
  ExprStmt,
  BlockStmt,
  PrintStmt,
  VarStmt,
  IfStmt,
  WhileStmt,
  FunctionStmt,
  ReturnStmt,
  BreakStmt,
  SwitchStmt
};
