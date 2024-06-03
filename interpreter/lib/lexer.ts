import { LexerError } from "./errors";
import Token from "./token";
import TokenType from "./token-type";

class Lexer {
  static Keywords = new Map([
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
    ["true", TokenType.TRUE],
    ["var", TokenType.VAR],
    ["while", TokenType.WHILE],
    ["error", TokenType.ERROR],
  ]);

  private source: string;
  private tokens: Token[];
  private start: number;
  private current: number;
  private line: number;

  constructor(source: string) {
    this.source = source;
    this.tokens = [];
    this.start = 0;
    this.current = 0;
    this.line = 1;
  }

  scan(): Token[] {
    while (!this.atEnd()) {
      this.start = this.current;
      this.scanToken();
    }

    this.addToken(TokenType.EOF);

    return this.tokens;
  }

  private scanToken() {
    const char = this.advance();

    switch (char) {
      case "(":
        this.addToken(TokenType.LEFT_PAREN);
        break;
      case ")":
        this.addToken(TokenType.RIGHT_PAREN);
        break;
      case "{":
        this.addToken(TokenType.LEFT_BRACE);
        break;
      case "}":
        this.addToken(TokenType.RIGHT_BRACE);
        break;
      case ",":
        this.addToken(TokenType.COMMA);
        break;
      case ".":
        this.addToken(TokenType.DOT);
        break;
      case "-":
        if (this.match("-")) {
          this.addToken(TokenType.MINUS_MINUS);
        } else if (this.match("=")) {
          this.addToken(TokenType.MINUS_EQUAL);
        } else {
          this.addToken(TokenType.MINUS);
        }
        break;
      case "+":
        if (this.match("+")) {
          this.addToken(TokenType.PLUS_PLUS);
        } else if (this.match("=")) {
          this.addToken(TokenType.PLUS_EQUAL);
        } else {
          this.addToken(TokenType.PLUS);
        }
        break;
      case ";":
        this.addToken(TokenType.SEMICOLON);
        break;
      case "/":
        if (this.match("=")) {
          this.addToken(TokenType.SLASH_EQUAL);
        } else if (this.match("/")) {
          while (this.peek() !== "\n" && !this.atEnd()) {
            this.advance();
          }
        } else {
          this.addToken(TokenType.SLASH);
        }
        break;
      case "*":
        if (this.match("=")) {
          this.addToken(TokenType.STAR_EQUAL);
        } else {
          this.addToken(TokenType.STAR);
        }
        break;
      case "!":
        this.addToken(this.match("=") ? TokenType.BANG_EQUAL : TokenType.BANG);
        break;
      case "=":
        this.addToken(
          this.match("=") ? TokenType.EQUAL_EQUAL : TokenType.EQUAL
        );
        break;
      case ">":
        this.addToken(
          this.match("=") ? TokenType.GREATER_EQUAL : TokenType.GREATER
        );
        break;
      case "<":
        this.addToken(this.match("=") ? TokenType.LESS_EQUAL : TokenType.LESS);
        break;
      case " ":
      case "\r":
      case "\t":
        break;
      case "\n":
        this.line++;
        break;
      case '"':
        this.string();
        break;
      default: {
        if (this.isDigit(char!)) {
          this.number();
        } else if (this.isAlpha(char!)) {
          this.identifier();
        } else {
          this.error(this.line, "Unexpected character.");
        }
      }
    }
  }

  private identifier() {
    while (this.isAlphaNumeric(this.peek()) && !this.atEnd()) {
      this.advance();
    }

    const text = this.source.substring(this.start, this.current);
    let tokenType = TokenType.IDENTIFIER;

    if (Lexer.Keywords.has(text)) {
      tokenType = Lexer.Keywords.get(text) as TokenType;
    }

    this.addToken(tokenType, text);
  }

  private isAlphaNumeric(char: string) {
    return this.isAlpha(char) || this.isDigit(char);
  }

  private isAlpha(char: string) {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  private number() {
    while (this.isDigit(this.peek()) && !this.atEnd()) {
      this.advance();
    }

    if (this.match(".")) {
      while (this.isDigit(this.peek()) && !this.atEnd()) {
        this.advance();
      }
    }

    this.addToken(
      TokenType.NUMBER,
      parseFloat(this.source.substring(this.start, this.current))
    );
  }

  private isDigit(char: string) {
    return char >= "0" && char <= "9";
  }

  private string() {
    while (this.peek() != '"' && !this.atEnd()) {
      if (this.advance() === "\n") this.line++;
    }

    if (this.atEnd()) {
      this.error(this.line, "Unterminated string.");
      return;
    }

    this.advance();
    this.addToken(
      TokenType.STRING,
      this.source.substring(this.start + 1, this.current - 1)
    );
  }

  private addToken(tokenType: TokenType, literal?: any) {
    const lexeme = this.source.substring(this.start, this.current);
    this.tokens.push(
      new Token(
        tokenType,
        lexeme,
        literal,
        this.line,
        this.start,
        this.current - this.start
      )
    );
  }

  private peek() {
    return this.source[this.current];
  }

  private match(char: string) {
    if (this.atEnd()) return false;
    if (this.source[this.current] !== char) return false;

    this.advance();

    return true;
  }

  private advance() {
    if (this.atEnd()) return;
    return this.source[this.current++];
  }

  private atEnd() {
    return this.current >= this.source.length;
  }

  private error(line: number, message: string) {
    throw new LexerError(this.tokens, `[line ${line} ]: ${message}`);
  }
}

export default Lexer;
