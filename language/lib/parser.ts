import {
  ArrayExpr,
  GetExpr,
  SetExpr,
  AssignExpr,
  AssignOperatorExpr,
  BinaryExpr,
  CallExpr,
  Expr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  StructExpr,
  StructProperty,
  UnaryExpr,
  UnaryOperatorExpr,
  UnaryOperatorType,
  VariableExpr,
} from "./expr";
import {
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
  SwitchStmt,
  SwitchCaseClause,
  SwitchDefaultClause,
} from "./stmt";
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
    if (this.match(TokenType.VAR)) {
      return this.varDeclaration();
    }
    if (this.match(TokenType.FUN)) {
      return this.functionDeclaration();
    }

    return this.statement();
  }

  private functionDeclaration(): Stmt {
    const identifier = this.consume(
      TokenType.IDENTIFIER,
      "Expect name after fun."
    );
    const parameters = [];
    this.consume(TokenType.LEFT_PAREN, "Expect '(' after fun name.");

    if (this.peek().type !== TokenType.RIGHT_PAREN) {
      do {
        if (parameters.length >= 255) {
          this.error(
            this.peek(),
            "Function parameters list should not exceed 255."
          );
        }

        parameters.push(
          this.consume(TokenType.IDENTIFIER, "Expect function paramater")
        );
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after function name.");
    this.consume(TokenType.LEFT_BRACE, "Expect '{' before function body.");

    const body = this.block();

    return new FunctionStmt(identifier, parameters, body);
  }

  private varDeclaration(): Stmt {
    const name = this.consume(TokenType.IDENTIFIER, "Expect name after var.");
    let expr;

    if (this.match(TokenType.EQUAL)) {
      expr = this.expression();
    }

    this.consume(TokenType.SEMICOLON, "Expect ';' after var declaration.");
    return new VarStmt(name, expr);
  }

  private statement(): Stmt {
    if (this.match(TokenType.SWITCH)) {
      return this.switchStatement();
    }
    if (this.match(TokenType.BREAK)) {
      return this.breakStatement();
    }
    if (this.match(TokenType.PRINT)) {
      return this.printStatement();
    }
    if (this.match(TokenType.IF)) {
      return this.ifStatement();
    }
    if (this.match(TokenType.WHILE)) {
      return this.whileStatement();
    }
    if (this.match(TokenType.FOR)) {
      return this.forStatement();
    }
    if (this.match(TokenType.RETURN)) {
      return this.returnStatement();
    }

    return this.expressionStatement();
  }

  private switchStatement() {
    const switchToken = this.previous<TokenType.SWITCH>();
    const cases: Array<SwitchCaseClause> = [];
    let dflt: SwitchDefaultClause | undefined;

    this.consume(TokenType.LEFT_PAREN, "Expect '(' after switch.");
    const switchExpression = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after switch expression.");

    this.consume(TokenType.LEFT_BRACE, "Expect '{' after switch expression.");

    do {
      if (this.match(TokenType.CASE)) {
        const exprs = [];
        let token;
        let stmt;

        do {
          token = this.previous<TokenType.CASE>();
          exprs.push(this.expression());

          this.consume(TokenType.COLON, "Expect ':' after case expression.");
        } while (this.match(TokenType.CASE));

        if (this.match(TokenType.LEFT_BRACE)) {
          stmt = new BlockStmt(this.block());
        } else {
          stmt = this.statement();
        }

        cases.push({ token, exprs, stmt });
      } else if (this.match(TokenType.DEFAULT)) {
        const token = this.previous<TokenType.DEFAULT>();
        let stmt;

        if (dflt) {
          throw this.error(
            token,
            "Default clause cannot appear more than once in switch statement."
          );
        }

        this.consume(TokenType.COLON, "Expect ':' after default.");

        if (this.match(TokenType.LEFT_BRACE)) {
          stmt = new BlockStmt(this.block());
        } else {
          stmt = this.statement();
        }

        dflt = { token, stmt };
      } else {
        throw this.error(
          this.previous(),
          "Expect 'case' or 'default' inside switch body."
        );
      }
    } while (this.peek().type !== TokenType.RIGHT_BRACE);

    this.consume(TokenType.RIGHT_BRACE, "Expect '}' after switch body.");

    return new SwitchStmt(switchToken, switchExpression, cases, dflt);
  }

  private breakStatement() {
    const token = this.previous<TokenType.BREAK>();
    this.consume(TokenType.SEMICOLON, "Expect ';' after break.");
    return new BreakStmt(token);
  }

  private returnStatement(): Stmt {
    const token = this.previous();
    let expr;
    if (this.peek().type !== TokenType.SEMICOLON) {
      expr = this.expression();
    }
    this.consume(TokenType.SEMICOLON, "Expect ';' after return.");

    return new ReturnStmt(token, expr);
  }

  private forStatement(): Stmt {
    let initializer;
    let comparisson;
    let increment;
    let stmt;

    this.consume(TokenType.LEFT_PAREN, "Expect '(' after for.");
    if (!this.match(TokenType.SEMICOLON)) {
      initializer = this.declaration();

      if (
        !(initializer instanceof VarStmt || initializer instanceof ExprStmt)
      ) {
        throw this.error(
          this.peek(),
          "Expect var declartion or expression after '('"
        );
      }
    }
    if (!this.match(TokenType.SEMICOLON)) {
      comparisson = this.expression();
      this.consume(TokenType.SEMICOLON, "Expect ';' after for comparisson.");
    }
    if (!this.match(TokenType.RIGHT_PAREN)) {
      increment = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after for increment.");
    }

    if (this.match(TokenType.LEFT_BRACE)) {
      stmt = new BlockStmt(this.block());
    } else {
      stmt = this.statement();
    }

    const innerBlock = new BlockStmt([stmt]);

    if (increment) {
      innerBlock.stmts.push(new ExprStmt(increment));
    }

    if (!comparisson) {
      comparisson = new LiteralExpr(true);
    }

    const outerBlock = new BlockStmt([new WhileStmt(comparisson, innerBlock)]);

    if (initializer) {
      outerBlock.stmts.unshift(initializer);
    }

    return outerBlock;
  }

  private whileStatement(): Stmt {
    let stmt;

    this.consume(TokenType.LEFT_PAREN, "Expect '(' after while.");
    const expr = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after while expression.");

    if (this.match(TokenType.LEFT_BRACE)) {
      stmt = new BlockStmt(this.block());
    } else {
      stmt = this.statement();
    }

    return new WhileStmt(expr, stmt);
  }

  private ifStatement(): Stmt {
    let thenStmt;
    let elseStmt;

    this.consume(TokenType.LEFT_PAREN, "Expect '(' after if.");
    const expr = this.expression();
    this.consume(TokenType.RIGHT_PAREN, "Expect ')' after if expression.");

    if (this.match(TokenType.LEFT_BRACE)) {
      thenStmt = new BlockStmt(this.block());
    } else {
      thenStmt = this.statement();
    }

    if (this.match(TokenType.ELSE)) {
      if (this.match(TokenType.LEFT_BRACE)) {
        elseStmt = new BlockStmt(this.block());
      } else {
        elseStmt = this.statement();
      }
    }

    return new IfStmt(expr, thenStmt, elseStmt);
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

  // assignment → ( call "." )? IDENTIFIER "=" assignment | logic_or ;
  private assignment(): Expr {
    let expr = this.logicOr();

    if (this.match(TokenType.EQUAL)) {
      const token = this.previous();
      const value = this.assignment();

      if (expr instanceof VariableExpr) {
        return new AssignExpr(expr.name, value);
      }
      if (expr instanceof GetExpr) {
        return new SetExpr(expr.callee, expr.token, expr.expr, value);
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
    let expr = this.termAssignOperator();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.termAssignOperator();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  // term → term_assign_operator ( ( "-" | "+" ) term_assign_operator )* ;
  // term_assign_operator  →  (IDENTIFIER ( "-=" | "+=" ) factor) | factor
  private termAssignOperator(): Expr {
    const expr = this.factor();

    if (this.match(TokenType.MINUS_EQUAL, TokenType.PLUS_EQUAL)) {
      const operator = this.previous();

      if (!(expr instanceof VariableExpr || expr instanceof GetExpr)) {
        throw this.error(
          operator,
          "Expected variable for assignment operation."
        );
      }

      const right = this.factor();
      return new AssignOperatorExpr(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expr {
    let expr = this.factorAssignOperator();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.factorAssignOperator();
      expr = new BinaryExpr(expr, operator, right);
    }

    return expr;
  }

  // factor → factor_assign_operator ( ( "/" | "*" ) factor_assign_operator )* ;
  // factor_assign_operator → (IDENTIFIER ( "/=" | "*=" ) unary) | unary
  private factorAssignOperator(): Expr {
    const expr = this.unary();

    if (this.match(TokenType.SLASH_EQUAL, TokenType.STAR_EQUAL)) {
      const operator = this.previous();

      if (!(expr instanceof VariableExpr || expr instanceof GetExpr)) {
        throw this.error(
          operator,
          "Expected variable or array item for assignment operation."
        );
      }

      const right = this.unary();
      return new AssignOperatorExpr(expr, operator, right);
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

  // call → primary ( "(" arguments? ")" | "[" IDENTIFIER "]" )* ;
  private call(): Expr {
    let expr = this.primary();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.LEFT_BRACKET)) {
        const indexExpr = this.expression();
        const token = this.consume(
          TokenType.RIGHT_BRACKET,
          "Expect ']' after array access."
        );

        expr = new GetExpr(expr, token, indexExpr);

        if (this.match(TokenType.PLUS_PLUS, TokenType.MINUS_MINUS)) {
          const operator = this.previous();

          return new UnaryOperatorExpr(
            expr,
            operator,
            UnaryOperatorType.SUFFIX
          );
        }
      } else if (this.match(TokenType.DOT)) {
        const token = this.consume(
          TokenType.IDENTIFIER,
          "Expected identifier after '.'."
        );
        const propertyExpr = new VariableExpr(token);
        expr = new GetExpr(expr, token, propertyExpr);

        if (this.match(TokenType.PLUS_PLUS, TokenType.MINUS_MINUS)) {
          const operator = this.previous();

          return new UnaryOperatorExpr(
            expr,
            operator,
            UnaryOperatorType.SUFFIX
          );
        }
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
    } else if (this.match(TokenType.LEFT_BRACKET)) {
      return this.array();
    } else if (this.match(TokenType.LEFT_BRACE)) {
      return this.struct();
    } else if (this.match(TokenType.IDENTIFIER)) {
      return this.variableIdentifier();
    } else if (this.match(TokenType.PLUS_PLUS, TokenType.MINUS_MINUS)) {
      return this.prefixUnaryOperator();
    } else if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "Expect ')' after group expression.");
      return new GroupingExpr(expr);
    }

    throw this.error(this.peek(), "Unexpected token.");
  }

  private struct() {
    const properties: StructProperty[] = [];
    const identifiersUsed = new Set<string>();

    if (!this.check(TokenType.RIGHT_BRACE)) {
      do {
        const identifier = this.consume(
          TokenType.IDENTIFIER,
          "Expect identifier for struct property."
        );

        if (identifiersUsed.has(identifier.lexeme)) {
          throw this.error(
            identifier,
            "Structs cannot have multiple properties with the same name."
          );
        }

        this.consume(
          TokenType.COLON,
          "Expect ':' after struct property identifier."
        );
        const expr = this.expression();

        properties.push({ key: identifier, value: expr });
        identifiersUsed.add(identifier.lexeme);
      } while (this.match(TokenType.COMMA));
    }

    const brace = this.consume(
      TokenType.RIGHT_BRACE,
      "Expect '}' after struct properties."
    );

    return new StructExpr(brace, properties);
  }

  private array(): Expr {
    const elements = [];

    if (!this.check(TokenType.RIGHT_BRACKET)) {
      do {
        elements.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const token = this.consume(
      TokenType.RIGHT_BRACKET,
      "Expect ']' after array elements list."
    );

    return new ArrayExpr(token, elements);
  }

  private variableIdentifier(): Expr {
    const variableExpr = new VariableExpr(this.previous());

    if (this.match(TokenType.PLUS_PLUS, TokenType.MINUS_MINUS)) {
      const operator = this.previous();

      return new UnaryOperatorExpr(
        variableExpr,
        operator,
        UnaryOperatorType.SUFFIX
      );
    }

    return variableExpr;
  }

  private prefixUnaryOperator(): Expr {
    const operator = this.previous();
    const variable = this.expression();

    return new UnaryOperatorExpr(variable, operator, UnaryOperatorType.PREFIX);
  }

  private error(token: Token, message: string) {
    return new ParserError(token, message);
  }

  private consume<T extends TokenType[keyof TokenType]>(
    tokenType: T,
    message: string
  ): Token<T> {
    if (this.peek().type !== tokenType) {
      throw this.error(this.previous(), message);
    }
    return this.advance() as Token<T>;
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

  private previous<
    T extends TokenType[keyof TokenType] | void = void
  >(): Token<T> {
    return this.tokens[this.current - 1] as Token<T>;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private atEnd() {
    return this.peek().type === TokenType.EOF;
  }
}

export default Parser;
