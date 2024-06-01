import Token from "./token";

type Value = any;

interface ExprVisitor<T> {
  visitLiteralExpr(expr: LiteralExpr): Promise<T>;
  visitVariableExpr(expr: VariableExpr): Promise<T>;
  visitUnaryExpr(expr: UnaryExpr): Promise<T>;
  visitBinaryExpr(expr: BinaryExpr): Promise<T>;
  visitLogicalExpr(expr: LogicalExpr): Promise<T>;
  visitGroupingExpr(expr: GroupingExpr): Promise<T>;
  visitThisExpr(expr: ThisExpr): Promise<T>;
  visitSuperExpr(expr: SuperExpr): Promise<T>;
  visitGetExpr(expr: GetExpr): Promise<T>;
  visitCallExpr(expr: CallExpr): Promise<T>;
  visitAssignExpr(expr: AssignExpr): Promise<T>;
  visitSetExpr(expr: SetExpr): Promise<T>;
}

abstract class Expr {
  public abstract accept<T>(visitor: ExprVisitor<T>): Promise<T>;
}

class LiteralExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitLiteralExpr(this);
  }

  constructor(public object: Value) {
    super();
  }
}

class VariableExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitVariableExpr(this);
  }

  constructor(public name: Token) {
    super();
  }
}

class UnaryExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitUnaryExpr(this);
  }

  constructor(public operator: Token, public right: Expr) {
    super();
  }
}

class BinaryExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitBinaryExpr(this);
  }

  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }
}

class LogicalExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitLogicalExpr(this);
  }

  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }
}

class GroupingExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitGroupingExpr(this);
  }

  constructor(public expr: Expr) {
    super();
  }
}

class ThisExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitThisExpr(this);
  }

  constructor(public token: Token) {
    super();
  }
}

class SuperExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitSuperExpr(this);
  }

  constructor(public token: Token, public method: Token) {
    super();
  }
}

class GetExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitGetExpr(this);
  }

  constructor(public expr: Expr, public token: Token) {
    super();
  }
}

class CallExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitCallExpr(this);
  }

  constructor(public callee: Expr, public paren: Token, public args: Expr[]) {
    super();
  }
}

class AssignExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitAssignExpr(this);
  }

  constructor(public name: Token, public value: Expr) {
    super();
  }
}

class SetExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitSetExpr(this);
  }

  constructor(public object: Expr, public property: Token, public value: Expr) {
    super();
  }
}

export type { Value, ExprVisitor };

export {
  Expr,
  LiteralExpr,
  VariableExpr,
  UnaryExpr,
  BinaryExpr,
  LogicalExpr,
  GroupingExpr,
  ThisExpr,
  SuperExpr,
  GetExpr,
  CallExpr,
  AssignExpr,
  SetExpr,
};
