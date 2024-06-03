import TokenType from "./token-type";

class Token<T extends TokenType[keyof TokenType] | void = void> {
  constructor(
    public type: T extends TokenType ? T : TokenType,
    public lexeme: string,
    public literal: any,
    public line: number,
    public startIdx: number,
    public length: number
  ) {}
}

export default Token;
