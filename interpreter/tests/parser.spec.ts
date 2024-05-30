import Token from "../lib/token";
import Parser from "../lib/parser";
import TokenType from "../lib/token-type";
import {
  Assign,
  Binary,
  Call,
  Get,
  Grouping,
  Literal,
  Logical,
  Super,
  This,
  Unary,
  Variable,
  Set,
  Expr,
} from "../lib/expression";
import { BlockStmt, ExprStmt } from "../lib/statement";

const WrapExpr = (expr: Expr): ExprStmt => {
  return new ExprStmt(expr);
};

describe("Parser", () => {
  describe("Should handle primaries", () => {
    it('true; false; nil; 77; "some-string"; this; myVar; super.method;', () => {
      expect(
        new Parser([
          new Token(TokenType.TRUE, "true", true, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.FALSE, "false", false, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.NIL, "nil", null, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.NUMBER, "77", "77", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.STRING, '"some-string"', "some-string", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.THIS, "this", undefined, 2),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 3),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.SUPER, "super", undefined, 4),
          new Token(TokenType.DOT, ".", undefined, 4),
          new Token(TokenType.IDENTIFIER, "method", undefined, 4),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 5),
        ]).parse()
      ).toEqual([
        WrapExpr(new Literal(true)),
        WrapExpr(new Literal(false)),
        WrapExpr(new Literal(null)),
        WrapExpr(new Literal("77")),
        WrapExpr(new Literal("some-string")),
        WrapExpr(new This(new Token(TokenType.THIS, "this", undefined, 2))),
        WrapExpr(
          new Variable(new Token(TokenType.IDENTIFIER, "myVar", "myVar", 3))
        ),
        WrapExpr(
          new Super(
            new Token(TokenType.SUPER, "super", undefined, 4),
            new Token(TokenType.IDENTIFIER, "method", undefined, 4)
          )
        ),
      ]);
    });

    it("(3);", () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
          new Token(TokenType.NUMBER, "3", "3", 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 3),
        ]).parse()
      ).toEqual([WrapExpr(new Grouping(new Literal("3")))]);
    });

    it("((1));", () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
          new Token(TokenType.NUMBER, "1", "1", 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([WrapExpr(new Grouping(new Grouping(new Literal("1"))))]);
    });
  });

  describe("Should handle calls", () => {
    it("myVar.property;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1),
          new Token(TokenType.DOT, ".", ".", 1),
          new Token(TokenType.IDENTIFIER, "property", "property", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Get(
            new Variable(new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1)),
            new Token(TokenType.IDENTIFIER, "property", "property", 1)
          )
        ),
      ]);
    });

    it("myVar.property.other;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1),
          new Token(TokenType.DOT, ".", ".", 1),
          new Token(TokenType.IDENTIFIER, "property", "property", 1),
          new Token(TokenType.DOT, ".", ".", 1),
          new Token(TokenType.IDENTIFIER, "other", "other", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Get(
            new Get(
              new Variable(
                new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1)
              ),
              new Token(TokenType.IDENTIFIER, "property", "property", 1)
            ),
            new Token(TokenType.IDENTIFIER, "other", "other", 1)
          )
        ),
      ]);
    });

    it("myVar();", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Call(
            new Variable(new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1)),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
            []
          )
        ),
      ]);
    });

    it('myVar(arg1, "str", 77);', () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1),
          new Token(TokenType.IDENTIFIER, "arg1", "arg1v", 1),
          new Token(TokenType.COMMA, ",", undefined, 1),
          new Token(TokenType.STRING, '"str"', "str", 1),
          new Token(TokenType.COMMA, ",", undefined, 1),
          new Token(TokenType.NUMBER, "77", "77", 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Call(
            new Variable(new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1)),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
            [
              new Variable(new Token(TokenType.IDENTIFIER, "arg1", "arg1v", 1)),
              new Literal("str"),
              new Literal("77"),
            ]
          )
        ),
      ]);
    });
  });

  describe("Should handle unaries", () => {
    it("-77;", () => {
      expect(
        new Parser([
          new Token(TokenType.MINUS, "MINUS", undefined, 1),
          new Token(TokenType.NUMBER, "77", "77", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Unary(
            new Token(TokenType.MINUS, "MINUS", undefined, 1),
            new Literal("77")
          )
        ),
      ]);
    });

    it("!77;", () => {
      expect(
        new Parser([
          new Token(TokenType.BANG, "BANG", undefined, 1),
          new Token(TokenType.NUMBER, "77", "77", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Unary(
            new Token(TokenType.BANG, "BANG", undefined, 1),
            new Literal("77")
          )
        ),
      ]);
    });
  });

  describe("Should handle binaries", () => {
    it("4 + 2 - 10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.MINUS, "-", undefined, 1),
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
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
    });

    it("4 / 2 + 10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.SLASH, "/", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Binary(
            new Binary(
              new Literal("4"),
              new Token(TokenType.SLASH, "/", undefined, 1),
              new Literal("2")
            ),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new Literal("10")
          )
        ),
      ]);
    });

    it("10 + 4 / 2;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.STAR, "*", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Binary(
            new Literal("10"),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new Binary(
              new Literal("4"),
              new Token(TokenType.STAR, "*", undefined, 1),
              new Literal("2")
            )
          )
        ),
      ]);
    });

    it("4 + 2 - 10 >= 50;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.MINUS, "-", undefined, 1),
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.GREATER_EQUAL, ">=", undefined, 1),
          new Token(TokenType.NUMBER, "50", "50", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
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
          )
        ),
      ]);
    });

    it("50 <= 4 + 2 - 10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "50", "50", 1),
          new Token(TokenType.LESS_EQUAL, "<=", undefined, 1),
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.MINUS, "-", undefined, 1),
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
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
          )
        ),
      ]);
    });

    it("50 != 4 + 2;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "50", "50", 1),
          new Token(TokenType.BANG_EQUAL, "!=", undefined, 1),
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Binary(
            new Literal("50"),
            new Token(TokenType.BANG_EQUAL, "!=", undefined, 1),
            new Binary(
              new Literal("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new Literal("2")
            )
          )
        ),
      ]);
    });

    it('"test" == "tset";', () => {
      expect(
        new Parser([
          new Token(TokenType.STRING, '"test"', "test", 1),
          new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1),
          new Token(TokenType.STRING, '"tset"', "tset", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Binary(
            new Literal("test"),
            new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1),
            new Literal("tset")
          )
        ),
      ]);
    });
  });

  describe("Should handle logic operators", () => {
    it("4 + 2 and 10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.AND, "and", undefined, 1),
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Logical(
            new Binary(
              new Literal("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new Literal("2")
            ),
            new Token(TokenType.AND, "and", undefined, 1),
            new Literal("10")
          )
        ),
      ]);
    });

    it("10 or 4 + 2;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.OR, "or", undefined, 1),
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Logical(
            new Literal("10"),
            new Token(TokenType.OR, "or", undefined, 1),
            new Binary(
              new Literal("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new Literal("2")
            )
          )
        ),
      ]);
    });

    it("4 and 2 or 10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.AND, "and", undefined, 1),
          new Token(TokenType.NUMBER, "2", "2", 1),
          new Token(TokenType.OR, "or", undefined, 1),
          new Token(TokenType.NUMBER, "10", "10", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Logical(
            new Logical(
              new Literal("4"),
              new Token(TokenType.AND, "and", undefined, 1),
              new Literal("2")
            ),
            new Token(TokenType.OR, "or", undefined, 1),
            new Literal("10")
          )
        ),
      ]);
    });
  });

  describe("Should handle assignments", () => {
    it("a = 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1),
          new Token(TokenType.EQUAL, "=", undefined, 1),
          new Token(TokenType.NUMBER, "5", "5", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Assign(
            new Token(TokenType.IDENTIFIER, "a", "a", 1),
            new Literal("5")
          )
        ),
      ]);
    });

    it("a = b = 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1),
          new Token(TokenType.EQUAL, "=", undefined, 1),
          new Token(TokenType.IDENTIFIER, "b", "b", 1),
          new Token(TokenType.EQUAL, "=", undefined, 1),
          new Token(TokenType.NUMBER, "5", "5", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Assign(
            new Token(TokenType.IDENTIFIER, "a", "a", 1),
            new Assign(
              new Token(TokenType.IDENTIFIER, "b", "b", 1),
              new Literal("5")
            )
          )
        ),
      ]);
    });

    it("object.prop = 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "object", "object", 1),
          new Token(TokenType.DOT, ".", undefined, 1),
          new Token(TokenType.IDENTIFIER, "prop", "prop", 1),
          new Token(TokenType.EQUAL, "=", undefined, 1),
          new Token(TokenType.NUMBER, "5", "5", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new Set(
            new Variable(
              new Token(TokenType.IDENTIFIER, "object", "object", 1)
            ),
            new Token(TokenType.IDENTIFIER, "prop", "prop", 1),
            new Literal("5")
          )
        ),
      ]);
    });
  });

  describe("Should handle block statement", () => {
    it("{ true; }", () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1),
          new Token(TokenType.TRUE, "true", true, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([new BlockStmt([new ExprStmt(new Literal(true))])]);
    });

    it('{ true; "str"; 4 + 5; }', () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1),
          new Token(TokenType.TRUE, "true", true, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.STRING, '"str"', "str", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, '+', undefined, 1),
          new Token(TokenType.NUMBER, "5", "5", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        new BlockStmt([
          new ExprStmt(new Literal(true)),
          new ExprStmt(new Literal("str")),
          new ExprStmt(
            new Binary(
              new Literal("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new Literal("5")
            )
          ),
        ]),
      ]);
    });
  });
});
