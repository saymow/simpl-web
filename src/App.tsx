import { useEffect, useState } from "react";
import "./App.css";
import { Lexer, Parser, Stmt, Token, Interpreter } from "../interpreter";

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

function App() {
  const [source, setSource] = useState("");
  const [output, setOutput] = useState("");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [ast, setAst] = useState<Stmt[]>([]);

  useEffect(() => {
    try {
      setTokens(new Lexer(source).scan());
    } catch (err) {
      console.error("Lexer error: ", err);
    }
  }, [source]);

  useEffect(() => {
    try {
      if (tokens.length === 0) return;
      setAst(new Parser(tokens).parse());
    } catch (err) {
      console.error("Parser error: ");
    }
  }, [tokens]);

  const appendOutputLine = (message: string) => {
    setOutput((prev) => prev.concat(message + "\n"));
  };

  const handleRun = () => {
    try {
      setOutput("");
      interpret(ast, appendOutputLine, () => {});
    } catch (err) {}
  };

  console.log(output);

  return (
    <main className="container">
      <header>
        <button onClick={handleRun}>Run</button>
      </header>
      <section className="editor">
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="input"
        ></textarea>
        <section className="output">{output}</section>
      </section>
    </main>
  );
}

export default App;
