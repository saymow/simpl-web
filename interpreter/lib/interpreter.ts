import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  SetExpr,
  UnaryExpr,
  Value,
  VariableExpr,
} from "./expr";
import {
  BlockStmt,
  ExprStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  Stmt,
  StmtVisitor,
  VarStmt,
  WhileStmt,
} from "./stmt";
import { CoreLibError, RuntimeError } from "./errors";
import { Callable, SysCall, System, UserCall } from "./interfaces";
import TokenType from "./token-type";
import Token from "./token";
import Context, { VariableNotFound } from "./context";
import Function, { ReturnValue } from "./function";
import * as lib from "./core-lib";

class Interpreter implements ExprVisitor<Value>, StmtVisitor<void> {
  private context = new Context<Value>();

  constructor(private ast: Stmt[], private system: System) {
    this.context.define("now", new lib.Now());
    this.context.define("output", new lib.Output());
    this.context.define("input", new lib.Input());
    this.context.define("string", new lib.String());
    this.context.define("number", new lib.Number());
    this.context.define("int", new lib.Int());
    this.context.define("abs", new lib.Abs());
  }

  public async interpret() {
    for (const stmt of this.ast) {
      await this.evaluateStmt(stmt);
    }
  }

  private async evaluateStmt(stmt: Stmt): Promise<unknown> {
    return await stmt.accept(this);
  }

  private async evaluateExpr(expr: Expr): Promise<unknown> {
    return await expr.accept(this);
  }

  async visitReturnStmt(stmt: ReturnStmt): Promise<void> {
    const value = stmt.expr ? await this.evaluateExpr(stmt.expr) : null;
    throw new ReturnValue(value);
  }

  async visitFunctionStmt(stmt: FunctionStmt): Promise<void> {
    const handler = new Function(this.context, stmt);
    this.context.define(stmt.name.literal, handler);
  }

  async visitWhileStmt(stmt: WhileStmt): Promise<void> {
    while (await this.evaluateExpr(stmt.expr)) {
      await this.evaluateStmt(stmt.stmt);
    }
  }

  async visitIfStmt(stmt: IfStmt): Promise<void> {
    const expr = await this.evaluateExpr(stmt.expr);

    if (expr) await this.evaluateStmt(stmt.thenStmt);
    if (!expr && stmt.elseStmt) await this.evaluateStmt(stmt.elseStmt);
  }

  async visitVarStmt(stmt: VarStmt): Promise<void> {
    const value = stmt.initializer
      ? await this.evaluateExpr(stmt.initializer)
      : null;
    this.context.define(stmt.token.literal, value);
  }

  async visitExprStmt(stmt: ExprStmt): Promise<void> {
    await this.evaluateExpr(stmt.expr);
  }

  async visitBlockStmt(stmt: BlockStmt): Promise<void> {
    await this.executeBlock(stmt.stmts, new Context(this.context));
  }

  async executeBlock<T>(stmts: Stmt[], context: Context<T>): Promise<void> {
    const previous = this.context;

    try {
      this.context = context;

      for (const statement of stmts) {
        await this.evaluateStmt(statement);
      }
    } finally {
      this.context = previous;
    }
  }

  async visitPrintStmt(stmt: PrintStmt): Promise<void> {
    const expr = await this.evaluateExpr(stmt.expr);
    this.log(expr);
  }

  async visitLiteralExpr(expr: LiteralExpr): Promise<Value> {
    return expr.object;
  }

  async visitVariableExpr(expr: VariableExpr): Promise<Value> {
    try {
      return this.context.get(expr.name.literal);
    } catch (err) {
      if (err instanceof VariableNotFound) {
        throw new RuntimeError(expr.name, "Variable not found.");
      }
    }
  }

  async visitUnaryExpr(expr: UnaryExpr): Promise<Value> {
    const value = await this.evaluateExpr(expr.right);

    switch (expr.operator.type) {
      case TokenType.BANG:
        return !this.isTruthy(value);
      case TokenType.MINUS:
        this.ensureNumberOperand(expr.operator, value);
        return -(value as number);
      default:
        break;
    }

    return null;
  }

  async visitBinaryExpr(expr: BinaryExpr): Promise<Value> {
    const left = await this.evaluateExpr(expr.left);
    const right = await this.evaluateExpr(expr.right);

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

  async visitLogicalExpr(expr: LogicalExpr): Promise<Value> {
    const left = await this.evaluateExpr(expr.left);

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

  async visitGroupingExpr(expr: GroupingExpr): Promise<Value> {
    return await this.evaluateExpr(expr.expr);
  }

  async visitCallExpr(expr: CallExpr): Promise<Value> {
    const callee = (await this.evaluateExpr(expr.callee)) as Callable;
    const args = [];

    if (!(callee instanceof Callable)) {
      throw new RuntimeError(expr.paren, "Can only call functions.");
    }
    if (callee.arity() !== expr.args.length) {
      throw new RuntimeError(
        expr.paren,
        `Expected ${callee.arity()} arguments but received ${expr.args.length}.`
      );
    }

    for (const argExpr of expr.args) {
      args.push(await this.evaluateExpr(argExpr));
    }

    if (callee instanceof UserCall) {
      return await callee.call(this, args);
    } else if (callee instanceof SysCall) {
      try {
        return await callee.call(this.system, args);
      } catch (err) {
        if (err instanceof CoreLibError) {
          throw new RuntimeError(expr.paren, err.message);
        }

        throw err;
      }
    }
  }

  async visitAssignExpr(expr: AssignExpr): Promise<Value> {
    const value = await this.evaluateExpr(expr.value);

    try {
      return this.context.assign(expr.name.literal, value);
    } catch (err) {
      if (err instanceof VariableNotFound) {
        throw new Error("Variable not found.");
      }
    }
  }

  async visitSetExpr(expr: SetExpr): Promise<Value> {
    throw new Error("Method not implemented.");
  }

  private isTruthy(value: Value) {
    if (value == null) return false;
    if (value instanceof Boolean) return value;

    return true;
  }

  private ensureNumberOperand(token: Token, a: Value) {
    if (typeof a === "number") {
      return;
    }

    throw new RuntimeError(token, "Operand must be numbers.");
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

  private log(message: any) {
    message =
      message !== undefined && message !== null ? message.toString() : "nil";
    this.system.log(message);
  }
}

export default Interpreter;
