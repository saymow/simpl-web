import Lexer from "./lexer.mjs";

console.log(new Lexer(`
    var a = 445.55;
    var b = 445.55;

    if (a > b) {
        print a + b;
    } else {
        print a - b;
    }
`).scan());
