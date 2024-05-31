import {
  AssignExpr,
  BinaryExpr,
  CallExpr,
  GroupingExpr,
  LiteralExpr,
  VariableExpr,
} from "../lib/expr";
import Interpreter from "../lib/interpreter";
import {
  BlockStmt,
  ExprStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  Stmt,
  VarStmt,
  WhileStmt,
} from "../lib/stmt";
import Token from "../lib/token";
import TokenType from "../lib/token-type";

const makeSut = (ast: Stmt[]) => {
  const log = jest.fn((message: string) => {});
  const error = jest.fn((message: string) => {});
  const interpreter = new Interpreter(ast, {
    log,
    error,
  });

  return { interpreter, log, error };
};

describe("Interpreter", () => {
  describe("Expressions", () => {
    it("print 5 + 11;", () => {
      const { interpreter, log } = makeSut([
        new PrintStmt(
          new BinaryExpr(
            new LiteralExpr(5),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new LiteralExpr(11)
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("16");
    });

    it('print "test" + "ab";', () => {
      const { interpreter, log } = makeSut([
        new PrintStmt(
          new BinaryExpr(
            new LiteralExpr("test"),
            new Token(TokenType.PLUS, "+", undefined, 1),
            new LiteralExpr("ab")
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("testab");
    });

    it("print 5 * (6 + 1) == 35;", () => {
      const { interpreter, log } = makeSut([
        new PrintStmt(
          new BinaryExpr(
            new BinaryExpr(
              new LiteralExpr(5),
              new Token(TokenType.STAR, "*", undefined, 1),
              new GroupingExpr(
                new BinaryExpr(
                  new LiteralExpr(6),
                  new Token(TokenType.PLUS, "+", undefined, 1),
                  new LiteralExpr(1)
                )
              )
            ),
            new Token(TokenType.LESS, "<", undefined, 1),
            new LiteralExpr(29)
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("false");
    });
  });

  describe("Variables", () => {
    it("var myVar = 77; print myVar;", () => {
      const { interpreter, log } = makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1),
          new LiteralExpr(77)
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1)
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("77");
    });

    it("var myVar = 77; myVar = 5; print myVar;", () => {
      const { interpreter, log } = makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1),
          new LiteralExpr(77)
        ),
        new ExprStmt(
          new AssignExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1)
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("5");
    });

    it("var myVar;", () => {
      const { interpreter, error } = makeSut([
        new VarStmt(new Token(TokenType.IDENTIFIER, "myVar", undefined, 1)),
      ]);

      interpreter.interpret();

      expect(error).not.toHaveBeenCalled();
    });

    it("print myVar;", () => {
      const { interpreter, error } = makeSut([
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1)
          )
        ),
      ]);

      interpreter.interpret();

      expect(error).toHaveBeenCalledTimes(1);
    });
  });

  describe("Blocks", () => {
    it("{var myVar = 5; print myVar;}", () => {
      const { interpreter, log, error } = makeSut([
        new BlockStmt([
          new VarStmt(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1),
            new LiteralExpr(5)
          ),
          new PrintStmt(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1)
            )
          ),
        ]),
      ]);

      interpreter.interpret();

      expect(error).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("5");
    });

    it("{var myVar = 5;} print myVar;", () => {
      const { interpreter, log, error } = makeSut([
        new BlockStmt([
          new VarStmt(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1),
            new LiteralExpr(5)
          ),
        ]),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1)
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).not.toHaveBeenCalled();
      expect(error).toHaveBeenCalledTimes(1);
    });
  });

  describe("Conditionals", () => {
    it('if (2 > 1) print "maior";', () => {
      const { interpreter, log } = makeSut([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.GREATER, ">", undefined, 1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("maior"))
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("maior");
    });

    it('if (2 < 1) print "maior";', () => {
      const { interpreter, log } = makeSut([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.LESS, "<", undefined, 1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("maior"))
        ),
      ]);

      interpreter.interpret();

      expect(log).not.toHaveBeenCalled();
    });

    it('if (2 < 1) print "menor"; else print "maior";', () => {
      const { interpreter, log } = makeSut([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.LESS, "<", undefined, 1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("menor")),
          new PrintStmt(new LiteralExpr("maior"))
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("maior");
    });
  });

  describe("Loops", () => {
    it('while (2 < 1) print "never";', () => {
      const { interpreter, log, error } = makeSut([
        new WhileStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.LESS, "<", undefined, 1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("never"))
        ),
      ]);

      interpreter.interpret();

      expect(log).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });

    it("var i = 0; while (i < 5) { print i; i = i + 1; }", () => {
      const { interpreter, log, error } = makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
          new LiteralExpr(0)
        ),
        new WhileStmt(
          new BinaryExpr(
            new VariableExpr(new Token(TokenType.IDENTIFIER, '"i"', "i", 1)),
            new Token(TokenType.LESS, "<", undefined, 1),
            new LiteralExpr(5)
          ),
          new BlockStmt([
            new PrintStmt(
              new VariableExpr(new Token(TokenType.IDENTIFIER, '"i"', "i", 1))
            ),
            new ExprStmt(
              new AssignExpr(
                new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
                new BinaryExpr(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1)
                  ),
                  new Token(TokenType.PLUS, "+", undefined, 1),
                  new LiteralExpr(1)
                )
              )
            ),
          ])
        ),
      ]);

      interpreter.interpret();

      expect(error).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("for (var i = 0; i < 5; i = i + 1) print i;", () => {
      const { interpreter, log, error } = makeSut([
        new BlockStmt([
          new VarStmt(
            new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
            new LiteralExpr(0)
          ),
          new WhileStmt(
            new BinaryExpr(
              new VariableExpr(new Token(TokenType.IDENTIFIER, '"i"', "i", 1)),
              new Token(TokenType.LESS, "<", undefined, 1),
              new LiteralExpr(5)
            ),
            new BlockStmt([
              new PrintStmt(
                new VariableExpr(new Token(TokenType.IDENTIFIER, '"i"', "i", 1))
              ),
              new ExprStmt(
                new AssignExpr(
                  new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
                  new BinaryExpr(
                    new VariableExpr(
                      new Token(TokenType.IDENTIFIER, '"i"', "i", 1)
                    ),
                    new Token(TokenType.PLUS, "+", undefined, 1),
                    new LiteralExpr(1)
                  )
                )
              ),
            ])
          ),
        ]),
      ]);

      interpreter.interpret();

      expect(error).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("var i = 0; for (; i < 5; i = i + 1) print i;", () => {
      const { interpreter, log, error } = makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
          new LiteralExpr(0)
        ),
        new BlockStmt([
          new WhileStmt(
            new BinaryExpr(
              new VariableExpr(new Token(TokenType.IDENTIFIER, '"i"', "i", 1)),
              new Token(TokenType.LESS, "<", undefined, 1),
              new LiteralExpr(5)
            ),
            new BlockStmt([
              new PrintStmt(
                new VariableExpr(new Token(TokenType.IDENTIFIER, '"i"', "i", 1))
              ),
              new ExprStmt(
                new AssignExpr(
                  new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
                  new BinaryExpr(
                    new VariableExpr(
                      new Token(TokenType.IDENTIFIER, '"i"', "i", 1)
                    ),
                    new Token(TokenType.PLUS, "+", undefined, 1),
                    new LiteralExpr(1)
                  )
                )
              ),
            ])
          ),
        ]),
      ]);

      interpreter.interpret();

      expect(error).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("var i = 0; for (;i < 5;) { print i; i = i + 1; }", () => {
      const { interpreter, log, error } = makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
          new LiteralExpr(0)
        ),
        new BlockStmt([
          new WhileStmt(
            new BinaryExpr(
              new VariableExpr(new Token(TokenType.IDENTIFIER, '"i"', "i", 1)),
              new Token(TokenType.LESS, "<", undefined, 1),
              new LiteralExpr(5)
            ),
            new BlockStmt([
              new BlockStmt([
                new PrintStmt(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1)
                  )
                ),
                new ExprStmt(
                  new AssignExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1),
                    new BinaryExpr(
                      new VariableExpr(
                        new Token(TokenType.IDENTIFIER, '"i"', "i", 1)
                      ),
                      new Token(TokenType.PLUS, "+", undefined, 1),
                      new LiteralExpr(1)
                    )
                  )
                ),
              ]),
            ])
          ),
        ]),
      ]);

      interpreter.interpret();

      expect(error).not.toHaveBeenCalled();
      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });
  });

  describe("Functions", () => {
    it('fun fn (arg1, arg2) { print arg2; } fn("_", "test");', () => {
      const { log, interpreter } = makeSut([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"fn"', "fn", 1),
          [
            new Token(TokenType.IDENTIFIER, '"arg1"', "arg1", 1),
            new Token(TokenType.IDENTIFIER, '"arg2"', "arg2", 1),
          ],
          [
            new PrintStmt(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"arg2"', "arg2", 1)
              )
            ),
          ]
        ),
        new ExprStmt(
          new CallExpr(
            new VariableExpr(new Token(TokenType.IDENTIFIER, '"fn"', "fn", 1)),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
            [new LiteralExpr("_"), new LiteralExpr("test")]
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("test");
    });

    it("fun sum (a, b) { print a + b; } sum(3, 4);", () => {
      const { log, interpreter } = makeSut([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"sum"', "sum", 1),
          [
            new Token(TokenType.IDENTIFIER, '"a"', "a", 1),
            new Token(TokenType.IDENTIFIER, '"b"', "b", 1),
          ],
          [
            new PrintStmt(
              new BinaryExpr(
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"a"', "a", 1)
                ),
                new Token(TokenType.PLUS, "+", undefined, 1),
                new VariableExpr(new Token(TokenType.IDENTIFIER, '"b"', "b", 1))
              )
            ),
          ]
        ),
        new ExprStmt(
          new CallExpr(
            new VariableExpr(new Token(TokenType.IDENTIFIER, '"sum"', "sum", 1)),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
            [new LiteralExpr(3), new LiteralExpr(4)]
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("7");
    });

    it("fun multiply (a, b) { print a + b; } multiply(3, 4);", () => {
      const { log, interpreter } = makeSut([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"multiply"', "multiply", 1),
          [
            new Token(TokenType.IDENTIFIER, '"a"', "a", 1),
            new Token(TokenType.IDENTIFIER, '"b"', "b", 1),
          ],
          [
            new PrintStmt(
              new BinaryExpr(
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"a"', "a", 1)
                ),
                new Token(TokenType.STAR, "*", undefined, 1),
                new VariableExpr(new Token(TokenType.IDENTIFIER, '"b"', "b", 1))
              )
            ),
          ]
        ),
        new ExprStmt(
          new CallExpr(
            new VariableExpr(new Token(TokenType.IDENTIFIER, '"multiply"', "multiply", 1)),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1),
            [new LiteralExpr(3), new LiteralExpr(4)]
          )
        ),
      ]);

      interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("12");
    });
  });
});
