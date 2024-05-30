import { readSample } from "./fixtures";
import { Lexer, Parser, Interpreter } from "../";

const makeSut = async (filename: string) => {
  const source = await readSample(filename);
  const tokens = new Lexer(source).scan();
  const ast = new Parser(tokens).parse();
  const log = jest.fn((_: string) => {});
  const error = jest.fn((_: string) => {});

  new Interpreter(ast, { log, error }).interpret();

  return { log, error };
};

describe("E2e", () => {
  it("1.in", async () => {
    const { log, error } = await makeSut("1.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("maior");
  });

  it("2.in", async () => {
    const { log, error } = await makeSut("2.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("6");
  });
});
