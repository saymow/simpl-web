import {
  ArrayExpr,
  GetExpr,
  SetExpr,
  AssignExpr,
  AssignOperatorExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  StructExpr,
  UnaryExpr,
  UnaryOperatorExpr,
  UnaryOperatorType,
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
import { isArray, isObject } from "./core-lib/helpers";

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
    this.context.define("len", new lib.Len());
    this.context.define("push", new lib.Push());
    this.context.define("pop", new lib.Pop());
    this.context.define("shift", new lib.Shift());
    this.context.define("unshift", new lib.Unshift());
    this.context.define("copy", new lib.Copy());
    this.context.define("insert", new lib.Insert());
    this.context.define("remove", new lib.Remove());
    this.context.define("indexOf", new lib.IndexOf());
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

  async visitStructExpr(expr: StructExpr): Promise<any> {
    const struct: Record<string, Value> = {};

    for (const property of expr.properties) {
      struct[property.key.lexeme] = await this.evaluateExpr(property.value);
    }

    return struct;
  }

  async visitSetExpr(expr: SetExpr): Promise<any> {
    const callee = await this.evaluateExpr(expr.callee);
    const value = await this.evaluateExpr(expr.valueExpr);

    if (expr.token.type === TokenType.IDENTIFIER) {
      if (!(expr.expr instanceof VariableExpr)) {
        throw new RuntimeError(expr.token, "Invalid struct property access.");
      }
      if (!isObject(callee)) {
        throw new RuntimeError(
          expr.token,
          `Cannot access property '${expr.expr.name.lexeme}.'`
        );
      }

      (callee as Record<string, Value>)[expr.expr.name.lexeme] = value;
    
    } else {
      const idx = await this.evaluateExpr(expr.expr);

      if (!(typeof idx === "number")) {
        throw new RuntimeError(expr.token, "Index must be a number.");
      }
      if (!(callee instanceof Array)) {
        throw new RuntimeError(expr.token, `Cannot access property '${idx}.'`);
      }
      if (idx >= callee.length) {
        throw new RuntimeError(expr.token, "Index out of bounds.");
      }

      callee[idx] = value;
    }
  }

  async visitArrayExpr(expr: ArrayExpr): Promise<any> {
    const elements = [];

    for (const elementExpr of expr.elements) {
      elements.push(await this.evaluateExpr(elementExpr));
    }

    return elements;
  }

  async visitGetExpr(expr: GetExpr): Promise<any> {
    const callee = await this.evaluateExpr(expr.callee);

    // Resolve as struct access
    if (expr.token.type === TokenType.IDENTIFIER) {
      if (!(expr.expr instanceof VariableExpr)) {
        throw new RuntimeError(expr.token, "Invalid struct property access.");
      }
      if (!isObject(callee)) {
        throw new RuntimeError(
          expr.token,
          `Cannot access property '${expr.expr.name.lexeme}.'`
        );
      }

      return (callee as Record<string, Value>)[expr.expr.name.lexeme];
    }
    // Resolve as array access
    else {
      const idx = await this.evaluateExpr(expr.expr);

      if (!(typeof idx === "number")) {
        throw new RuntimeError(expr.token, "Index must be a number.");
      }
      if (!(callee instanceof Array)) {
        throw new RuntimeError(expr.token, `Cannot access property '${idx}.'`);
      }
      if (idx >= callee.length) {
        throw new RuntimeError(expr.token, "Index out of bounds.");
      }

      return callee[idx];
    }
  }

  async visitUnaryOperatorExpr(expr: UnaryOperatorExpr): Promise<any> {
    if (
      !(
        expr.nameExpr instanceof VariableExpr ||
        expr.nameExpr instanceof GetExpr
      )
    ) {
      throw new RuntimeError(
        expr.operator,
        "Unexpected use of unary operator."
      );
    }

    const current = (await this.evaluateExpr(expr.nameExpr)) as Value;
    let newValue = current;

    this.ensureNumberOperand(expr.operator, current);

    switch (expr.operator.type) {
      case TokenType.PLUS_PLUS:
        newValue++;
        break;
      case TokenType.MINUS_MINUS:
        newValue--;
    }

    if (expr.nameExpr instanceof GetExpr) {
      const callee = await this.evaluateExpr(expr.nameExpr.callee);

      if (expr.nameExpr.token.type === TokenType.IDENTIFIER) {
        if (!(expr.nameExpr.expr instanceof VariableExpr)) {
          throw new RuntimeError(
            expr.nameExpr.token,
            "Invalid struct property access."
          );
        }
        if (!isObject(callee)) {
          throw new RuntimeError(
            expr.nameExpr.token,
            `Cannot access property '${expr.nameExpr.expr.name.lexeme}.'`
          );
        }

        (callee as Record<string, Value>)[expr.nameExpr.expr.name.lexeme] =
          newValue;
      } else {
        const idx = await this.evaluateExpr(expr.nameExpr.expr);

        if (!(typeof idx === "number")) {
          throw new RuntimeError(
            expr.nameExpr.token,
            "Index must be a number."
          );
        }
        if (!(callee instanceof Array)) {
          throw new RuntimeError(
            expr.nameExpr.token,
            `Cannot access property '${idx}.'`
          );
        }
        if (idx >= callee.length) {
          throw new RuntimeError(expr.nameExpr.token, "Index out of bounds.");
        }

        callee[idx] = newValue;
      }
    } else if (expr.nameExpr instanceof VariableExpr) {
      this.assignVariable(
        expr.nameExpr.name as Token<TokenType.IDENTIFIER>,
        newValue
      );
    }

    if (expr.type === UnaryOperatorType.SUFFIX) {
      return current;
    }

    return newValue;
  }

  async visitAssignOperatorExpr(expr: AssignOperatorExpr): Promise<any> {
    if (
      !(
        expr.nameExpr instanceof VariableExpr ||
        expr.nameExpr instanceof GetExpr
      )
    ) {
      throw new RuntimeError(
        expr.operator,
        "Unexpected use of assign operator."
      );
    }

    const current = (await this.evaluateExpr(expr.nameExpr)) as Value;
    const increment = await this.evaluateExpr(expr.value);
    let value;

    switch (expr.operator.type) {
      case TokenType.PLUS_EQUAL:
        if (
          !(
            (typeof current === "number" && typeof increment === "number") ||
            (typeof current === "string" && typeof increment === "string")
          )
        ) {
          throw new RuntimeError(
            expr.operator,
            "Operands must be numbers or strings."
          );
        }

        value = ((current as any) + increment) as any;

        break;
      case TokenType.MINUS_EQUAL:
        this.ensureNumberOperands(expr.operator, current, increment);
        value = current - (increment as number);
        break;
      case TokenType.STAR_EQUAL:
        this.ensureNumberOperands(expr.operator, current, increment);
        value = current * (increment as number);
        break;
      case TokenType.SLASH_EQUAL:
        this.ensureNumberOperands(expr.operator, current, increment);
        value = current / (increment as number);
        break;
    }

    if (expr.nameExpr instanceof GetExpr) {
      const callee = await this.evaluateExpr(expr.nameExpr.callee);

      if (expr.nameExpr.token.type === TokenType.IDENTIFIER) {
        if (!(expr.nameExpr.expr instanceof VariableExpr)) {
          throw new RuntimeError(
            expr.nameExpr.token,
            "Invalid struct property access."
          );
        }
        if (!isObject(callee)) {
          throw new RuntimeError(
            expr.nameExpr.token,
            `Cannot access property '${expr.nameExpr.expr.name.lexeme}.'`
          );
        }

        (callee as Record<string, Value>)[expr.nameExpr.expr.name.lexeme] =
          value;
      } else {
        const idx = await this.evaluateExpr(expr.nameExpr.expr);

        if (!(typeof idx === "number")) {
          throw new RuntimeError(
            expr.nameExpr.token,
            "Index must be a number."
          );
        }
        if (!(callee instanceof Array)) {
          throw new RuntimeError(
            expr.nameExpr.token,
            `Cannot access property '${idx}.'`
          );
        }
        if (idx >= callee.length) {
          throw new RuntimeError(expr.nameExpr.token, "Index out of bounds.");
        }

        callee[idx] = value;
      }
    } else if (expr.nameExpr instanceof VariableExpr) {
      this.assignVariable(
        expr.nameExpr.name as Token<TokenType.IDENTIFIER>,
        value
      );
    }

    return value;
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
    return this.getVariable(expr.name as Token<TokenType.IDENTIFIER>);
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
    this.assignVariable(expr.name as Token<TokenType.IDENTIFIER>, value);
  }

  private getVariable(token: Token<TokenType.IDENTIFIER>): Value {
    try {
      return this.context.get(token.literal);
    } catch (err) {
      if (err instanceof VariableNotFound) {
        throw new RuntimeError(token, "Variable not found.");
      }
    }
  }

  private assignVariable(
    token: Token<TokenType.IDENTIFIER>,
    value: Value
  ): Value {
    try {
      this.context.assign(token.literal, value);
    } catch (err) {
      if (err instanceof VariableNotFound) {
        throw new Error("Variable not found.");
      }
    }
  }

  private isTruthy(value: Value) {
    if (value == null) return false;
    if (typeof value === "boolean") return value;

    return true;
  }

  private ensureNumberOperand(token: Token, a: Value) {
    if (typeof a === "number") {
      return;
    }

    throw new RuntimeError(token, "Operand must be number.");
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
    if (message !== undefined && message !== null) {
      if (isArray(message) || isObject(message)) {
        message = JSON.stringify(message);
      } else {
        message = message.toString();
      }
    } else {
      message = "nil";
    }

    this.system.log(message);
  }
}

export default Interpreter;
