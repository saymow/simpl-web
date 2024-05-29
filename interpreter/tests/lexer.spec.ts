import Lexer from "../lib/lexer";
import TokenType from "../lib/token-type";

describe("Lexer)", () => {
  it("Shoud append EOF at end", () => {
    const tokens = new Lexer("").scan();

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.EOF);
  });
});
