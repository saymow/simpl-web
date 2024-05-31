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

describe("e2e", () => {
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

  it("3.in", async () => {
    const { log, error } = await makeSut("3.in");

    expect(log).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it("4.in", async () => {
    const { log, error } = await makeSut("4.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("5.in", async () => {
    const { log, error } = await makeSut("5.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("6.in", async () => {
    const { log, error } = await makeSut("6.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("7.in", async () => {
    const { log, error } = await makeSut("7.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("8.in", async () => {
    const { log, error } = await makeSut("8.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("7");
  });

  it("9.in", async () => {
    const { log, error } = await makeSut("9.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("12");
  });

  it("10.in", async () => {
    const { log, error } = await makeSut("10.in");

    expect(error).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("8");
  });
});
