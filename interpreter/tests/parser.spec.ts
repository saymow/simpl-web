import Token from "../lib/token";
import Parser from "../lib/parser";
import TokenType from "../lib/token-type";
import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  GroupingExpr,
  LiteralExpr,
  LogicalExpr,
  UnaryExpr,
  VariableExpr,
  SetExpr,
  Expr,
  AssignOperatorExpr,
  UnaryOperatorExpr,
  UnaryOperatorType,
} from "../lib/expr";
import {
  BlockStmt,
  ExprStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  VarStmt,
  WhileStmt,
} from "../lib/stmt";

const WrapExpr = (expr: Expr): ExprStmt => {
  return new ExprStmt(expr);
};

describe("Parser", () => {
  describe("Primaries", () => {
    it('true; false; nil; 77; "some-string";  myVar;', () => {
      expect(
        new Parser([
          new Token(TokenType.TRUE, "true", true, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.FALSE, "false", false, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.NIL, "nil", null, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "77", "77", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(
            TokenType.STRING,
            '"some-string"',
            "some-string",
            1,
            -1,
            -1
          ),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),

          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(new LiteralExpr(true)),
        WrapExpr(new LiteralExpr(false)),
        WrapExpr(new LiteralExpr(null)),
        WrapExpr(new LiteralExpr("77")),
        WrapExpr(new LiteralExpr("some-string")),
        WrapExpr(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1, -1, -1)
          )
        ),
      ]);
    });

    it("(3);", () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "3", "3", 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 3, -1, -1),
        ]).parse()
      ).toEqual([WrapExpr(new GroupingExpr(new LiteralExpr("3")))]);
    });

    it("((1));", () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", "1", 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(new GroupingExpr(new GroupingExpr(new LiteralExpr("1")))),
      ]);
    });
  });

  describe("Calls", () => {
    it("myVar();", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new CallExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
            []
          )
        ),
      ]);
    });

    it('myVar(arg1, "str", 77);', () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "arg1", "arg1v", 1, -1, -1),
          new Token(TokenType.COMMA, ",", undefined, 1, -1, -1),
          new Token(TokenType.STRING, '"str"', "str", 1, -1, -1),
          new Token(TokenType.COMMA, ",", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "77", "77", 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new CallExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", "myVar", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
            [
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "arg1", "arg1v", 1, -1, -1)
              ),
              new LiteralExpr("str"),
              new LiteralExpr("77"),
            ]
          )
        ),
      ]);
    });
  });

  describe("Unaries", () => {
    it("-77;", () => {
      expect(
        new Parser([
          new Token(TokenType.MINUS, "MINUS", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "77", "77", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new UnaryExpr(
            new Token(TokenType.MINUS, "MINUS", undefined, 1, -1, -1),
            new LiteralExpr("77")
          )
        ),
      ]);
    });

    it("!77;", () => {
      expect(
        new Parser([
          new Token(TokenType.BANG, "BANG", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "77", "77", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new UnaryExpr(
            new Token(TokenType.BANG, "BANG", undefined, 1, -1, -1),
            new LiteralExpr("77")
          )
        ),
      ]);
    });
  });

  describe("Binaries", () => {
    it("4 + 2 - 1, -1, -10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new BinaryExpr(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
            new LiteralExpr("10")
          )
        ),
      ]);
    });

    it("4 / 2 + 1, -1, -10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.SLASH, "/", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new BinaryExpr(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.SLASH, "/", undefined, 1, -1, -1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
            new LiteralExpr("10")
          )
        ),
      ]);
    });

    it("10 + 4 / 2;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.STAR, "*", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new BinaryExpr(
            new LiteralExpr("10"),
            new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.STAR, "*", undefined, 1, -1, -1),
              new LiteralExpr("2")
            )
          )
        ),
      ]);
    });

    it("4 + 2 - 1, -1, -10 >= 50;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.GREATER_EQUAL, ">=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "50", "50", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new BinaryExpr(
            new BinaryExpr(
              new BinaryExpr(
                new LiteralExpr("4"),
                new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                new LiteralExpr("2")
              ),
              new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
              new LiteralExpr("10")
            ),
            new Token(TokenType.GREATER_EQUAL, ">=", undefined, 1, -1, -1),
            new LiteralExpr("50")
          )
        ),
      ]);
    });

    it("50 <= 4 + 2 - 1, -1, -10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "50", "50", 1, -1, -1),
          new Token(TokenType.LESS_EQUAL, "<=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new BinaryExpr(
            new LiteralExpr("50"),
            new Token(TokenType.LESS_EQUAL, "<=", undefined, 1, -1, -1),
            new BinaryExpr(
              new BinaryExpr(
                new LiteralExpr("4"),
                new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                new LiteralExpr("2")
              ),
              new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
              new LiteralExpr("10")
            )
          )
        ),
      ]);
    });

    it("50 != 4 + 2;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "50", "50", 1, -1, -1),
          new Token(TokenType.BANG_EQUAL, "!=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new BinaryExpr(
            new LiteralExpr("50"),
            new Token(TokenType.BANG_EQUAL, "!=", undefined, 1, -1, -1),
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
              new LiteralExpr("2")
            )
          )
        ),
      ]);
    });

    it('"test" == "tset";', () => {
      expect(
        new Parser([
          new Token(TokenType.STRING, '"test"', "test", 1, -1, -1),
          new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1, -1, -1),
          new Token(TokenType.STRING, '"tset"', "tset", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new BinaryExpr(
            new LiteralExpr("test"),
            new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1, -1, -1),
            new LiteralExpr("tset")
          )
        ),
      ]);
    });
  });

  describe("Logic Operators", () => {
    it("4 + 2 and 1, -1, -10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.AND, "and", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new LogicalExpr(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.AND, "and", undefined, 1, -1, -1),
            new LiteralExpr("10")
          )
        ),
      ]);
    });

    it("10 or 4 + 2;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.OR, "or", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new LogicalExpr(
            new LiteralExpr("10"),
            new Token(TokenType.OR, "or", undefined, 1, -1, -1),
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
              new LiteralExpr("2")
            )
          )
        ),
      ]);
    });

    it("4 and 2 or 1, -1, -10;", () => {
      expect(
        new Parser([
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.AND, "and", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", "2", 1, -1, -1),
          new Token(TokenType.OR, "or", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "10", "10", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new LogicalExpr(
            new LogicalExpr(
              new LiteralExpr("4"),
              new Token(TokenType.AND, "and", undefined, 1, -1, -1),
              new LiteralExpr("2")
            ),
            new Token(TokenType.OR, "or", undefined, 1, -1, -1),
            new LiteralExpr("10")
          )
        ),
      ]);
    });
  });

  describe("Assigments", () => {
    it("a = 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", "5", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new LiteralExpr("5")
          )
        ),
      ]);
    });

    it("a = b = 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "b", "b", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", "5", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new AssignExpr(
              new Token(TokenType.IDENTIFIER, "b", "b", 1, -1, -1),
              new LiteralExpr("5")
            )
          )
        ),
      ]);
    });

    it("a += 1;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
            new LiteralExpr(1)
          )
        ),
      ]);
    });

    it("a -= 1;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.MINUS_EQUAL, "-=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.MINUS_EQUAL, "-=", undefined, 1, -1, -1),
            new LiteralExpr(1)
          )
        ),
      ]);
    });

    it("a += x;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1)
            )
          )
        ),
      ]);
    });

    it("a -= x;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.MINUS_EQUAL, "-=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.MINUS_EQUAL, "-=", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1)
            )
          )
        ),
      ]);
    });

    it("a *= x;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.STAR_EQUAL, "*=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.STAR_EQUAL, "*=", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1)
            )
          )
        ),
      ]);
    });

    it("a /= x;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.SLASH_EQUAL, "/=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new AssignOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.SLASH_EQUAL, "/=", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "x", "x", 1, -1, -1)
            )
          )
        ),
      ]);
    });

    it("a++;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.PLUS_PLUS, "++", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new UnaryOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.PLUS_PLUS, "++", undefined, 1, -1, -1),
            UnaryOperatorType.SUFFIX
          )
        ),
      ]);
    });
    
    it("++a;", () => {
      expect(
        new Parser([
          new Token(TokenType.PLUS_PLUS, "++", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new UnaryOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.PLUS_PLUS, "++", undefined, 1, -1, -1),
            UnaryOperatorType.PREFIX
          )
        ),
      ]);
    });

    it("a--;", () => {
      expect(
        new Parser([
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new UnaryOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
            UnaryOperatorType.SUFFIX
          )
        ),
      ]);
    });

    it("--a;", () => {
      expect(
        new Parser([
          new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        WrapExpr(
          new UnaryOperatorExpr(
            new Token(TokenType.IDENTIFIER, "a", "a", 1, -1, -1),
            new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
            UnaryOperatorType.PREFIX
          )
        ),
      ]);
    });
  });

  describe("Block", () => {
    it("{ true; }", () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.TRUE, "true", true, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([new BlockStmt([new ExprStmt(new LiteralExpr(true))])]);
    });

    it('{ true; "str"; 4 + 5; }', () => {
      expect(
        new Parser([
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.TRUE, "true", true, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.STRING, '"str"', "str", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", "5", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new BlockStmt([
          new ExprStmt(new LiteralExpr(true)),
          new ExprStmt(new LiteralExpr("str")),
          new ExprStmt(
            new BinaryExpr(
              new LiteralExpr("4"),
              new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
              new LiteralExpr("5")
            )
          ),
        ]),
      ]);
    });
  });

  describe("Print", () => {
    it("print true;", () => {
      expect(
        new Parser([
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.TRUE, "true", true, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([new PrintStmt(new LiteralExpr(true))]);
    });

    it("print 4 + 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "4", "4", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", "5", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new PrintStmt(
          new BinaryExpr(
            new LiteralExpr("4"),
            new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
            new LiteralExpr("5")
          )
        ),
      ]);
    });
  });

  describe("VarDeclaration", () => {
    it("var myVar;", () => {
      expect(
        new Parser([
          new Token(TokenType.VAR, "var", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
        ),
      ]);
    });

    it("var myVar = 5;", () => {
      expect(
        new Parser([
          new Token(TokenType.VAR, "var", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", 5, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(5)
        ),
      ]);
    });
  });

  describe("Conditional", () => {
    it('if (2 > 1, -1, -1) print "maior";', () => {
      expect(
        new Parser([
          new Token(TokenType.IF, "if", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", 2, 1, -1, -1),
          new Token(TokenType.GREATER, ">", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.STRING, '"maior"', "maior", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.GREATER, ">", undefined, 1, -1, -1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("maior"))
        ),
      ]);
    });

    it('if (2 > 1, -1, -1) print "maior"; else print "menor";', () => {
      expect(
        new Parser([
          new Token(TokenType.IF, "if", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", 2, 1, -1, -1),
          new Token(TokenType.GREATER, ">", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.STRING, '"maior"', "maior", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.ELSE, "else", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.STRING, '"menor"', "menor", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.GREATER, ">", undefined, 1, -1, -1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("maior")),
          new PrintStmt(new LiteralExpr("menor"))
        ),
      ]);
    });
  });

  describe("Loop", () => {
    it('while (2 < 1, -1, -1) print "never";', () => {
      expect(
        new Parser([
          new Token(TokenType.WHILE, "while", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "2", 2, 1, -1, -1),
          new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.STRING, '"never"', "never", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new WhileStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("never"))
        ),
      ]);
    });

    it("var i = 0; while (i < 5) { print i; i = i + 1, -1, -1; }", () => {
      expect(
        new Parser([
          new Token(TokenType.VAR, "var", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "0", 0, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.WHILE, "while", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", 5, 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, 1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new LiteralExpr(0)
        ),
        new WhileStmt(
          new BinaryExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
            ),
            new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
            new LiteralExpr(5)
          ),
          new BlockStmt([
            new PrintStmt(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
              )
            ),
            new ExprStmt(
              new AssignExpr(
                new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
                new BinaryExpr(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                  ),
                  new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                  new LiteralExpr(1)
                )
              )
            ),
          ])
        ),
      ]);
    });

    it("for (var i = 0; i < 5; i = i + 1, -1, -1) print i;", () => {
      expect(
        new Parser([
          new Token(TokenType.FOR, "for", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.VAR, "var", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "0", 0, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", 5, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new BlockStmt([
          new VarStmt(
            new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
            new LiteralExpr(0)
          ),
          new WhileStmt(
            new BinaryExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
              ),
              new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
              new LiteralExpr(5)
            ),
            new BlockStmt([
              new PrintStmt(
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                )
              ),
              new ExprStmt(
                new AssignExpr(
                  new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
                  new BinaryExpr(
                    new VariableExpr(
                      new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                    ),
                    new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                    new LiteralExpr(1)
                  )
                )
              ),
            ])
          ),
        ]),
      ]);
    });

    it("var i = 0; for (; i < 5; i = i + 1, -1, -1) print i;", () => {
      expect(
        new Parser([
          new Token(TokenType.VAR, "var", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "0", 0, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.FOR, "for", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", 5, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, 1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new LiteralExpr(0)
        ),
        new BlockStmt([
          new WhileStmt(
            new BinaryExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
              ),
              new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
              new LiteralExpr(5)
            ),
            new BlockStmt([
              new PrintStmt(
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                )
              ),
              new ExprStmt(
                new AssignExpr(
                  new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
                  new BinaryExpr(
                    new VariableExpr(
                      new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                    ),
                    new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                    new LiteralExpr(1)
                  )
                )
              ),
            ])
          ),
        ]),
      ]);
    });

    it("var i = 0; for (;i < 5;) { print i; i = i + 1, -1, -1; }", () => {
      expect(
        new Parser([
          new Token(TokenType.VAR, "var", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "0", 0, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.FOR, "for", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "5", 5, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new LiteralExpr(0)
        ),
        new BlockStmt([
          new WhileStmt(
            new BinaryExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
              ),
              new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
              new LiteralExpr(5)
            ),
            new BlockStmt([
              new BlockStmt([
                new PrintStmt(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                  )
                ),
                new ExprStmt(
                  new AssignExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
                    new BinaryExpr(
                      new VariableExpr(
                        new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                      ),
                      new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                      new LiteralExpr(1)
                    )
                  )
                ),
              ]),
            ])
          ),
        ]),
      ]);
    });

    it("var i = 0; for (;;) { print i; i = i + 1, -1, -1; }", () => {
      expect(
        new Parser([
          new Token(TokenType.VAR, "var", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "0", 0, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.FOR, "for", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.EQUAL, "=", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.NUMBER, "1", 1, -1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
          new LiteralExpr(0)
        ),
        new BlockStmt([
          new WhileStmt(
            new LiteralExpr(true),
            new BlockStmt([
              new BlockStmt([
                new PrintStmt(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                  )
                ),
                new ExprStmt(
                  new AssignExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1),
                    new BinaryExpr(
                      new VariableExpr(
                        new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                      ),
                      new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                      new LiteralExpr(1)
                    )
                  )
                ),
              ]),
            ])
          ),
        ]),
      ]);
    });
  });

  describe("Function", () => {
    it("fun fn () {}", () => {
      expect(
        new Parser([
          new Token(TokenType.FUN, '"fun"', undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"fn"', "fn", 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"fn"', "fn", 1, -1, -1),
          [],
          []
        ),
      ]);
    });

    it("fun fn (arg1, arg2) { print arg2; }", () => {
      expect(
        new Parser([
          new Token(TokenType.FUN, '"fun"', undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"fn"', "fn", 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"arg1"', "arg1", 1, -1, -1),
          new Token(TokenType.COMMA, ",", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"arg2"', "arg2", 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.PRINT, "print", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"arg2"', "arg2", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"fn"', "fn", 1, -1, -1),
          [
            new Token(TokenType.IDENTIFIER, '"arg1"', "arg1", 1, -1, -1),
            new Token(TokenType.IDENTIFIER, '"arg2"', "arg2", 1, -1, -1),
          ],
          [
            new PrintStmt(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"arg2"', "arg2", 1, -1, -1)
              )
            ),
          ]
        ),
      ]);
    });

    it("fun sum (a, b) { return a + b; }", () => {
      expect(
        new Parser([
          new Token(TokenType.FUN, '"fun"', undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"sum"', "sum", 1, -1, -1),
          new Token(TokenType.LEFT_PAREN, "(", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1),
          new Token(TokenType.COMMA, ",", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1),
          new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
          new Token(TokenType.LEFT_BRACE, "{", undefined, 1, -1, -1),
          new Token(TokenType.RETURN, "return", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1),
          new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
          new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1),
          new Token(TokenType.SEMICOLON, ";", undefined, 1, -1, -1),
          new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
          new Token(TokenType.EOF, "", undefined, 2, -1, -1),
        ]).parse()
      ).toEqual([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"sum"', "sum", 1, -1, -1),
          [
            new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1),
            new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1),
          ],
          [
            new ReturnStmt(
              new Token(TokenType.RETURN, "return", undefined, 1, -1, -1),
              new BinaryExpr(
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1)
                ),
                new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1)
                )
              )
            ),
          ]
        ),
      ]);
    });
  });
});
