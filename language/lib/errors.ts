import Token from "./token";

export class LexerError extends Error {
  constructor(public readonly tokens: Token[], message: string) {
    super(message);
  }
}

export class ParserError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
  }
}

export class ResolverError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
  }
}

export class RuntimeError extends Error {
  constructor(public token: Token, message: string) {
    super(message);
  }
}

export class BreakStmtException extends Error {}

export class CoreLibError extends Error {}
