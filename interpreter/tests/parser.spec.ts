import Token from "../lib/token";
import Parser from "../lib/parser";
import TokenType from "../lib/token-type";
import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  GetExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  SuperExpr,
  ThisExpr,
  UnaryExpr,
  VariableExpr,
  SetExpr,
  Expr,
} from "../lib/expression";
import { BlockStmt, ExprStmt, PrintStmt } from "../lib/statement";

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
        WrapExpr(new LiteralExpr(true)),
        WrapExpr(new LiteralExpr(false)),
        WrapExpr(new LiteralExpr(null)),
        WrapExpr(new LiteralExpr("77")),
        WrapExpr(new LiteralExpr("some-string")),
        WrapExpr(new ThisExpr(new Token(TokenType.THIS, "this", undefined, 2))),
        WrapExpr(
          new VariableExpr(new Token(TokenType.IDENTIFIER, "myVar", "myVar", 3))
        ),
        WrapExpr(
          new SuperExpr(
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
      ).toEqual([WrapExpr(new GroupingExpr(new LiteralExpr("3")))]);
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
      ).toEqual([
        WrapExpr(new GroupingExpr(new GroupingExpr(new LiteralExpr("1")))),
      ]);
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
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1)
            ),
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
          new GetExpr(
            new GetExpr(
              new VariableExpr(
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
          new CallExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1)
            ),
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
          new CallExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1)
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
            [
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "arg1", "arg1v", 1)
              ),
              new LiteralExpr("str"),
              new LiteralExpr("77"),
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
          new UnaryExpr(
            new Token(TokenType.MINUS, "MINUS", undefined, 1),
            new LiteralExpr("77")
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
          new UnaryExpr(
            new Token(TokenType.BANG, "BANG", undefined, 1),
            new LiteralExpr("77")
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
          new BinaryExpr(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.MINUS, "-", undefined, 1),
            new LiteralExpr("10")
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
          new BinaryExpr(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.SLASH, "/", undefined, 1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new LiteralExpr("10")
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
          new BinaryExpr(
            new LiteralExpr("10"),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.STAR, "*", undefined, 1),
              new LiteralExpr("2")
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
          new BinaryExpr(
            new BinaryExpr(
              new BinaryExpr(
                new LiteralExpr("4"),
                new Token(TokenType.PLUS, "+", undefined, 1),
                new LiteralExpr("2")
              ),
              new Token(TokenType.MINUS, "-", undefined, 1),
              new LiteralExpr("10")
            ),
            new Token(TokenType.GREATER_EQUAL, ">=", undefined, 1),
            new LiteralExpr("50")
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
          new BinaryExpr(
            new LiteralExpr("50"),
            new Token(TokenType.LESS_EQUAL, "<=", undefined, 1),
            new BinaryExpr(
              new BinaryExpr(
                new LiteralExpr("4"),
                new Token(TokenType.PLUS, "+", undefined, 1),
                new LiteralExpr("2")
              ),
              new Token(TokenType.MINUS, "-", undefined, 1),
              new LiteralExpr("10")
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
          new BinaryExpr(
            new LiteralExpr("50"),
            new Token(TokenType.BANG_EQUAL, "!=", undefined, 1),
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new LiteralExpr("2")
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
          new BinaryExpr(
            new LiteralExpr("test"),
            new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1),
            new LiteralExpr("tset")
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
          new LogicalExpr(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.AND, "and", undefined, 1),
            new LiteralExpr("10")
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
          new LogicalExpr(
            new LiteralExpr("10"),
            new Token(TokenType.OR, "or", undefined, 1),
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new LiteralExpr("2")
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
          new LogicalExpr(
            new LogicalExpr(
              new LiteralExpr("4"),
              new Token(TokenType.AND, "and", undefined, 1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.OR, "or", undefined, 1),
            new LiteralExpr("10")
          )
        ),
      ]);
    });
  });

  describe("Should handle assignExprments", () => {
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
          new AssignExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1),
            new LiteralExpr("5")
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
          new AssignExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1),
            new AssignExpr(
              new Token(TokenType.IDENTIFIER, "b", "b", 1),
              new LiteralExpr("5")
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
          new SetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "object", "object", 1)
            ),
            new Token(TokenType.IDENTIFIER, "prop", "prop", 1),
            new LiteralExpr("5")
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
      ).toEqual([new BlockStmt([new ExprStmt(new LiteralExpr(true))])]);
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
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "5", "5", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        new BlockStmt([
          new ExprStmt(new LiteralExpr(true)),
          new ExprStmt(new LiteralExpr("str")),
          new ExprStmt(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1),
              new LiteralExpr("5")
            )
          ),
        ]),
      ]);
    });
  });

  describe("Should handle print statement", () => {
    it("print true;", () => {
      expect(
        new Parser([
          new Token(TokenType.PRINT, "print", undefined, 1),
          new Token(TokenType.TRUE, "true", true, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([new PrintStmt(new LiteralExpr(true))]);
    });

    it("print 4 + 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.PRINT, "print", undefined, 1),
          new Token(TokenType.NUMBER, "4", "4", 1),
          new Token(TokenType.PLUS, "+", undefined, 1),
          new Token(TokenType.NUMBER, "5", "5", 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1),
          new Token(TokenType.EOF, "", undefined, 2),
        ]).parse()
      ).toEqual([
        new PrintStmt(
          new BinaryExpr(
            new LiteralExpr("4"),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new LiteralExpr("5")
          )
        ),
      ]);
    });
  });
});
