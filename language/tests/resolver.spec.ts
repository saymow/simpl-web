import { Expr, LiteralExpr, VariableExpr } from "../lib/expr";
import { WithVariableResolution } from "../lib/interfaces";
import Lexer from "../lib/lexer";
import Parser from "../lib/parser";
import Resolver from "../lib/resolver";
import {
  BlockStmt,
  ExprStmt,
  FunctionStmt,
  IfStmt,
  Stmt,
  VarStmt,
  WhileStmt,
} from "../lib/stmt";
import Token from "../lib/token";
import TokenType from "../lib/token-type";

const makeSut = async (source: string) => {
  const tokens = new Lexer(source).scan();
  const ast = new Parser(tokens).parse();
  const interpreter = { resolve: jest.fn((_: Expr, __: number) => {}) };
  const resolver = new Resolver(interpreter);

  return { resolve: () => resolver.resolve(ast) };
};

const makeSutFromAST = async (ast: Stmt[]) => {
  const interpreter = { resolve: jest.fn((_: Expr, __: number) => {}) };
  const resolver = new Resolver(interpreter);

  await resolver.resolve(ast);

  return interpreter;
};

describe("Resolver", () => {
  describe("✔️ Pass", () => {
    it("Should resolve variables", async () => {
      // while (true) {
      //     var a;

      //     fun test() {
      //         a;

      //         while (true) {
      //             a;
      //         }
      //     }

      //     if (true) {
      //         a;
      //         if (true) {
      //             a;
      //         }
      //     }

      //     a;
      // }

      const VARIABLE_EXPRS = [
        new VariableExpr(
          new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
        ),
        new VariableExpr(
          new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
        ),
        new VariableExpr(
          new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
        ),
        new VariableExpr(
          new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
        ),
        new VariableExpr(
          new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
        ),
      ];

      const { resolve } = await makeSutFromAST([
        new WhileStmt(
          new LiteralExpr(true),
          new BlockStmt([
            new VarStmt(
              new Token(TokenType.IDENTIFIER, "a", undefined, 1, -1, -1)
            ),
            new FunctionStmt(
              new Token(TokenType.IDENTIFIER, "test", undefined, 1, -1, -1),
              [],
              [
                new ExprStmt(VARIABLE_EXPRS[0]),
                new WhileStmt(
                  new LiteralExpr(true),
                  new BlockStmt([new ExprStmt(VARIABLE_EXPRS[1])])
                ),
              ]
            ),
            new IfStmt(
              new LiteralExpr(true),
              new BlockStmt([
                new ExprStmt(VARIABLE_EXPRS[2]),
                new IfStmt(
                  new LiteralExpr(true),
                  new BlockStmt([new ExprStmt(VARIABLE_EXPRS[3])])
                ),
              ])
            ),
            new ExprStmt(VARIABLE_EXPRS[4]),
          ])
        ),
      ]);

      expect(resolve).toHaveBeenCalledTimes(5);

      expect(resolve.mock.calls[0][0]).toStrictEqual(VARIABLE_EXPRS[0]);
      expect(resolve.mock.calls[0][1]).toBe(1);

      expect(resolve.mock.calls[1][0]).toStrictEqual(VARIABLE_EXPRS[1]);
      expect(resolve.mock.calls[1][1]).toBe(2);

      expect(resolve.mock.calls[2][0]).toStrictEqual(VARIABLE_EXPRS[2]);
      expect(resolve.mock.calls[2][1]).toBe(1);

      expect(resolve.mock.calls[3][0]).toStrictEqual(VARIABLE_EXPRS[3]);
      expect(resolve.mock.calls[3][1]).toBe(2);

      expect(resolve.mock.calls[4][0]).toStrictEqual(VARIABLE_EXPRS[4]);
      expect(resolve.mock.calls[4][1]).toBe(0);
    });
  });

  it("❌ Can't read local variable in its own initiliazer", async () => {
    const { resolve } = await makeSut(`
      if (true) {
        var a = a + 1;
      }    
    `);

    expect(resolve).rejects.toThrow(
      "Can't read local variable in its own initiliazer"
    );
  });

  it("❌ Can't redeclare local variable", async () => {
    const { resolve } = await makeSut(`
      if (true) {
        var a = 1;
        var a = 2;
      }    
    `);

    expect(resolve).rejects.toThrow("Can't redeclare local variable");
  });

  it("❌ Can't return outside function.", async () => {
    const { resolve } = await makeSut(`
      return;
    `);

    expect(resolve).rejects.toThrow("Can't return outside function.");
  });
});
