import Token from "../lib/token";
import Parser from "../lib/parser";
import TokenType from "../lib/token-type";
import {
  Binary,
  Grouping,
  Literal,
  Logical,
  Super,
  This,
  Unary,
} from "../lib/expression";

describe("Parser", () => {
  it("Should handle primaries", () => {
    expect(
      new Parser([
        new Token(TokenType.TRUE, "true", true, 1),
        new Token(TokenType.FALSE, "false", false, 1),
        new Token(TokenType.NIL, "nil", null, 1),
        new Token(TokenType.NUMBER, "77", "77", 1),
        new Token(TokenType.STRING, '"some-thing"', "some-string", 1),
        new Token(TokenType.THIS, "this", undefined, 2),
        new Token(TokenType.SUPER, "super", undefined, 3),
        new Token(TokenType.DOT, ".", undefined, 3),
        new Token(TokenType.IDENTIFIER, "method", undefined, 3),
        new Token(TokenType.EOF, "", undefined, 4),
      ]).parse()
    ).toEqual([
      new Literal(true),
      new Literal(false),
      new Literal(null),
      new Literal("77"),
      new Literal("some-string"),
      new This(new Token(TokenType.THIS, "this", undefined, 2)),
      new Super(
        new Token(TokenType.SUPER, "super", undefined, 3),
        new Token(TokenType.IDENTIFIER, "method", undefined, 3)
      ),
    ]);

    // (3)
    // (4)
    expect(
      new Parser([
        new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
        new Token(TokenType.NUMBER, "3", "3", 1),
        new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
        new Token(TokenType.LEFT_PAREN, "(", undefined, 2),
        new Token(TokenType.NUMBER, "4", "4", 2),
        new Token(TokenType.RIGHT_PAREN, ")", undefined, 2),
        new Token(TokenType.EOF, "", undefined, 3),
      ]).parse()
    ).toEqual([new Grouping(new Literal("3")), new Grouping(new Literal("4"))]);

    // ((1))
    expect(
      new Parser([
        new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
        new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
        new Token(TokenType.NUMBER, "1", "1", 1),
        new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
        new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([new Grouping(new Grouping(new Literal("1")))]);
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

  it("Should handle logic operators", () => {
    // 4 + 2 and 10
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.AND, "and", undefined, 1),
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Logical(
        new Binary(
          new Literal("4"),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Literal("2")
        ),
        new Token(TokenType.AND, "and", undefined, 1),
        new Literal("10")
      ),
    ]);

    // 10 or 4 + 2
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.OR, "or", undefined, 1),
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.PLUS, "+", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Logical(
        new Literal("10"),
        new Token(TokenType.OR, "or", undefined, 1),
        new Binary(
          new Literal("4"),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Literal("2")
        )
      ),
    ]);

    // 4 and 2 or 10
    expect(
      new Parser([
        new Token(TokenType.NUMBER, "4", "4", 1),
        new Token(TokenType.AND, "and", undefined, 1),
        new Token(TokenType.NUMBER, "2", "2", 1),
        new Token(TokenType.OR, "or", undefined, 1),
        new Token(TokenType.NUMBER, "10", "10", 1),
        new Token(TokenType.EOF, "", undefined, 2),
      ]).parse()
    ).toEqual([
      new Logical(
        new Logical(
          new Literal("4"),
          new Token(TokenType.AND, "and", undefined, 1),
          new Literal("2")
        ),
        new Token(TokenType.OR, "or", undefined, 1),
        new Literal("10")
      ),
    ]);
  });
});
