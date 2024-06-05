import { Token, ParserError as LngParserError } from "../../../language";

export class CustomParserError extends LngParserError {
  constructor(
    public readonly tokens: Token[],
    token: Token,
    message: string,
    public readonly stack?: string
  ) {
    super(token, message);
  }
}

export class TokenError extends Error {
  constructor(public readonly token: Token, message: string) {
    super(message);
  }
}
