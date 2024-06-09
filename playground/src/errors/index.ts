import { Token } from "../../../language";

export class TokenError extends Error {
  constructor(public readonly token: Token, message: string) {
    super(message);
  }
}
