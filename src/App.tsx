import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  Lexer,
  Parser,
  Stmt,
  Token,
  Interpreter,
  LexerError,
  RuntimeError,
  ParserError,
} from "../interpreter";
import { Terminal, TerminalIn, TerminalOut } from "./interfaces";
import TerminalComponent from "./components/Terminal";
import Editor from "./components/Editor";
import { CustomParserError, TokenError } from "./errors";
import { bindTokens } from "./helpers";
import Button from "./components/Button";
import { INITIAL_PROGRAM } from "./data";

interface Program {
  tokens: Token[];
  syntaxTree: Stmt[];
}

function App() {
  const [source, setSource] = useState(INITIAL_PROGRAM);
  const [formattedSource, setFormattedSource] = useState<string>();
  const [program, setProgram] = useState<Program>();
  const [terminal, setTerminal] = useState<Terminal[]>([]);
  const isValidState = useMemo(() => program != null, [program]);

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

      setProgram({ tokens, syntaxTree });
      setFormattedSource(bindTokens(source, tokens));
    } catch (err) {
      setProgram(undefined);
      if (err instanceof LexerError) {
        setFormattedSource(bindTokens(source, err.tokens));
      } else if (err instanceof CustomParserError) {
        console.log(err);
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
    setTerminal((prev) => [...prev, new TerminalOut(message)]);
  };

  const handleInput = async (text: string): Promise<string> => {
    return new Promise((resolve) => {
      setTerminal((prev) => [
        ...prev,
        new TerminalIn(text, (input) => resolve(input)),
      ]);
    });
  };

  const handleRun = async () => {
    if (!program) return;

    try {
      setTerminal([]);
      const interpreter = new Interpreter(program.syntaxTree, {
        log: appendOutputLine,
        input: handleInput,
      });
      await interpreter.interpret();
    } catch (err) {
      if (err instanceof RuntimeError) {
        console.log(err.token, err.message);
        setFormattedSource(
          bindTokens(
            source,
            program.tokens,
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
      <article className="editor">
        <Editor
          source={source}
          formattedSource={formattedSource}
          setSource={setSource}
        />
        <TerminalComponent lines={terminal} />
      </article>
    </main>
  );
}

export default App;
