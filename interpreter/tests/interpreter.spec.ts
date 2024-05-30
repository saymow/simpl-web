import { BinaryExpr, GroupingExpr, LiteralExpr } from "../lib/expr";
import Interpreter from "../lib/interpreter";
import { PrintStmt, Stmt } from "../lib/stmt";
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
});
