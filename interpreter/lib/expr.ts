import Token from "./token";

type Value = any;

interface ExprVisitor<T> {
  visitLiteralExpr(expr: LiteralExpr): T;
  visitVariableExpr(expr: VariableExpr): T;
  visitUnaryExpr(expr: UnaryExpr): T;
  visitBinaryExpr(expr: BinaryExpr): T;
  visitLogicalExpr(expr: LogicalExpr): T;
  visitGroupingExpr(expr: GroupingExpr): T;
  visitThisExpr(expr: ThisExpr): T;
  visitSuperExpr(expr: SuperExpr): T;
  visitGetExpr(expr: GetExpr): T;
  visitCallExpr(expr: CallExpr): T;
  visitAssignExpr(expr: AssignExpr): T;
  visitSetExpr(expr: SetExpr): T;
}

abstract class Expr {
  public abstract accept<T>(visitor: ExprVisitor<T>): T;
}

class LiteralExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }

  constructor(public object: Value) {
    super();
  }
}

class VariableExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitVariableExpr(this);
  }

  constructor(public name: Token) {
    super();
  }
}

class UnaryExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }

  constructor(public operator: Token, public right: Expr) {
    super();
  }
}

class BinaryExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }

  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }
}

class LogicalExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitLogicalExpr(this);
  }

  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }
}

class GroupingExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }

  constructor(public expr: Expr) {
    super();
  }
}

class ThisExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitThisExpr(this);
  }

  constructor(public token: Token) {
    super();
  }
}

class SuperExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitSuperExpr(this);
  }

  constructor(public token: Token, public method: Token) {
    super();
  }
}

class GetExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitGetExpr(this);
  }

  constructor(public expr: Expr, public token: Token) {
    super();
  }
}

class CallExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitCallExpr(this);
  }

  constructor(public callee: Expr, public paren: Token, public args: Expr[]) {
    super();
  }
}

class AssignExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }

  constructor(public name: Token, public value: Expr) {
    super();
  }
}

class SetExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): T {
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
