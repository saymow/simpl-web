import { useEffect, useMemo, useState } from "react";
import {
  Interpreter,
  Lexer,
  LexerError,
  Parser,
  ParserError,
  RuntimeError,
  Stmt,
  Token,
} from "../interpreter";
import "./App.css";
import Button from "./components/Button";
import Environment from "./components/Environment";
import { CustomParserError, TokenError } from "./errors";
import { bindTokens } from "./helpers";
import { Terminal, TerminalIn, TerminalOut } from "./interfaces";
import { INITIAL_PROGRAM } from "./data";

type Program = Stmt[];

interface ProgramMetadata {
  tokens: Token[];
  program: Program;
}

function App() {
  const [source, setSource] = useState(INITIAL_PROGRAM);
  const [syntaxHighlightedSource, setSyntaxHighlightedSource] =
    useState<string>();
  const [programMetadata, setProgramMetadata] =
    useState<ProgramMetadata | null>(null);
  const [terminal, setTerminal] = useState<Terminal[]>([]);
  const isValidState = useMemo(
    () => programMetadata != null,
    [programMetadata]
  );

  useEffect(() => {
    try {
      const tokens = new Lexer(source).scan();
      let syntaxTree;

      try {
        syntaxTree = new Parser(tokens).parse();
      } catch (err) {
        if (err instanceof ParserError) {
          throw new CustomParserError(
            tokens,
            err.token,
            err.message,
            err.stack
          );
        }

        throw Error("Unexpected error");
      }

      setProgramMetadata({ program: syntaxTree, tokens });
      setSyntaxHighlightedSource(bindTokens(source, tokens));
    } catch (err) {
      setProgramMetadata(null);
      if (err instanceof LexerError) {
        setSyntaxHighlightedSource(bindTokens(source, err.tokens));
      } else if (err instanceof CustomParserError) {
        console.log(err);
        setSyntaxHighlightedSource(
          bindTokens(source, err.tokens, new TokenError(err.token, err.message))
        );
      } else {
        setSyntaxHighlightedSource(undefined);
        console.error("Unexpected error: ", err);
      }
    }
  }, [source, setProgramMetadata]);

  const handleOutputLine = (message: string) => {
    setTerminal((prev) => [...prev, new TerminalOut(message)]);
  };

  const handleInputLine = async (): Promise<string> => {
    return new Promise((resolve) => {
      setTerminal((prev) => [
        ...prev,
        new TerminalIn((input) => resolve(input)),
      ]);
    });
  };

  const handleClearTerminal = () => {
    setTerminal([]);
  };

  const handleRun = async () => {
    if (!programMetadata) return;

    try {
      setTerminal([]);
      const interpreter = new Interpreter(programMetadata.program, {
        log: handleOutputLine,
        input: handleInputLine,
        clear: handleClearTerminal,
      });
      await interpreter.interpret();
    } catch (err) {
      if (err instanceof RuntimeError) {
        console.log(err.token, err.message);
        setSyntaxHighlightedSource(
          bindTokens(
            source,
            programMetadata.tokens,
            new TokenError(err.token, err.message)
          )
        );
        return;
      }

      console.error("Unexpected error: ", err);
    }
  };

  return (
    <main className="container">
      <header>
        <Button disabled={!isValidState} onClick={handleRun}>
          Run
        </Button>
      </header>
      <Environment
        source={source}
        onSourceChange={setSource}
        syntaxHighlightedSource={syntaxHighlightedSource}
        terminal={terminal}
      />
    </main>
  );
}

export default App;
