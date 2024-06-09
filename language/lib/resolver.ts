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
  VariableExpr,
} from "./expr";
import { WithVariableResolution } from "./interfaces";
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

class Resolver implements ExprVisitor<void>, StmtVisitor<void> {
  private readonly scopes: Map<string, boolean>[] = [];

  constructor(private readonly intepreter: WithVariableResolution) {}

  async resolveExpr(expression: Expr) {
    await expression.accept(this);
  }

  async resolveStmt(statement: Stmt) {
    await statement.accept(this);
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
    if (this.scopes.length === 0) return;

    this.scopes[this.scopes.length - 1].set(name.literal, false);
  }

  private define(name: Token<TokenType.IDENTIFIER>) {
    if (this.scopes.length === 0) return;

    this.scopes[this.scopes.length - 1].set(name.literal, true);
  }

  private resolveLocal(expr: Expr, name: Token<TokenType.IDENTIFIER>) {
    for (let idx = this.scopes.length - 1; idx >= 0; idx--) {
      if (this.scopes[idx].has(name.literal)) {
        this.intepreter.resolve(expr, this.scopes.length - 1 - idx);
        return;
      }
    }
  }

  async visitBlockStmt(stmt: BlockStmt): Promise<void> {
    this.beginScope();
    await this.resolve(stmt.stmts);
    this.endScope();
  }

  async visitVarStmt(stmt: VarStmt): Promise<void> {
    this.declare(stmt.token as Token<TokenType.IDENTIFIER>);
    if (stmt.initializer) {
      await this.resolveExpr(stmt.initializer);
    }
    this.define(stmt.token as Token<TokenType.IDENTIFIER>);
  }

  async visitVariableExpr(expr: VariableExpr): Promise<void> {
    if (this.scopes.length > 0) {
      const scope = this.scopes[this.scopes.length - 1];

      if (scope.get(expr.name.literal) == false) {
        throw new ResolverError(
          expr.name,
          "Can't read local variable in its own initiliazer"
        );
      }
    }

    this.resolveLocal(expr, expr.name as Token<TokenType.IDENTIFIER>);
  }

  async visitLiteralExpr(expr: LiteralExpr): Promise<void> {}

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
    await this.resolveExpr(expr.callee);

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
    await this.resolveExpr(expr.expr);
  }

  async visitSetExpr(expr: SetExpr): Promise<void> {
    await this.resolveExpr(expr.callee);
    await this.resolveExpr(expr.expr);
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
    this.resolveExpr(stmt.expr);
  }

  async visitIfStmt(stmt: IfStmt): Promise<void> {
    await this.resolveExpr(stmt.expr);
    await this.resolveStmt(stmt.thenStmt);
    if (stmt.elseStmt) await this.resolveStmt(stmt.elseStmt);
  }

  async visitWhileStmt(stmt: WhileStmt): Promise<void> {
    await this.resolveExpr(stmt.expr);
    await this.resolveStmt(stmt.stmt);
  }

  private async resolveFunction(fun: FunctionStmt) {
    this.beginScope();

    for (const param of fun.parameters) {
      this.declare(param as Token<TokenType.IDENTIFIER>);
      this.define(param as Token<TokenType.IDENTIFIER>);
    }

    await this.resolve(fun.body);
    this.endScope();
  }

  async visitFunctionStmt(stmt: FunctionStmt): Promise<void> {
    this.declare(stmt.name as Token<TokenType.IDENTIFIER>);
    this.define(stmt.name as Token<TokenType.IDENTIFIER>);

    await this.resolveFunction(stmt);
  }

  async visitReturnStmt(stmt: ReturnStmt): Promise<void> {
    if (stmt.expr) await this.resolveExpr(stmt.expr);
  }

  async visitBreakStmt(stmt: BreakStmt): Promise<void> {}
}

export default Resolver;
