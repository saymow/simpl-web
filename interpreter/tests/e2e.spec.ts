import { readSample } from "./fixtures";
import { Lexer, Parser, Interpreter } from "../";

const makeSut = async (source: string) => {
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

const makeSutFileRead = async (filename: string) => {
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
  describe("Snippets", () => {
    it("1", async () => {
      const { interpreter, log } = await makeSut(`
        var a = 5;
  
        if (a > 3) {
            print "maior";
        } else {
            print "menor";
        }
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("maior");
    });

    it("2", async () => {
      const { interpreter, log } = await makeSut(`
        var a = 5;
        var b = 1;
  
        print a + b;
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("6");
    });

    it("3", async () => {
      const { interpreter, log } = await makeSut(`
        while (2 < 1) print "never";
      `);

      await interpreter.interpret();

      expect(log).not.toHaveBeenCalled();
    });

    it("4", async () => {
      const { interpreter, log } = await makeSut(`
        var i = 0; 
  
        while (i < 5) { 
            print i; 
            i = i + 1;
        }
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("5", async () => {
      const { interpreter, log } = await makeSut(`
        for (var i = 0; i < 5; i = i + 1) 
          print i;
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("6", async () => {
      const { interpreter, log } = await makeSut(`
        var i = 0; 
  
        for (; i < 5; i = i + 1) 
            print i;
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("7", async () => {
      const { interpreter, log } = await makeSut(`
        var i = 0; 
  
        for (;i < 5;) { 
            print i;
            i = i + 1;
        }
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(5);
      expect(log.mock.calls[0][0]).toBe("0");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("2");
      expect(log.mock.calls[3][0]).toBe("3");
      expect(log.mock.calls[4][0]).toBe("4");
    });

    it("8", async () => {
      const { interpreter, log } = await makeSut(`
        fun sum (a, b) { 
          print a + b;
        } 
    
        sum(3, 4);
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("7");
    });

    it("9", async () => {
      const { interpreter, log } = await makeSut(`
        fun multiply (a, b) { 
          print a * b;
        } 
    
        multiply(3, 4);
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("12");
    });

    it("10", async () => {
      const { interpreter, log } = await makeSut(`
        fun diff (a, b) { 
          if (a > b) 
            return a - b;
          else 
            return b - a;
        } 
    
        print diff(12, 4);
      `);

      await interpreter.interpret();

      expect(log).toHaveBeenCalledTimes(1);
      expect(log.mock.calls[0][0]).toBe("8");
    });

    it("10", async () => {
      const { interpreter, log } = await makeSut(`
        var num = 1;
        var str = "";

        num += 1;
        print num;
        num -= 1;
        print num;
        num *= 3;
        print num;
        num /= 3;
        print num;

        str += "test";
        print str;
      `);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("2");
      expect(log.mock.calls[1][0]).toBe("1");
      expect(log.mock.calls[2][0]).toBe("3");
      expect(log.mock.calls[3][0]).toBe("1");
      expect(log.mock.calls[4][0]).toBe("test");
    });
  });

  describe("Core Lib", () => {
    it("input()", async () => {
      const { interpreter, log, input } = await makeSut(`
        var name = input("Digit your name: ");
        var surname = input("Digit your surname: ");
      
        print "Hello " + name + " " + surname + "!" ; 
      `);

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

    it("int()", async () => {
      const { interpreter, log } = await makeSut(`
        print int("2") + int("3"); 
      `);

      await interpreter.interpret();

      expect(log.mock.calls[0][0]).toBe("5");
    });
  });

  describe("Code files", () => {
    it("BMI Calculation", async () => {
      const { interpreter, log, input } = await makeSutFileRead(
        "./bmi-calc.in"
      );

      input
        .mockImplementationOnce(async (text) => {
          expect(text).toBe("Digit your height (m): ");
          return "1.80";
        })
        .mockImplementationOnce(async (text) => {
          expect(text).toBe("Digit your weight (kg): ");
          return "80";
        });

      await interpreter.interpret();

      expect(parseFloat(log.mock.calls[0][0]).toFixed(2)).toBe("24.69");
    });

    it("Grades average", async () => {
      const { interpreter, log, input } = await makeSutFileRead("./avg.in");

      input
        .mockImplementationOnce(async (text) => {
          expect(text).toBe("# of students: ");
          return "3";
        })
        .mockImplementationOnce(async (text) => {
          expect(text).toBe("1) student grade: ");
          return "6";
        })
        .mockImplementationOnce(async (text) => {
          expect(text).toBe("2) student grade: ");
          return "7";
        })
        .mockImplementationOnce(async (text) => {
          expect(text).toBe("3) student grade: ");
          return "10";
        });

      await interpreter.interpret();

      expect(parseFloat(log.mock.calls[0][0]).toFixed(2)).toBe(
        ((6 + 7 + 10) / 3).toFixed(2)
      );
    });

    describe("Linear function", () => {
      it("1", async () => {
        const { interpreter, log, input } = await makeSutFileRead(
          "./calc_linear_fn.in"
        );

        input
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point x: ");
            return "0";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point y: ");
            return "5";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point x: ");
            return "1";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point y: ");
            return "3";
          });

        await interpreter.interpret();

        expect(log.mock.calls[0][0]).toBe("y = -2x + 5");

        input
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point x: ");
            return "0";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point y: ");
            return "-5";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point x: ");
            return "1";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point y: ");
            return "1";
          });

        await interpreter.interpret();

        expect(log.mock.calls[1][0]).toBe("y = 6x - 5");

        input
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point x: ");
            return "0";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point y: ");
            return "0";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point x: ");
            return "1";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point y: ");
            return "1";
          });

        await interpreter.interpret();

        expect(log.mock.calls[2][0]).toBe("y = 1x");
      });

      it("1", async () => {
        const { interpreter, log, input } = await makeSutFileRead(
          "./calc_linear_fn.in"
        );

        input
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point x: ");
            return "0";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point y: ");
            return "-5";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point x: ");
            return "1";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point y: ");
            return "1";
          });

        await interpreter.interpret();

        expect(log.mock.calls[0][0]).toBe("y = 6x - 5");
      });

      it("1", async () => {
        const { interpreter, log, input } = await makeSutFileRead(
          "./calc_linear_fn.in"
        );

        input
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point x: ");
            return "0";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("1° point y: ");
            return "0";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point x: ");
            return "1";
          })
          .mockImplementationOnce(async (text) => {
            expect(text).toBe("2° point y: ");
            return "1";
          });

        await interpreter.interpret();

        expect(log.mock.calls[0][0]).toBe("y = 1x");
      });
    });
  });
});
