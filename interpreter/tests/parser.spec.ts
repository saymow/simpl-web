import Token from "../lib/token";
import Parser from "../lib/parser";
import TokenType from "../lib/token-type";
import { Binary, Literal, Unary } from "../lib/expression";

describe("Parser", () => {
  it("Should handle Literals", () => {
    const ast = new Parser([
      new Token(TokenType.TRUE, "true", true, 1),
      new Token(TokenType.FALSE, "false", false, 1),
      new Token(TokenType.NIL, "nil", null, 1),
      new Token(TokenType.NUMBER, "true", "77", 1),
      new Token(TokenType.STRING, "true", "some-string", 1),
      new Token(TokenType.EOF, "", undefined, 2),
    ]).parse();

    expect(ast).toEqual([
      new Literal(true),
      new Literal(false),
      new Literal(null),
      new Literal("77"),
      new Literal("some-string"),
    ]);
  });

  it("Should handle unaries", () => {
    expect(
      new Parser([
        new Token(TokenType.MINUS, "MINUS", undefined, 1),
        new Token(TokenType.NUMBER, "77", "77", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Unary(
        new Token(TokenType.MINUS, "MINUS", undefined, 1),
        new Literal("77")
      ),
    ]);

    expect(
      new Parser([
        new Token(TokenType.BANG, "BANG", undefined, 1),
        new Token(TokenType.NUMBER, "77", "77", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Unary(
        new Token(TokenType.BANG, "BANG", undefined, 1),
        new Literal("77")
      ),
    ]);
  });

  it("Should handle binaries", () => {
    // 4 + 2 - 10
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.MINUS, "-", undefined, 1),
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Binary(
        new Binary(
          new Literal("4"),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Literal("2")
        ),
        new Token(TokenType.MINUS, "-", undefined, 1),
        new Literal("10")
      ),
    ]);

    // 4 / 2 + 10
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.SLASH, "/", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Binary(
        new Binary(
          new Literal("4"),
          new Token(TokenType.SLASH, "/", undefined, 1),
          new Literal("2")
        ),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Literal("10")
      ),
    ]);

    // 10 + 4 / 2
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.STAR, "*", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Binary(
        new Literal("10"),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Binary(
          new Literal("4"),
          new Token(TokenType.STAR, "*", undefined, 1),
          new Literal("2")
        )
      ),
    ]);

    // 4 + 2 - 10 >= 50
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.MINUS, "-", undefined, 1),
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.GREATER_EQUAL, ">=", undefined, 1),
        new Token(TokenType.NUMBER, "50", "50", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Binary(
        new Binary(
          new Binary(
            new Literal("4"),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new Literal("2")
          ),
          new Token(TokenType.MINUS, "-", undefined, 1),
          new Literal("10")
        ),
        new Token(TokenType.GREATER_EQUAL, ">=", undefined, 1),
        new Literal("50")
      ),
    ]);

    // 50 <= 4 + 2 - 10
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "50", "50", 1),
        new Token(TokenType.LESS_EQUAL, "<=", undefined, 1),
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.MINUS, "-", undefined, 1),
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Binary(
        new Literal("50"),
        new Token(TokenType.LESS_EQUAL, "<=", undefined, 1),
        new Binary(
          new Binary(
            new Literal("4"),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new Literal("2")
          ),
          new Token(TokenType.MINUS, "-", undefined, 1),
          new Literal("10")
        )
      ),
    ]);

    // 50 != 4 + 2
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "50", "50", 1),
        new Token(TokenType.BANG_EQUAL, "!=", undefined, 1),
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Binary(
        new Literal("50"),
        new Token(TokenType.BANG_EQUAL, "!=", undefined, 1),
        new Binary(
          new Literal("4"),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Literal("2")
        )
      ),
    ]);

    // "test" == "tset"
    expect(
      new Parser([
        new Token(TokenType.STRING, '"test"', "test", 1),
        new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1),
        new Token(TokenType.STRING, '"tset"', "tset", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Binary(
        new Literal("test"),
        new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1),
        new Literal("tset")
      ),
    ]);
  });
});
