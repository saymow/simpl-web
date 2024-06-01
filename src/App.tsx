import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Lexer,
  Parser,
  Stmt,
  Token,
  Interpreter,
  TokenType,
  LexerError,
  ParserError as LngParserError,
} from "../interpreter";

class ParserError extends LngParserError {
  constructor(
    public readonly tokens: Token[],
    token: Token,
    message: string,
    public readonly stack?: string
  ) {
    super(token, message);
  }
}

class TokenError extends Error {
  constructor(public readonly token: Token, message: string) {
    super(message);
  }
}

const interpret = (
  ast: Stmt[],
  log: (message: string) => void,
  error: (message: string) => void
) => {
  const interpreter = new Interpreter(ast, {
    log,
    error,
  });

  interpreter.interpret();
};

const wrapTokenLexeme = (token: Token, errorMessage?: string): string => {
  let classNames = ["token"];

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
      // case TokenType.GREATER:
      // case TokenType.GREATER_EQUAL:
      // case TokenType.LESS:
      // case TokenType.LESS_EQUAL:
      //   classNames.push("operator");
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

const bindTokens = (
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

function App() {
  const [source, setSource] = useState("");
  const [formattedSource, setFormattedSource] = useState<string>();
  const [output, setOutput] = useState("");
  const [syntaxTree, setSyntaxTree] = useState<Stmt[]>();
  const isValidState = useMemo(() => syntaxTree != null, [syntaxTree]);

  useEffect(() => {
    try {
      let ast;
      const tokens = new Lexer(source).scan();

      try {
        ast = new Parser(tokens).parse();
      } catch (err) {
        if (err instanceof LngParserError) {
          throw new ParserError(tokens, err.token, err.message, err.stack);
        }

        throw Error("Unexpected error");
      }

      setSyntaxTree(ast);
      setFormattedSource(bindTokens(source, tokens));
    } catch (err) {
      setSyntaxTree(undefined);
      if (err instanceof LexerError) {
        setFormattedSource(bindTokens(source, err.tokens));
      } else if (err instanceof ParserError) {
        setFormattedSource(
          bindTokens(source, err.tokens, new TokenError(err.token, err.message))
        );
      } else {
        setFormattedSource(undefined);
        console.error("Unexpected error: ", err);
      }
    }
  }, [source]);

  const appendOutputLine = (message: string) => {
    setOutput((prev) => prev.concat(message + "\n"));
  };

  const handleRun = () => {
    if (!syntaxTree) return;

    try {
      setOutput("");
      interpret(syntaxTree, appendOutputLine, () => {});
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="container">
      <header>
        <button disabled={!isValidState} onClick={handleRun}>
          Run
        </button>
      </header>
      <article className="editor">
        <section className="input-container">
          <article
            dangerouslySetInnerHTML={{ __html: formattedSource ?? source }}
            className="input-background"
          ></article>
          <textarea
            className="input"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          />
        </section>
        <section className="output">{output}</section>
      </article>
    </main>
  );
}

export default App;
