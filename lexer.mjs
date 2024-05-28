import Token from "./token.mjs";
import TokenType from "./token-type.mjs";

class Lexer {
  constructor(source) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  scan() {
    while (!this.#atEnd()) {
      this.start = this.current;
      this.#scanToken();
    }

    return this.tokens;
  }

  #scanToken() {
    const char = this.#advance();
    console.log(char);

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
    }
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
