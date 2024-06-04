import { useMemo, useState } from "react";
import { Interpreter, RuntimeError } from "../interpreter";
import "./App.css";
import Button from "./components/Button";
import Environment, { Program } from "./components/Environment";
import { TokenError } from "./errors";
import { bindTokens } from "./helpers";
import { Terminal, TerminalIn, TerminalOut } from "./interfaces";

function App() {
  const [program, setProgram] = useState<Program | null>(null);
  const [terminal, setTerminal] = useState<Terminal[]>([]);
  const isValidState = useMemo(() => program != null, [program]);

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
      const interpreter = new Interpreter(program, {
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
      <Environment
        program={program}
        onProgramChange={setProgram}
        terminal={terminal}
      />
    </main>
  );
}

export default App;
