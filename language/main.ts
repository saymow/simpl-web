import fs from "fs";
import Lexer from "./lib/lexer";
import Parser from "./lib/parser";
import Interpreter from "./lib/interpreter";
import Resolver from "./lib/resolver";

async function run(source: string) {
  const tokens = new Lexer(source).scan();
  const ast = new Parser(tokens).parse();
  const interpreter = new Interpreter(ast, {
    log: console.log,
    clear: () => {},
    input: () => Promise.resolve("to-do"),
  });
  const resolver = new Resolver(interpreter);

  await resolver.resolve(ast);
  await interpreter.interpret();
}

function start() {
    if (process.argv.length < 3) {
      console.error("Usage: simpl ./file.simpl");
      process.exit(1);
    }

  const filename = process.argv[2];

  fs.readFile(filename, (err, buffer) => {
    if (err) {
      console.error("Error: ", err.message);
      process.exit(1);
    }

    const source = buffer.toString();

    run(source)
      .catch((err) => {
        console.error("Error: ", err.message, err.token);
        process.exit(1);
      })
      .then(() => {
        process.exit(0);
      });
  });
}

start();
