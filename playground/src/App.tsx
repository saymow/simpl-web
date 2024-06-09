import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Interpreter,
  Lexer,
  LexerError,
  Parser,
  ParserError,
  Resolver,
  RuntimeError,
  ResolverError,
  Stmt,
  Token,
} from "../../language";
import "./App.css";
import Button from "./components/Button";
import Environment from "./components/Environment";
import { TokenError } from "./errors";
import { bindTokens } from "./helpers";
import { Terminal, TerminalIn, TerminalOut } from "./interfaces";
import { makeSnippet } from "./snippets";

const mockSystem = () => ({
  input: async () => "test",
  log: () => {},
  clear: () => {},
});

type Program = Stmt[];

interface ProgramMetadata {
  tokens: Token[];
  program: Program;
}

function App() {
  const [source, setSource] = useState("");
  const [syntaxHighlightedSource, setSyntaxHighlightedSource] =
    useState<string>();
  const [programMetadata, setProgramMetadata] =
    useState<ProgramMetadata | null>(null);
  const [terminal, setTerminal] = useState<Terminal[]>([]);
  const isValidState = useMemo(
    () => programMetadata != null,
    [programMetadata]
  );

  const handleResolve = useCallback(async () => {
    let tokens;

    try {
      tokens = new Lexer(source).scan();
      const syntaxTree = new Parser(tokens).parse();
      const interpreter = new Interpreter(syntaxTree, mockSystem());
      const resolver = new Resolver(interpreter);

      await resolver.resolve(syntaxTree);

      setProgramMetadata({ program: syntaxTree, tokens });
      setSyntaxHighlightedSource(bindTokens(source, tokens));
    } catch (err) {
      setProgramMetadata(null);
      if (err instanceof LexerError) {
        setSyntaxHighlightedSource(bindTokens(source, err.tokens));
      } else if (err instanceof ParserError || err instanceof ResolverError) {
        console.log(err);
        setSyntaxHighlightedSource(
          bindTokens(source, tokens!, new TokenError(err.token, err.message))
        );
      } else {
        setSyntaxHighlightedSource(undefined);
        console.error("Unexpected error: ", err);
      }
    }
  }, [source]);

  useEffect(() => {
    const params = new URLSearchParams(document.location.search);
    const snippetName = params.get("snippet") ?? "";
    setSource(makeSnippet(snippetName));
  }, []);

  useEffect(() => {
    handleResolve();
  }, [handleResolve]);

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
      const resolver = new Resolver(interpreter);

      await resolver.resolve(programMetadata.program);
      await interpreter.interpret();
    } catch (err) {
      if (err instanceof ResolverError || err instanceof RuntimeError) {
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
