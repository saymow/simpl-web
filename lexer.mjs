import Token from "./token.mjs";
import TokenType from "./token-type.mjs";

class Lexer {
  keyword = new Map([
    ["and", TokenType.AND],
    ["class", TokenType.CLASS],
    ["else", TokenType.ELSE],
    ["false", TokenType.FALSE],
    ["for", TokenType.FOR],
    ["fun", TokenType.FUN],
    ["if", TokenType.IF],
    ["nil", TokenType.NIL],
    ["or", TokenType.OR],
    ["print", TokenType.PRINT],
    ["return", TokenType.RETURN],
    ["super", TokenType.SUPER],
    ["this", TokenType.THIS],
    ["true", TokenType.TRUE],
    ["var", TokenType.VAR],
    ["while", TokenType.WHILE],
  ]);

  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 0;
  }

  scan() {
    while (!this.#atEnd()) {
      this.start = this.current;
      this.#scanToken();
    }

    this.#addToken(TokenType.EOF);

    return this.tokens;
  }

  #scanToken() {
    const char = this.#advance();

    switch (char) {
      case "(":
        this.#addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.#addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.#addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.#addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.#addToken(TokenType.COMMA);
        break;
      case ".":
        this.#addToken(TokenType.DOT);
        break;
      case "-":
        this.#addToken(TokenType.MINUS);
        break;
      case "+":
        this.#addToken(TokenType.PLUS);
        break;
      case ";":
        this.#addToken(TokenType.SEMICOLON);
        break;
      case "/":
        if (this.#match("/")) {
          while (this.#peek() !== "\n" && !this.#atEnd()) {
            this.#advance();
          }
        } else {
          this.#addToken(TokenType.SLASH);
        }
        break;
      case "*":
        this.#addToken(TokenType.STAR);
        break;
      case "!":
        this.#addToken(
          this.#match("=") ? TokenType.BANG_EQUAL : TokenType.BANG
        );
        break;
      case "=":
        this.#addToken(
          this.#match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case ">":
        this.#addToken(
          this.#match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "<":
        this.#addToken(
          this.#match("=") ? TokenType.LESS_EQUAL : TokenType.LESS
        );
        break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line++;
        break;
      case '"':
        this.#string();
      default: {
        if (this.#isDigit(char)) {
          this.#number();
        } else if (this.#isAlpha(char)) {
          this.#identifier();
        } else {
          throw new Error("Unexpected character.");
        }
      }
    }
  }

  #identifier() {
    while (this.#isAlphaNumeric(this.#peek()) && !this.#atEnd()) {
      this.#advance();
    }

    const text = this.source.substring(this.start, this.current);
    let tokenType = TokenType.IDENTIFIER;

    if (this.keyword.has(text)) {
      tokenType = this.keyword.get(text);
    }

    this.#addToken(tokenType, text);
  }

  #isAlphaNumeric(char) {
    return this.#isAlpha(char) || this.#isDigit(char);
  }

  #isAlpha(char) {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  #number() {
    while (this.#isDigit(this.#peek()) && !this.#atEnd()) {
      this.#advance();
    }

    if (this.#match(".")) {
      while (this.#isDigit(this.#peek()) && !this.#atEnd()) {
        this.#advance();
      }
    }

    return this.#addToken(
      TokenType.NUMBER,
      parseFloat(this.source.substring(this.start, this.current))
    );
  }

  #isDigit(char) {
    return char >= "0" && char <= "9";
  }

  #string() {
    while (this.#peek() != '"' && !this.#atEnd()) {
      if (this.#advance() === "\n") this.line++;
    }

    if (this.#atEnd()) {
      throw new Error("Unterminated string.");
    }

    this.#advance();
    this.#addToken(
      TokenType.STRING,
      this.source.substring(this.start + 1, this.current - 1)
    );
  }

  #addToken(tokenType, literal) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push(new Token(tokenType, lexeme, literal, this.line));
  }

  #peek() {
    return this.source[this.current];
  }

  #match(char) {
    if (this.#atEnd()) return false;
    if (this.source[this.current] !== char) return false;

    this.#advance();

    return true;
  }

  #advance() {
    if (this.#atEnd()) return;
    return this.source[this.current++];
  }

  #atEnd() {
    return this.current >= this.source.length;
  }
}

export default Lexer;
