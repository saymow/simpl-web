import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  GetExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  SuperExpr,
  ThisExpr,
  UnaryExpr,
  VariableExpr,
  SetExpr,
} from "./expression";
import { Stmt, ExprStmt, BlockStmt, PrintStmt } from "./statement";
import Token from "./token";
import TokenType from "./token-type";
import { ParserError } from "./errors";

class Parser {
  private tokens: Token[];
  private current: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = 0;
  }

  parse(): Stmt[] {
    const expressions = [];

    while (!this.atEnd()) {
      expressions.push(this.declaration());
    }

    return expressions;
  }

  private declaration(): Stmt {
    return this.statement();
  }

  private statement(): Stmt {
    if (this.match(TokenType.LEFT_BRACE)) {
      return new BlockStmt(this.block());
    }
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }

    return this.expressionStatement();
  }

  private printStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after print.");
    return new PrintStmt(expr);
  }

  private block(): Stmt[] {
    const stmts = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.atEnd()) {
      stmts.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after block.");

    return stmts;
  }

  private expressionStatement(): Stmt {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "Expect ';' after expression.");
    return new ExprStmt(expr);
  }

  private expression(): Expr {
    return this.assignment();
  }

  private assignment(): Expr {
    let expr = this.logicOr();

    if (this.match(TokenType.EQUAL)) {
      const token = this.previous();
      const value = this.assignment();

      if (expr instanceof VariableExpr) {
        return new AssignExpr(expr.name, value);
      } else if (expr instanceof GetExpr) {
        return new SetExpr(expr.expr, expr.token, value);
      }

      this.error(token, "Invalid assignment target.");
    } else if (this.match(TokenType.OR)) {
      expr = this.logicOr();
    }

    return expr;
  }

  private logicOr(): Expr {
    let expr = this.logicAnd();

    while (this.match(TokenType.OR)) {
      const token = this.previous();
      const right = this.logicAnd();
      expr = new LogicalExpr(expr, token, right);
    }

    return expr;
  }

  private logicAnd(): Expr {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const token = this.previous();
      const right = this.equality();
      expr = new LogicalExpr(expr, token, right);
    }

    return expr;
  }

  private equality(): Expr {
    let expr = this.comparisson();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const token = this.previous();
      const right = this.comparisson();
      expr = new BinaryExpr(expr, token, right);
    }

    return expr;
  }

  private comparisson(): Expr {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private term(): Expr {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expr {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new UnaryExpr(operator, right);
    }

    return this.call();
  }

  private call(): Expr {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.DOT)) {
        const identifier = this.consume(
          TokenType.IDENTIFIER,
          "Expect property name after '.'."
        );
        expr = new GetExpr(expr, identifier);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expr): Expr {
    const args = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length > 255) {
          this.error(this.peek(), "Call arguments list should not exceed 255.");
        }

        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(
      TokenType.RIGHT_PAREN,
      "Expect ')' after arguments list."
    );

    return new CallExpr(callee, paren, args);
  }

  private primary(): Expr {
    if (this.match(TokenType.TRUE)) {
      return new LiteralExpr(true);
    } else if (this.match(TokenType.FALSE)) {
      return new LiteralExpr(false);
    } else if (this.match(TokenType.NIL)) {
      return new LiteralExpr(null);
    } else if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new LiteralExpr(this.previous().literal);
    } else if (this.match(TokenType.IDENTIFIER)) {
      return new VariableExpr(this.previous());
    } else if (this.match(TokenType.THIS)) {
      return new ThisExpr(this.previous());
    } else if (this.match(TokenType.SUPER)) {
      const token = this.previous();
      this.consume(TokenType.DOT, "Expect '.' after 'super' keyword.");
      const identifier = this.consume(
        TokenType.IDENTIFIER,
        "Expect identifier after super keyword."
      );
      return new SuperExpr(token, identifier);
    } else if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after group expression.");
      return new GroupingExpr(expr);
    }

    throw this.error(this.peek(), "Unexpected token.");
  }

  private error(token: Token, message: string) {
    return new ParserError();
  }

  private consume(tokenType: TokenType, message: string): Token {
    if (this.peek().type !== tokenType) {
      throw this.error(this.peek(), message);
    }
    return this.advance();
  }

  private advance(): Token {
    if (!this.atEnd()) {
      this.current++;
    }
    return this.previous();
  }

  private match(...tokenTypes: TokenType[]) {
    if (!tokenTypes.some((tokenType) => this.check(tokenType))) {
      return false;
    }
    this.advance();
    return true;
  }

  private check(tokenType: TokenType) {
    if (this.atEnd()) return false;
    return this.peek().type === tokenType;
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private atEnd() {
    return this.peek().type === TokenType.EOF;
  }
}

export default Parser;
