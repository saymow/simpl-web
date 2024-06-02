import { readSample } from "./fixtures";
import { Lexer, Parser, Interpreter } from "../";

const makeSut = async (filename: string) => {
  const source = await readSample(filename);
  const tokens = new Lexer(source).scan();
  const ast = new Parser(tokens).parse();
  const log = jest.fn((_: string) => {});
  const input = jest.fn(async (_: string) => "test");
  const interpreter = new Interpreter(ast, {
    log,
    input,
  });

  return { interpreter, log, input };
};

describe("e2e", () => {
  it("1.in", async () => {
    const { interpreter, log } = await makeSut("1.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("maior");
  });

  it("2.in", async () => {
    const { interpreter, log } = await makeSut("2.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("6");
  });

  it("3.in", async () => {
    const { interpreter, log } = await makeSut("3.in");

    await interpreter.interpret();

    expect(log).not.toHaveBeenCalled();
  });

  it("4.in", async () => {
    const { interpreter, log } = await makeSut("4.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("5.in", async () => {
    const { interpreter, log } = await makeSut("5.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("6.in", async () => {
    const { interpreter, log } = await makeSut("6.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("7.in", async () => {
    const { interpreter, log } = await makeSut("7.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(5);
    expect(log.mock.calls[0][0]).toBe("0");
    expect(log.mock.calls[1][0]).toBe("1");
    expect(log.mock.calls[2][0]).toBe("2");
    expect(log.mock.calls[3][0]).toBe("3");
    expect(log.mock.calls[4][0]).toBe("4");
  });

  it("8.in", async () => {
    const { interpreter, log } = await makeSut("8.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("7");
  });

  it("9.in", async () => {
    const { interpreter, log } = await makeSut("9.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("12");
  });

  it("10.in", async () => {
    const { interpreter, log } = await makeSut("10.in");

    await interpreter.interpret();

    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("8");
  });

  it("11.in", async () => {
    const { interpreter, log, input } = await makeSut("11.in");

    input
      .mockImplementationOnce(async (text) => {
        expect(text).toBe("Digit your name: ");
        return "John";
      })
      .mockImplementationOnce(async (text) => {
        expect(text).toBe("Digit your surname: ");
        return "Doe";
      });

    await interpreter.interpret();

    expect(input).toHaveBeenCalledTimes(2);
    expect(log).toHaveBeenCalledTimes(1);
    expect(log.mock.calls[0][0]).toBe("Hello John Doe!");
  });
});
