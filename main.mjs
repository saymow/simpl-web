import Lexer from "./lexer.mjs";
import Parser from "./parser.mjs";

const source = `
    1 * 3 + 5 - 3 > 9
`;
console.log(source);
const tokens = new Lexer(source).scan();
console.log(tokens);
const ast = new Parser(tokens).parse();

console.log(ast);
