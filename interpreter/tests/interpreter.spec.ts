import {
  BinaryExpr,
  GroupingExpr,
  LiteralExpr,
  VariableExpr,
} from "../lib/expr";
import Interpreter from "../lib/interpreter";
import { BlockStmt, PrintStmt, Stmt, VarStmt } from "../lib/stmt";
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
      expect(log.mock.calls[0][0]).toBe(16);
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
      expect(log.mock.calls[0][0]).toBeFalsy();
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
      expect(log.mock.calls[0][0]).toBe(77);
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
      expect(log.mock.calls[0][0]).toBe(5);
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
});
