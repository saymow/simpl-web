class Token {
  constructor(tokenType, lexeme, literal, line) {
    this.type = tokenType;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }
}

export default Token;
