import {
  ArrayExpr,
  GetExpr,
  SetExpr,
  AssignExpr,
  AssignOperatorExpr,
  BinaryExpr,
  CallExpr,
  GroupingExpr,
  LiteralExpr,
  StructExpr,
  UnaryOperatorExpr,
  UnaryOperatorType,
  VariableExpr,
} from "../lib/expr";
import Interpreter from "../lib/interpreter";
import Resolver from "../lib/resolver";
import {
  BlockStmt,
  BreakStmt,
  ExprStmt,
  FunctionStmt,
  IfStmt,
  PrintStmt,
  ReturnStmt,
  Stmt,
  VarStmt,
  WhileStmt,
} from "../lib/stmt";
import Token from "../lib/token";
import TokenType from "../lib/token-type";

const makeSut = async (ast: Stmt[]) => {
  const log = jest.fn((_: string) => {});
  const input = jest.fn(async () => "test");
  const clear = jest.fn(async () => {});
  const interpreter = new Interpreter(ast, {
    log,
    input,
    clear,
  });
  const resolver = new Resolver(interpreter);

  await resolver.resolve(ast);

  return { interpreter, log, input };
};

describe("Interpreter", () => {
  describe("Expressions", () => {
    it("print 5 + 11;", async () => {
      const { interpreter, log } = await makeSut([
        new PrintStmt(
          new BinaryExpr(
            new LiteralExpr(5),
            new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
            new LiteralExpr(11)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("16");
    });

    it('print "test" + "ab";', async () => {
      const { interpreter, log } = await makeSut([
        new PrintStmt(
          new BinaryExpr(
            new LiteralExpr("test"),
            new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
            new LiteralExpr("ab")
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("testab");
    });

    it("print 5 * (6 + 1) == 35;", async () => {
      const { interpreter, log } = await makeSut([
        new PrintStmt(
          new BinaryExpr(
            new BinaryExpr(
              new LiteralExpr(5),
              new Token(TokenType.STAR, "*", undefined, 1, -1, -1),
              new GroupingExpr(
                new BinaryExpr(
                  new LiteralExpr(6),
                  new Token(TokenType.PLUS, "+", undefined, 1, -1, -1),
                  new LiteralExpr(1)
                )
              )
            ),
            new Token(TokenType.EQUAL_EQUAL, "==", undefined, 1, -1, -1),
            new LiteralExpr(35)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("true");
    });
  });

  describe("Variables", () => {
    it("var myVar = 77; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(77)
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("77");
    });

    it("var myVar;", async () => {
      const { interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
        ),
      ]);

      expect(interpreter.interpret()).resolves.not.toThrow();
    });

    it("print myVar;", async () => {
      const { interpreter } = await makeSut([
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      expect(interpreter.interpret()).rejects.toThrow();
    });

    it("var myVar = 77; myVar = 5; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(77)
        ),
        new ExprStmt(
          new AssignExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("5");
    });

    it("var myVar = 10; myVar += 5; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(10)
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("15");
    });

    it("var myVar = [1, 1]; myVar[0] += 5; print myVar[0];", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new ArrayExpr(
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            [new LiteralExpr(1), new LiteralExpr(1)]
          )
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
              ),
              new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
              new LiteralExpr(0)
            ),
            new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(0)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("6");
    });

    it('var myVar = "na"; myVar += "me"; print myVar;', async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr("na")
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
            new LiteralExpr("me")
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("name");
    });

    it("var myVar = 10; myVar -= 5; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(10)
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.MINUS_EQUAL, "-", undefined, 1, -1, -1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("5");
    });

    it("var myVar = 10; myVar *= 5; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(10)
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.STAR_EQUAL, "*", undefined, 1, -1, -1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("50");
    });

    it("var myVar = [1, 1]; myVar[0] *= 5; print myVar[0];", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new ArrayExpr(
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            [new LiteralExpr(1), new LiteralExpr(1)]
          )
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
              ),
              new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
              new LiteralExpr(0)
            ),
            new Token(TokenType.STAR_EQUAL, "*=", undefined, 1, -1, -1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(0)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("5");
    });

    it("var myVar = 10; myVar /= 5; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(10)
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.SLASH_EQUAL, "/", undefined, 1, -1, -1),
            new LiteralExpr(5)
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("2");
    });

    it("var myVar = 1; print myVar++; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(1)
        ),
        new PrintStmt(
          new UnaryOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.PLUS_PLUS, "++", undefined, 1, -1, -1),
            UnaryOperatorType.SUFFIX
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("1");
      expect(log.mock.calls[1][0]).toBe("2");
    });

    it("var myVar = 1; print myVar--; print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(1)
        ),
        new PrintStmt(
          new UnaryOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
            UnaryOperatorType.SUFFIX
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("1");
      expect(log.mock.calls[1][0]).toBe("0");
    });

    it("var myVar = 1; print ++myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(1)
        ),
        new PrintStmt(
          new UnaryOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.PLUS_PLUS, "++", undefined, 1, -1, -1),
            UnaryOperatorType.PREFIX
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("2");
    });

    it("var myVar = 1; print --myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
          new LiteralExpr(1)
        ),
        new PrintStmt(
          new UnaryOperatorExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            ),
            new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
            UnaryOperatorType.PREFIX
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("0");
    });

    it("var arr = [1]; print --arr[0]; print arr[0];", async () => {
      const { interpreter, log } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "arr", undefined, 1, -1, -1),
          new ArrayExpr(
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            [new LiteralExpr(1)]
          )
        ),
        new PrintStmt(
          new UnaryOperatorExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "arr", undefined, 1, -1, -1)
              ),
              new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
              new LiteralExpr(0)
            ),
            new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
            UnaryOperatorType.PREFIX
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "arr", undefined, 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(0)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("0");
    });
  });

  describe("Blocks", () => {
    it("{var myVar = 5; print myVar;}", async () => {
      const { interpreter, log } = await makeSut([
        new BlockStmt([
          new VarStmt(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
            new LiteralExpr(5)
          ),
          new PrintStmt(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
            )
          ),
        ]),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("5");
    });

    it("{var myVar = 5;} print myVar;", async () => {
      const { interpreter, log } = await makeSut([
        new BlockStmt([
          new VarStmt(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1),
            new LiteralExpr(5)
          ),
        ]),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, "myVar", undefined, 1, -1, -1)
          )
        ),
      ]);

      expect(interpreter.interpret()).rejects.toThrow();

      expect(log).not.toHaveBeenCalled();
    });
  });

  describe("Conditionals", () => {
    it('if (2 > 1) print "maior";', async () => {
      const { interpreter, log } = await makeSut([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.GREATER, ">", undefined, 1, -1, -1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("maior"))
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("maior");
    });

    it('if (2 < 1) print "maior";', async () => {
      const { interpreter, log } = await makeSut([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("maior"))
        ),
      ]);

      await interpreter.interpret();

      expect(log).not.toHaveBeenCalled();
    });

    it('if (2 < 1) print "menor"; else print "maior";', async () => {
      const { interpreter, log } = await makeSut([
        new IfStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("menor")),
          new PrintStmt(new LiteralExpr("maior"))
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("maior");
    });
  });

  describe("Loops", () => {
    it('while (2 < 1) print "never";', async () => {
      const { interpreter, log } = await makeSut([
        new WhileStmt(
          new BinaryExpr(
            new LiteralExpr(2),
            new Token(TokenType.LESS, "<", undefined, 1, -1, -1),
            new LiteralExpr(1)
          ),
          new PrintStmt(new LiteralExpr("never"))
        ),
      ]);

      await interpreter.interpret();

      expect(log).not.toHaveBeenCalled();
    });

    it("var i = 0; while (i < 5) { print i; i = i + 1; }", async () => {
      const { interpreter, log } = await makeSut([
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

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("for (var i = 0; i < 5; i = i + 1) print i;", async () => {
      const { interpreter, log } = await makeSut([
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

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("var i = 0; for (; i < 5; i = i + 1) print i;", async () => {
      const { interpreter, log } = await makeSut([
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

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("var i = 0; for (;i < 5;) { print i; i = i + 1; }", async () => {
      const { interpreter, log } = await makeSut([
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

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("var i = 0; while (i < 5) { print i; break; }", async () => {
      const { interpreter, log } = await makeSut([
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
            new BreakStmt(
              new Token(TokenType.BREAK, "break", undefined, 1, -1, -1)
            ),
          ])
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("0");
    });

    it("for (var i = 0; i < 5; i = i + 1) {print i; break;}", async () => {
      const { interpreter, log } = await makeSut([
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
              new BlockStmt([
                new PrintStmt(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"i"', "i", 1, -1, -1)
                  )
                ),
                new BreakStmt(
                  new Token(TokenType.BREAK, "break", undefined, 1, -1, -1)
                ),
              ]),
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

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("0");
    });
  });

  describe("Functions", () => {
    it('fun fn (arg1, arg2) { print arg2; } fn("_", "test");', async () => {
      const { log, interpreter } = await makeSut([
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
        new ExprStmt(
          new CallExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, '"fn"', "fn", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
            [new LiteralExpr("_"), new LiteralExpr("test")]
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("test");
    });

    it("fun sum (a, b) { print a + b; } sum(3, 4);", async () => {
      const { log, interpreter } = await makeSut([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"sum"', "sum", 1, -1, -1),
          [
            new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1),
            new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1),
          ],
          [
            new PrintStmt(
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
        new ExprStmt(
          new CallExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, '"sum"', "sum", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
            [new LiteralExpr(3), new LiteralExpr(4)]
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("7");
    });

    it("fun multiply (a, b) { print a + b; } multiply(3, 4);", async () => {
      const { log, interpreter } = await makeSut([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"multiply"', "multiply", 1, -1, -1),
          [
            new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1),
            new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1),
          ],
          [
            new PrintStmt(
              new BinaryExpr(
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1)
                ),
                new Token(TokenType.STAR, "*", undefined, 1, -1, -1),
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1)
                )
              )
            ),
          ]
        ),
        new ExprStmt(
          new CallExpr(
            new VariableExpr(
              new Token(
                TokenType.IDENTIFIER,
                '"multiply"',
                "multiply",
                1,
                -1,
                -1
              )
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
            [new LiteralExpr(3), new LiteralExpr(4)]
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("12");
    });

    it("fun division (a, b) { return a + b; } print division(12, 4);", async () => {
      const { log, interpreter } = await makeSut([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"division"', "division", 1, -1, -1),
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
                new Token(TokenType.SLASH, "/", undefined, 1, -1, -1),
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1)
                )
              )
            ),
          ]
        ),
        new PrintStmt(
          new CallExpr(
            new VariableExpr(
              new Token(
                TokenType.IDENTIFIER,
                '"division"',
                "division",
                1,
                -1,
                -1
              )
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
            [new LiteralExpr(12), new LiteralExpr(4)]
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("3");
    });

    it("fun diff (a, b) { if (a > b) return a - b; else return b - a; } print diff(12, 4);", async () => {
      const { log, interpreter } = await makeSut([
        new FunctionStmt(
          new Token(TokenType.IDENTIFIER, '"diff"', "diff", 1, -1, -1),
          [
            new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1),
            new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1),
          ],
          [
            new IfStmt(
              new BinaryExpr(
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1)
                ),
                new Token(TokenType.GREATER, ">", undefined, 1, -1, -1),
                new VariableExpr(
                  new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1)
                )
              ),
              new ReturnStmt(
                new Token(TokenType.RETURN, "return", undefined, 1, -1, -1),
                new BinaryExpr(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1)
                  ),
                  new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1)
                  )
                )
              ),
              new ReturnStmt(
                new Token(TokenType.RETURN, "return", undefined, 1, -1, -1),
                new BinaryExpr(
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"b"', "b", 1, -1, -1)
                  ),
                  new Token(TokenType.MINUS, "-", undefined, 1, -1, -1),
                  new VariableExpr(
                    new Token(TokenType.IDENTIFIER, '"a"', "a", 1, -1, -1)
                  )
                )
              )
            ),
          ]
        ),
        new PrintStmt(
          new CallExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, '"diff"', "diff", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_PAREN, ")", undefined, 1, -1, -1),
            [new LiteralExpr(12), new LiteralExpr(4)]
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("8");
    });
  });

  describe("Arrays", () => {
    it('var arr = [1, "test"]; print arr[1];', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1),
          new ArrayExpr(
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            [new LiteralExpr(1), new LiteralExpr("test")]
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("test");
    });

    it("var identity = [[1, 0], [0, 1]]; print arr[0][0];", async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1),
          new ArrayExpr(
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            [
              new ArrayExpr(
                new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
                [new LiteralExpr(1), new LiteralExpr(0)]
              ),
              new ArrayExpr(
                new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
                [new LiteralExpr(0), new LiteralExpr(1)]
              ),
            ]
          )
        ),
        new PrintStmt(
          new GetExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1)
              ),
              new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
              new LiteralExpr(0)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(0)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("1");
    });

    it('var arr = [1, "test"]; arr[1] = "not-a-test"; print arr[1];', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1),
          new ArrayExpr(
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            [new LiteralExpr(1), new LiteralExpr("test")]
          )
        ),
        new ExprStmt(
          new SetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(1),
            new LiteralExpr("not-a-test")
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("not-a-test");
    });

    it('var identity = [[1, 0], [0, 1]]; arr[0][0] = "test"; print arr[0][0];', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1),
          new ArrayExpr(
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            [
              new ArrayExpr(
                new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
                [new LiteralExpr(1), new LiteralExpr(0)]
              ),
              new ArrayExpr(
                new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
                [new LiteralExpr(0), new LiteralExpr(1)]
              ),
            ]
          )
        ),
        new ExprStmt(
          new SetExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1)
              ),
              new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
              new LiteralExpr(0)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(0),
            new LiteralExpr("test")
          )
        ),
        new PrintStmt(
          new GetExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, '"arr"', "arr", 1, -1, -1)
              ),
              new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
              new LiteralExpr(0)
            ),
            new Token(TokenType.RIGHT_BRACKET, "]", undefined, 1, -1, -1),
            new LiteralExpr(0)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("test");
    });
  });

  describe("Structs", () => {
    it('var struct = { a: 5, b: "test" }; print struct;', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, '"struct"', "struct", 1, -1, -1),
          new StructExpr(
            new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
            [
              {
                key: new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
                value: new LiteralExpr(5),
              },
              {
                key: new Token(TokenType.IDENTIFIER, "b", undefined, 1, -1, -1),
                value: new LiteralExpr("test"),
              },
            ]
          )
        ),
        new PrintStmt(
          new VariableExpr(
            new Token(TokenType.IDENTIFIER, '"struct"', "struct", 1, -1, -1)
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe('{"a":5,"b":"test"}');
    });

    it('var struct = { a: 5, b: "test" }; print struct.a;', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1),
          new StructExpr(
            new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
            [
              {
                key: new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
                value: new LiteralExpr(5),
              },
              {
                key: new Token(TokenType.IDENTIFIER, "b", undefined, 1, -1, -1),
                value: new LiteralExpr("test"),
              },
            ]
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
            ),
            new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
            )
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("5");
    });

    it('var struct = { a: 5, b: "test" }; print --struct.a;', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1),
          new StructExpr(
            new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
            [
              {
                key: new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
                value: new LiteralExpr(5),
              },
              {
                key: new Token(TokenType.IDENTIFIER, "b", undefined, 1, -1, -1),
                value: new LiteralExpr("test"),
              },
            ]
          )
        ),
        new PrintStmt(
          new UnaryOperatorExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
              ),
              new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
              )
            ),
            new Token(TokenType.MINUS_MINUS, "--", undefined, 1, -1, -1),
            UnaryOperatorType.PREFIX
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("4");
    });

    it('var struct = { a: 5, b: "test" }; struct.a += 10; print struct.a;', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1),
          new StructExpr(
            new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
            [
              {
                key: new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
                value: new LiteralExpr(5),
              },
              {
                key: new Token(TokenType.IDENTIFIER, "b", undefined, 1, -1, -1),
                value: new LiteralExpr("test"),
              },
            ]
          )
        ),
        new ExprStmt(
          new AssignOperatorExpr(
            new GetExpr(
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
              ),
              new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
              new VariableExpr(
                new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
              )
            ),
            new Token(TokenType.PLUS_EQUAL, "+=", undefined, 1, -1, -1),
            new LiteralExpr(10)
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
            ),
            new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
            )
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("15");
    });

    it('var struct = { a: 5, b: "test" }; struct.a = []; print struct.a;', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1),
          new StructExpr(
            new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
            [
              {
                key: new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
                value: new LiteralExpr(5),
              },
              {
                key: new Token(TokenType.IDENTIFIER, "b", undefined, 1, -1, -1),
                value: new LiteralExpr("test"),
              },
            ]
          )
        ),
        new ExprStmt(
          new SetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
            ),
            new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
            ),
            new LiteralExpr([])
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
            ),
            new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
            )
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("[]");
    });

    it('var struct = { a: 5, b: "test" }; struct.c = "new"; print struct.c;', async () => {
      const { log, interpreter } = await makeSut([
        new VarStmt(
          new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1),
          new StructExpr(
            new Token(TokenType.RIGHT_BRACE, "}", undefined, 1, -1, -1),
            [
              {
                key: new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1),
                value: new LiteralExpr(5),
              },
              {
                key: new Token(TokenType.IDENTIFIER, "b", undefined, 1, -1, -1),
                value: new LiteralExpr("test"),
              },
            ]
          )
        ),
        new ExprStmt(
          new SetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
            ),
            new Token(TokenType.IDENTIFIER, "c", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "c", undefined, 1, -1, -1)
            ),
            new LiteralExpr("new")
          )
        ),
        new PrintStmt(
          new GetExpr(
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "struct", "struct", 1, -1, -1)
            ),
            new Token(TokenType.IDENTIFIER, "c", undefined, 1, -1, -1),
            new VariableExpr(
              new Token(TokenType.IDENTIFIER, "c", undefined, 1, -1, -1)
            )
          )
        ),
      ]);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("new");
    });
  });
});
