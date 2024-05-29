import Expr from "./expression.mjs";
import Token from "./token.mjs";
import TokenType from "./token-type.mjs";

class Parser {
  /** @type {Array<Token>} */
  #tokens;
  /** @type {number} */
  #current;

  /**
   * @param {Array<Token>} tokens
   */
  constructor(tokens) {
    this.#tokens = tokens;
    this.#current = 0;
  }

  /**
   * @returns {Array<Expr.Base>}
   */
  parse() {
    const expressions = [];

    while (!this.#atEnd()) {
      expressions.push(this.#comparisson());
    }

    return expressions;
  }

  #comparisson() {
    let expr = this.#term();

    while (
      this.#match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.#previous();
      const right = this.#term();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  #term() {
    let expr = this.#factor();

    while (this.#match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.#previous();
      const right = this.#factor();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  #factor() {
    let expr = this.#unary();

    while (this.#match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.#previous();
      const right = this.#unary();
      expr = new Expr.Binary(expr, operator, right);
    }

    return expr;
  }

  #unary() {
    if (this.#match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.#previous();
      const right = this.#unary();
      return new Expr.Unary(operator, right);
    }

    return this.#primary();
  }

  #primary() {
    if (this.#match(TokenType.TRUE)) {
      return new Expr.Literal(true);
    } else if (this.#match(TokenType.FALSE)) {
      return new Expr.Literal(false);
    } else if (this.#match(TokenType.NIL)) {
      return new Expr.Literal(null);
    } else if (this.#match(TokenType.NUMBER, TokenType.STRING)) {
      return new Expr.Literal(this.#previous().literal);
    }
  }

  #advance() {
    if (this.#atEnd()) return;
    this.#current++;
  }

  /**
   * @param {...TokenType} tokenTypes
   * @returns {boolean}
   */
  #match(...tokenTypes) {
    if (!tokenTypes.some((tokenType) => this.#check(tokenType))) {
      return false;
    }
    this.#advance();
    return true;
  }

  /**
   * @param {TokenType} tokenType
   * @returns {boolean}
   */
  #check(tokenType) {
    if (this.#atEnd()) return false;
    return this.#peek().type === tokenType;
  }

  /**
   * @returns {Token}
   */
  #previous() {
    return this.#tokens[this.#current - 1];
  }

  /**
   * @returns {Token}
   */
  #peek() {
    return this.#tokens[this.#current];
  }

  /**
   * @returns {boolean}
   */
  #atEnd() {
    return this.#peek().type === TokenType.EOF;
  }
}

export default Parser;
