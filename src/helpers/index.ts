import { Token, TokenType } from "../../interpreter";
import { TokenError } from "../errors";

export const wrapTokenLexeme = (
  token: Token,
  errorMessage?: string
): string => {
  const classNames = ["token"];

  switch (token.type) {
    case TokenType.CLASS:
    case TokenType.VAR:
    case TokenType.FUN:
      classNames.push("declaration");
      break;
    case TokenType.IF:
    case TokenType.ELSE:
    case TokenType.FOR:
    case TokenType.WHILE:
    case TokenType.PRINT:
    case TokenType.RETURN:
      classNames.push("statement");
      break;
    case TokenType.LEFT_BRACE:
    case TokenType.RIGHT_BRACE:
      classNames.push("braces");
      break;
    case TokenType.LEFT_PAREN:
    case TokenType.RIGHT_PAREN:
      classNames.push("parens");
      break;
    case TokenType.IDENTIFIER:
      classNames.push("identifier");
      break;
    case TokenType.OR:
    case TokenType.AND:
      classNames.push("logic_operator");
      break;
    case TokenType.TRUE:
    case TokenType.FALSE:
      classNames.push("bool");
      break;
    case TokenType.NIL:
      classNames.push("nil");
      break;
    case TokenType.STRING:
      classNames.push("string");
      break;
    case TokenType.NUMBER:
      classNames.push("number");
      break;
  }

  return `<span class="${classNames.join(" ")}" ${
    errorMessage ? `data-error="${errorMessage}"` : ""
  }>${token.lexeme}</span>`;
};

export const bindTokens = (
  source: string,
  tokens: Token[],
  tokenError?: TokenError
) => {
  if (tokens.length === 0) return source;

  // skips EOF token
  const length =
    tokens[tokens.length - 1].type === TokenType.EOF
      ? tokens.length - 1
      : tokens.length;
  const formattedSourceParts: string[] = [];
  let startIdx = 0;
  let token: Token;

  for (let idx = 0; idx < length; idx++) {
    token = tokens[idx];
    let tokenErrorMessage;

    if (token.startIdx === tokenError?.token.startIdx) {
      tokenErrorMessage = tokenError.message;
    }

    formattedSourceParts.push(source.substring(startIdx, token.startIdx));
    formattedSourceParts.push(wrapTokenLexeme(token, tokenErrorMessage));
    startIdx = token.startIdx + token.length;
  }

  formattedSourceParts.push(source.substring(startIdx));

  return formattedSourceParts.join("");
};
