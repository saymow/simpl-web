import Token from "./token";

export class ParserError extends Error {}

export class RuntimeError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
  }
}
