import Token from "./token";
import TokenType from "./token-type";

// type Value = undefined | null | string | number | Value[] | Record<string, Value>;
type Value = any;

interface ExprVisitor<T> {
  visitLiteralExpr(expr: LiteralExpr): Promise<T>;
  visitVariableExpr(expr: VariableExpr): Promise<T>;
  visitUnaryExpr(expr: UnaryExpr): Promise<T>;
  visitBinaryExpr(expr: BinaryExpr): Promise<T>;
  visitLogicalExpr(expr: LogicalExpr): Promise<T>;
  visitGroupingExpr(expr: GroupingExpr): Promise<T>;
  visitCallExpr(expr: CallExpr): Promise<T>;
  visitAssignExpr(expr: AssignExpr): Promise<T>;
  visitAssignOperatorExpr(expr: AssignOperatorExpr): Promise<T>;
  visitUnaryOperatorExpr(expr: UnaryOperatorExpr): Promise<T>;
  visitArrayExpr(expr: ArrayExpr): Promise<T>;
  visitGetExpr(expr: GetExpr): Promise<T>;
  visitSetExpr(expr: SetExpr): Promise<T>;
  visitStructExpr(expr: StructExpr): Promise<T>;
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

class AssignOperatorExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitAssignOperatorExpr(this);
  }

  constructor(
    public nameExpr: Expr,
    public operator: Token,
    public value: Expr
  ) {
    super();
  }
}

enum UnaryOperatorType {
  PREFIX,
  SUFFIX,
}

class UnaryOperatorExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitUnaryOperatorExpr(this);
  }

  constructor(
    public nameExpr: Expr,
    public operator: Token,
    public type: UnaryOperatorType
  ) {
    super();
  }
}

class ArrayExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitArrayExpr(this);
  }

  constructor(public bracket: Token, public elements: Expr[]) {
    super();
  }
}

class GetExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitGetExpr(this);
  }

  constructor(
    public callee: Expr,
    public token: Token<TokenType.RIGHT_BRACKET | TokenType.DOT>,
    public expr: Expr
  ) {
    super();
  }
}

class SetExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitSetExpr(this);
  }

  constructor(
    public callee: Expr,
    public token: Token<TokenType.RIGHT_BRACKET | TokenType.DOT>,
    public expr: Expr,
    public valueExpr: Expr
  ) {
    super();
  }
}

interface StructProperty {
  key: Token<TokenType.IDENTIFIER>;
  value: Expr;
}

class StructExpr extends Expr {
  public accept<T>(visitor: ExprVisitor<T>): Promise<T> {
    return visitor.visitStructExpr(this);
  }

  constructor(
    public brace: Token<TokenType.RIGHT_BRACE>,
    public properties: StructProperty[]
  ) {
    super();
  }
}

export type { Value, ExprVisitor, StructProperty };

export {
  Expr,
  LiteralExpr,
  VariableExpr,
  UnaryExpr,
  BinaryExpr,
  LogicalExpr,
  GroupingExpr,
  CallExpr,
  AssignExpr,
  AssignOperatorExpr,
  UnaryOperatorExpr,
  UnaryOperatorType,
  ArrayExpr,
  GetExpr,
  SetExpr,
  StructExpr,
};
