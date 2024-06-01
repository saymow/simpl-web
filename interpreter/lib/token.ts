import TokenType from "./token-type";

class Token {
  constructor(
    public type: TokenType,
    public lexeme: string,
    public literal: any,
    public line: number,
    public startIdx: number,
    public length: number, 
  ) {}
}

export default Token;
