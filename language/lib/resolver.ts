import { ResolverError } from "./errors";
import {
  ArrayExpr,
  AssignExpr,
  AssignOperatorExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  ExprVisitor,
  GetExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  SetExpr,
  StructExpr,
  UnaryExpr,
  UnaryOperatorExpr,
  Value,
  VariableExpr,
} from "./expr";
import Function from "./function";
import { Callable, WithVariableResolution } from "./interfaces";
import {
  BlockStmt,
  BreakStmt,
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
import Token from "./token";
import TokenType from "./token-type";
import * as lib from "./core-lib";

enum FunctionScope {
  None,
  Function,
}

enum LoopScope {
  None,
  Loop,
}

const UNDEFINED = Symbol("UNDEFINED");
const UNKNOWN = Symbol("UNKNOWN");

class Resolver implements ExprVisitor<Value>, StmtVisitor<void> {
  private readonly global: Map<string, any> = new Map();
  private readonly scopes: Map<string, any>[] = [];
  private functionScope: FunctionScope = FunctionScope.None;
  private loopScope: LoopScope = LoopScope.None;

  constructor(private readonly intepreter: WithVariableResolution) {
    this.global.set("now", new lib.Now());
    this.global.set("output", new lib.Output());
    this.global.set("input", new lib.Input());
    this.global.set("string", new lib.String());
    this.global.set("number", new lib.Number());
    this.global.set("int", new lib.Int());
    this.global.set("abs", new lib.Abs());
    this.global.set("len", new lib.Len());
    this.global.set("push", new lib.Push());
    this.global.set("pop", new lib.Pop());
    this.global.set("shift", new lib.Shift());
    this.global.set("unshift", new lib.Unshift());
    this.global.set("copy", new lib.Copy());
    this.global.set("insert", new lib.Insert());
    this.global.set("remove", new lib.Remove());
    this.global.set("indexOf", new lib.IndexOf());
    this.global.set("boolean", new lib.Boolean());
    this.global.set("clear", new lib.Clear());
    this.global.set("sleep", new lib.Sleep());
  }

  async resolveExpr(expression: Expr): Promise<Value> {
    return await expression.accept(this);
  }

  async resolveStmt(statement: Stmt) {
    return await statement.accept(this);
  }

  async resolve(statements: Stmt[]) {
    for (const statement of statements) {
      await this.resolveStmt(statement);
    }
  }

  private beginScope() {
    this.scopes.push(new Map());
  }

  private endScope() {
    this.scopes.pop();
  }

  private declare(name: Token<TokenType.IDENTIFIER>) {
    if (this.scopes.length === 0) {
      if (this.global.get(name.lexeme) !== undefined) {
        throw new ResolverError(name, "Can't redeclare global variable.");
      }

      this.global.set(name.lexeme, UNDEFINED);
      return;
    }

    if (this.scopes[this.scopes.length - 1].get(name.lexeme) !== undefined) {
      throw new ResolverError(name, "Can't redeclare local variable.");
    }

    this.scopes[this.scopes.length - 1].set(name.lexeme, UNDEFINED);
  }

  private define(name: Token<TokenType.IDENTIFIER>, value: any) {
    if (this.scopes.length === 0) {
      this.global.set(name.lexeme, value);
      return;
    }

    this.scopes[this.scopes.length - 1].set(name.lexeme, value);
  }

  private resolveLocal(expr: Expr, name: Token<TokenType.IDENTIFIER>): any {
    for (let idx = this.scopes.length - 1; idx >= 0; idx--) {
      if (this.scopes[idx].has(name.lexeme)) {
        this.intepreter.resolve(expr, this.scopes.length - 1 - idx);
        return this.scopes[idx].get(name.lexeme);
      }
    }

    if (this.global.has(name.lexeme)) {
      return this.global.get(name.lexeme);
    }

    throw new ResolverError(name, `Can't find variable '${name.lexeme}'.`);
  }

  async visitBlockStmt(stmt: BlockStmt): Promise<void> {
    this.beginScope();
    await this.resolve(stmt.stmts);
    this.endScope();
  }

  async visitVarStmt(stmt: VarStmt): Promise<void> {
    this.declare(stmt.token as Token<TokenType.IDENTIFIER>);
    let initializer;
    if (stmt.initializer) {
      initializer = await this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.token as Token<TokenType.IDENTIFIER>, initializer);
  }

  async visitVariableExpr(expr: VariableExpr): Promise<void> {
    if (this.scopes.length > 0) {
      const scope = this.scopes[this.scopes.length - 1];

      if (scope.get(expr.name.lexeme) == UNDEFINED) {
        throw new ResolverError(
          expr.name,
          "Can't read local variable in its own initiliazer"
        );
      }
    }

    return this.resolveLocal(expr, expr.name as Token<TokenType.IDENTIFIER>);
  }

  async visitLiteralExpr(expr: LiteralExpr): Promise<void> {
    return expr.object;
  }

  async visitUnaryExpr(expr: UnaryExpr): Promise<void> {
    await this.resolveExpr(expr.right);
  }

  async visitBinaryExpr(expr: BinaryExpr): Promise<void> {
    await this.resolveExpr(expr.left);
    await this.resolveExpr(expr.right);
  }

  async visitLogicalExpr(expr: LogicalExpr): Promise<void> {
    await this.resolveExpr(expr.left);
    await this.resolveExpr(expr.right);
  }

  async visitGroupingExpr(expr: GroupingExpr): Promise<void> {
    await this.resolveExpr(expr.expr);
  }

  async visitCallExpr(expr: CallExpr): Promise<void> {
    const callee = await this.resolveExpr(expr.callee);

    if (callee !== UNKNOWN) {
      if (!(callee instanceof Callable)) {
        throw new ResolverError(expr.paren, "Can only call functions.");
      }

      if (expr.args.length !== callee.arity()) {
        throw new ResolverError(
          expr.paren,
          `Expected ${callee.arity()} arguments but got ${expr.args.length}.`
        );
      }
    }

    for (const argument of expr.args) {
      await this.resolveExpr(argument);
    }
  }

  async visitAssignExpr(expr: AssignExpr): Promise<void> {
    await this.resolveExpr(expr.value);
    this.resolveLocal(expr, expr.name as Token<TokenType.IDENTIFIER>);
  }

  async visitAssignOperatorExpr(expr: AssignOperatorExpr): Promise<void> {
    await this.resolveExpr(expr.nameExpr);
    await this.resolveExpr(expr.value);
  }

  async visitUnaryOperatorExpr(expr: UnaryOperatorExpr): Promise<void> {
    await this.resolveExpr(expr.nameExpr);
  }

  async visitArrayExpr(expr: ArrayExpr): Promise<void> {
    for (const element of expr.elements) {
      await this.resolveExpr(element);
    }
  }

  async visitGetExpr(expr: GetExpr): Promise<void> {
    await this.resolveExpr(expr.callee);
    if (expr.token.type === TokenType.RIGHT_BRACKET) {
      await this.resolveExpr(expr.expr);
    }
  }

  async visitSetExpr(expr: SetExpr): Promise<void> {
    await this.resolveExpr(expr.callee);
    if (expr.token.type === TokenType.RIGHT_BRACKET) {
      await this.resolveExpr(expr.expr);
    }
    await this.resolveExpr(expr.valueExpr);
  }

  async visitStructExpr(expr: StructExpr): Promise<void> {
    for (const property of expr.properties) {
      await this.resolveExpr(property.value);
    }
  }

  async visitExprStmt(stmt: ExprStmt): Promise<void> {
    await this.resolveExpr(stmt.expr);
  }

  async visitPrintStmt(stmt: PrintStmt): Promise<void> {
    await this.resolveExpr(stmt.expr);
  }

  async visitIfStmt(stmt: IfStmt): Promise<void> {
    await this.resolveExpr(stmt.expr);
    await this.resolveStmt(stmt.thenStmt);
    if (stmt.elseStmt) await this.resolveStmt(stmt.elseStmt);
  }

  async visitWhileStmt(stmt: WhileStmt): Promise<void> {
    await this.resolveExpr(stmt.expr);
    this.loopScope = LoopScope.Loop;
    await this.resolveStmt(stmt.stmt);
    this.loopScope = LoopScope.None;
  }

  async visitFunctionStmt(stmt: FunctionStmt): Promise<void> {
    this.declare(stmt.name as Token<TokenType.IDENTIFIER>);
    this.define(
      stmt.name as Token<TokenType.IDENTIFIER>,
      new Function(null as any, stmt)
    );
    this.functionScope = FunctionScope.Function;
    this.beginScope();

    for (const param of stmt.parameters) {
      this.declare(param as Token<TokenType.IDENTIFIER>);
      this.define(param as Token<TokenType.IDENTIFIER>, UNKNOWN);
    }

    await this.resolve(stmt.body);
    this.endScope();
    this.functionScope = FunctionScope.None;
  }

  async visitReturnStmt(stmt: ReturnStmt): Promise<void> {
    if (this.functionScope === FunctionScope.None) {
      throw new ResolverError(stmt.keyword, "Can't return outside function.");
    }
    if (stmt.expr) await this.resolveExpr(stmt.expr);
  }

  async visitBreakStmt(stmt: BreakStmt): Promise<void> {
    if (this.loopScope === LoopScope.None) {
      throw new ResolverError(stmt.keyword, "Can't break outside loop.");
    }
  }
}

export default Resolver;
