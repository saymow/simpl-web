import Lexer from "../lib/lexer";
import TokenType from "../lib/token-type";

describe("Lexer", () => {
  it("Shoud append EOF at end", () => {
    const tokens = new Lexer("").scan();

    expect(tokens.length).toBe(1);
    expect(tokens[0].type).toBe(TokenType.EOF);
  });

  it("Shoud handle single caracter tokens properly", () => {
    const tokens = new Lexer("(){}[],.;:\\").scan();

    expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
    expect(tokens[1].type).toBe(TokenType.RIGHT_PAREN);
    expect(tokens[2].type).toBe(TokenType.LEFT_BRACE);
    expect(tokens[3].type).toBe(TokenType.RIGHT_BRACE);
    expect(tokens[4].type).toBe(TokenType.LEFT_BRACKET);
    expect(tokens[5].type).toBe(TokenType.RIGHT_BRACKET);
    expect(tokens[6].type).toBe(TokenType.COMMA);
    expect(tokens[7].type).toBe(TokenType.DOT);
    expect(tokens[8].type).toBe(TokenType.SEMICOLON);
    expect(tokens[9].type).toBe(TokenType.COLON);
    expect(tokens[10].type).toBe(TokenType.BACK_SLASH);
  });

  it("Shoud handle double caracter tokens properly", () => {
    const tokens = new Lexer("!!====>>=<<=+++=+---=-/=/*=*").scan();

    expect(tokens[0].type).toBe(TokenType.BANG);
    expect(tokens[1].type).toBe(TokenType.BANG_EQUAL);
    expect(tokens[2].type).toBe(TokenType.EQUAL_EQUAL);
    expect(tokens[3].type).toBe(TokenType.EQUAL);
    expect(tokens[4].type).toBe(TokenType.GREATER);
    expect(tokens[5].type).toBe(TokenType.GREATER_EQUAL);
    expect(tokens[6].type).toBe(TokenType.LESS);
    expect(tokens[7].type).toBe(TokenType.LESS_EQUAL);
    expect(tokens[8].type).toBe(TokenType.PLUS_PLUS);
    expect(tokens[9].type).toBe(TokenType.PLUS_EQUAL);
    expect(tokens[10].type).toBe(TokenType.PLUS);
    expect(tokens[11].type).toBe(TokenType.MINUS_MINUS);
    expect(tokens[12].type).toBe(TokenType.MINUS_EQUAL);
    expect(tokens[13].type).toBe(TokenType.MINUS);
    expect(tokens[14].type).toBe(TokenType.SLASH_EQUAL);
    expect(tokens[15].type).toBe(TokenType.SLASH);
    expect(tokens[16].type).toBe(TokenType.STAR_EQUAL);
    expect(tokens[17].type).toBe(TokenType.STAR);
  });

  it("Shoud handle literals properly", () => {
    const tokens = new Lexer('test "str" 77').scan();

    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);

    expect(tokens[1].type).toBe(TokenType.STRING);
    expect(tokens[1].literal).toBe("str");

    expect(tokens[2].type).toBe(TokenType.NUMBER);
    expect(tokens[2].literal).toBe(77);
  });

  it("Shoud handle keywords properly", () => {
    const tokens = new Lexer(
      "and else false for fun if nil or print return true var while error break switch case default"
    ).scan();

    expect(tokens[0].type).toBe(TokenType.AND);
    expect(tokens[1].type).toBe(TokenType.ELSE);
    expect(tokens[2].type).toBe(TokenType.FALSE);
    expect(tokens[3].type).toBe(TokenType.FOR);
    expect(tokens[4].type).toBe(TokenType.FUN);
    expect(tokens[5].type).toBe(TokenType.IF);
    expect(tokens[6].type).toBe(TokenType.NIL);
    expect(tokens[7].type).toBe(TokenType.OR);
    expect(tokens[8].type).toBe(TokenType.PRINT);
    expect(tokens[9].type).toBe(TokenType.RETURN);
    expect(tokens[10].type).toBe(TokenType.TRUE);
    expect(tokens[11].type).toBe(TokenType.VAR);
    expect(tokens[12].type).toBe(TokenType.WHILE);
    expect(tokens[13].type).toBe(TokenType.ERROR);
    expect(tokens[14].type).toBe(TokenType.BREAK);
    expect(tokens[15].type).toBe(TokenType.SWITCH);
    expect(tokens[16].type).toBe(TokenType.CASE);
    expect(tokens[17].type).toBe(TokenType.DEFAULT);
    expect(tokens[18].type).toBe(TokenType.EOF);
  });

  it("Shoud handle lines properly", () => {
    const tokens = new Lexer(
      `1
       2
       3
       4
       5`
    ).scan();

    expect(tokens[0].line).toBe(1);
    expect(tokens[1].line).toBe(2);
    expect(tokens[2].line).toBe(3);
    expect(tokens[3].line).toBe(4);
    expect(tokens[4].line).toBe(5);
  });
});
