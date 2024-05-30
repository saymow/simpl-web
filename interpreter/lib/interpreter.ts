import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor,
  GetExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  SetExpr,
  SuperExpr,
  ThisExpr,
  UnaryExpr,
  Value,
  VariableExpr,
} from "./expr";
import {
  BlockStmt,
  ExprStmt,
  PrintStmt,
  Stmt,
  StmtVisitor,
  VarStmt,
} from "./stmt";
import { RuntimeError } from "./errors";
import { System } from "./presentation";
import TokenType from "./token-type";
import Token from "./token";
import Context, { VariableNotFound } from "./context";

class Interpreter implements ExprVisitor<Value>, StmtVisitor<void> {
  private context = new Context();

  constructor(private ast: Stmt[], private sys: System) {}

  public interpret() {
    try {
      for (const stmt of this.ast) {
        this.evaluateStmt(stmt);
      }
    } catch (err) {
      this.sys.error(err as string);
    }
  }

  private evaluateStmt(stmt: Stmt) {
    return stmt.accept(this);
  }

  private evaluateExpr(expr: Expr) {
    return expr.accept(this);
  }

  visitVarStmt(stmt: VarStmt): void {
    const value = stmt.initializer ? this.evaluateExpr(stmt.initializer) : null;
    this.context.define(stmt.token.lexeme, value);
  }

  visitExprStmt(stmt: ExprStmt): void {
    return this.evaluateExpr(stmt.expr);
  }

  visitBlockStmt(stmt: BlockStmt): void {
    this.executeBlock(stmt.stmts, new Context(this.context));
  }

  private executeBlock(stmts: Stmt[], context: Context) {
    const previous = this.context;

    try {
      this.context = context;

      for (const statement of stmts) {
        this.evaluateStmt(statement);
      }
    } finally {
      this.context = previous;
    }
  }

  visitPrintStmt(stmt: PrintStmt): void {
    const expr = this.evaluateExpr(stmt.expr);
    this.sys.log(expr);
  }

  visitLiteralExpr(expr: LiteralExpr): Value {
    return expr.object;
  }

  visitVariableExpr(expr: VariableExpr): Value {
    try {
      return this.context.get(expr.name.lexeme);
    } catch (err) {
      if (err instanceof VariableNotFound) {
        throw new Error("Variable not found.");
      }
    }
  }

  visitUnaryExpr(expr: UnaryExpr): Value {
    const value = this.evaluateExpr(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(value);
      case TokenType.MINUS:
        return -value;
      default:
        break;
    }

    return null;
  }

  visitBinaryExpr(expr: BinaryExpr): Value {
    const left = this.evaluateExpr(expr.left);
    const right = this.evaluateExpr(expr.right);

    switch (expr.operator.type) {
      case TokenType.PLUS: {
        if (typeof left === "number" && typeof right === "number") {
          return left + right;
        }
        if (typeof left === "string" && typeof right === "string") {
          return left + right;
        }

        throw new RuntimeError(
          expr.operator,
          "Operands must be numbers or strings."
        );
      }
      case TokenType.MINUS:
        this.ensureNumberOperands(expr.operator, left, right);
        return (left as unknown as number) - (right as unknown as number);
      case TokenType.STAR:
        this.ensureNumberOperands(expr.operator, left, right);
        return (left as unknown as number) * (right as unknown as number);
      case TokenType.SLASH:
        this.ensureNumberOperands(expr.operator, left, right);
        return (left as unknown as number) / (right as unknown as number);
      case TokenType.GREATER:
        this.ensureNumberOperands(expr.operator, left, right);
        return (left as unknown as number) > (right as unknown as number);
      case TokenType.GREATER_EQUAL:
        this.ensureNumberOperands(expr.operator, left, right);
        return (left as unknown as number) >= (right as unknown as number);
      case TokenType.LESS:
        this.ensureNumberOperands(expr.operator, left, right);
        return (left as unknown as number) < (right as unknown as number);
      case TokenType.LESS_EQUAL:
        this.ensureNumberOperands(expr.operator, left, right);
        return (left as unknown as number) <= (right as unknown as number);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
    }
  }

  visitLogicalExpr(expr: LogicalExpr): Value {
    const left = this.evaluateExpr(expr.left);

    if (expr.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) {
        return left;
      }
    } else {
      if (!this.isTruthy(left)) {
        return left;
      }
    }

    return this.evaluateExpr(expr.right);
  }

  visitGroupingExpr(expr: GroupingExpr): Value {
    return this.evaluateExpr(expr.expr);
  }

  visitThisExpr(expr: ThisExpr): Value {
    throw new Error("Method not implemented.");
  }

  visitSuperExpr(expr: SuperExpr): Value {
    throw new Error("Method not implemented.");
  }

  visitGetExpr(expr: GetExpr): Value {
    throw new Error("Method not implemented.");
  }

  visitCallExpr(expr: CallExpr): Value {
    throw new Error("Method not implemented.");
  }

  visitAssignExpr(expr: AssignExpr): Value {
    const value = this.evaluateExpr(expr.value);

    try {
      return this.context.assign(expr.name.lexeme, value);
    } catch (err) {
      if (err instanceof VariableNotFound) {
        throw new Error("Variable not found.");
      }
    }
  }

  visitSetExpr(expr: SetExpr): Value {
    throw new Error("Method not implemented.");
  }

  private isTruthy(value: Value) {
    if (value == null) return false;
    if (value instanceof Boolean) return value;

    return true;
  }

  private ensureNumberOperands(token: Token, a: Value, b: Value) {
    if (typeof a === "number" && typeof b === "number") {
      return;
    }

    throw new RuntimeError(token, "Operands must be numbers.");
  }

  private isEqual(a: Value, b: Value) {
    return a === b;
  }
}

export default Interpreter;
