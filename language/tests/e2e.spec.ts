import { readSample } from "./fixtures";
import { Lexer, Parser, Interpreter, SysCall, System } from "../";
import * as lib from "../lib/core-lib";
import Resolver from "../lib/resolver";

const makeSystem = () => {
  const log = jest.fn((_: string) => {});
  const input = jest.fn(async () => "test");
  const clear = jest.fn(() => {});

  return { log, input, clear };
};

const makeSut = async (source: string) => {
  const tokens = new Lexer(source).scan();
  const ast = new Parser(tokens).parse();
  const system = makeSystem();
  const interpreter = new Interpreter(ast, system);
  const resolver = new Resolver(interpreter);

  await resolver.resolve(ast);

  return { interpreter, system };
};

const makeSutFileRead = async (filename: string) => {
  const source = await readSample(filename);
  return await makeSut(source);
};

const expectCoreLib =
  (handler: SysCall) =>
  async (...args: any[]) => {
    return expect(await handler.call(makeSystem(), args));
  };

const expectCoreLibException =
  (handler: SysCall) =>
  async (...args: any[]) => {
    return expect(handler.call(makeSystem(), args));
  };

describe("e2e", () => {
  describe("Snippets", () => {
    it("1", async () => {
      const { interpreter, system } = await makeSut(`
        var a = 5;
  
        if (a > 3) {
            print "maior";
        } else {
            print "menor";
        }
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(1);
      expect(system.log.mock.calls[0][0]).toBe("maior");
    });

    it("2", async () => {
      const { interpreter, system } = await makeSut(`
        var a = 5;
        var b = 1;
  
        print a + b;
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(1);
      expect(system.log.mock.calls[0][0]).toBe("6");
    });

    it("3", async () => {
      const { interpreter, system } = await makeSut(`
        while (2 < 1) print "never";
      `);

      await interpreter.interpret();

      expect(system.log).not.toHaveBeenCalled();
    });

    it("4", async () => {
      const { interpreter, system } = await makeSut(`
        var i = 0; 
  
        while (i < 5) { 
            print i; 
            i = i + 1;
        }
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(5);
      expect(system.log.mock.calls[0][0]).toBe("0");
      expect(system.log.mock.calls[1][0]).toBe("1");
      expect(system.log.mock.calls[2][0]).toBe("2");
      expect(system.log.mock.calls[3][0]).toBe("3");
      expect(system.log.mock.calls[4][0]).toBe("4");
    });

    it("5", async () => {
      const { interpreter, system } = await makeSut(`
        for (var i = 0; i < 5; i = i + 1) 
          print i;
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(5);
      expect(system.log.mock.calls[0][0]).toBe("0");
      expect(system.log.mock.calls[1][0]).toBe("1");
      expect(system.log.mock.calls[2][0]).toBe("2");
      expect(system.log.mock.calls[3][0]).toBe("3");
      expect(system.log.mock.calls[4][0]).toBe("4");
    });

    it("6", async () => {
      const { interpreter, system } = await makeSut(`
        var i = 0; 
  
        for (; i < 5; i = i + 1) 
            print i;
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(5);
      expect(system.log.mock.calls[0][0]).toBe("0");
      expect(system.log.mock.calls[1][0]).toBe("1");
      expect(system.log.mock.calls[2][0]).toBe("2");
      expect(system.log.mock.calls[3][0]).toBe("3");
      expect(system.log.mock.calls[4][0]).toBe("4");
    });

    it("7", async () => {
      const { interpreter, system } = await makeSut(`
        var i = 0; 
  
        for (;i < 5;) { 
            print i;
            i = i + 1;
        }
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(5);
      expect(system.log.mock.calls[0][0]).toBe("0");
      expect(system.log.mock.calls[1][0]).toBe("1");
      expect(system.log.mock.calls[2][0]).toBe("2");
      expect(system.log.mock.calls[3][0]).toBe("3");
      expect(system.log.mock.calls[4][0]).toBe("4");
    });

    it("8", async () => {
      const { interpreter, system } = await makeSut(`
        fun sum (a, b) { 
          print a + b;
        } 
    
        sum(3, 4);
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(1);
      expect(system.log.mock.calls[0][0]).toBe("7");
    });

    it("9", async () => {
      const { interpreter, system } = await makeSut(`
        fun multiply (a, b) { 
          print a * b;
        } 
    
        multiply(3, 4);
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(1);
      expect(system.log.mock.calls[0][0]).toBe("12");
    });

    it("choosen", async () => {
      const { interpreter, system } = await makeSut(`
        fun diff (a, b) { 
          if (a > b) 
            return a - b;
          else 
            return b - a;
        } 
    
        print diff(12, 4);
      `);

      await interpreter.interpret();

      expect(system.log).toHaveBeenCalledTimes(1);
      expect(system.log.mock.calls[0][0]).toBe("8");
    });

    it("11", async () => {
      const { interpreter, system } = await makeSut(`
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

      expect(system.log.mock.calls[0][0]).toBe("2");
      expect(system.log.mock.calls[1][0]).toBe("1");
      expect(system.log.mock.calls[2][0]).toBe("3");
      expect(system.log.mock.calls[3][0]).toBe("1");
      expect(system.log.mock.calls[4][0]).toBe("test");
    });

    it("12", async () => {
      const { interpreter, system } = await makeSut(`
        var num = 1;
        
        print num++;
        print num;
        print num--;
        print num;
        print ++num;
        print --num;
      `);

      await interpreter.interpret();

      expect(system.log.mock.calls[0][0]).toBe("1");
      expect(system.log.mock.calls[1][0]).toBe("2");
      expect(system.log.mock.calls[2][0]).toBe("2");
      expect(system.log.mock.calls[3][0]).toBe("1");
      expect(system.log.mock.calls[4][0]).toBe("2");
      expect(system.log.mock.calls[5][0]).toBe("1");
    });

    it("13", async () => {
      const { interpreter, system } = await makeSut(`
        var arr = [1, 2, 3, 4, 5];

        for (var i = 0; i < 5; i++) {
          print ++arr[i];
        }
        
        for (var i = 0; i < 5; i++) {
          print --arr[i];
        }
        
        for (var i = 0; i < 5; i++) {
          print arr[i] *= 5;
        }
        
        for (var i = 0; i < 5; i++) {
          print arr[i] /= 5;
        }
      `);

      await interpreter.interpret();

      [
        "2",
        "3",
        "4",
        "5",
        "6",
        "1",
        "2",
        "3",
        "4",
        "5",
        "5",
        "10",
        "15",
        "20",
        "25",
        "1",
        "2",
        "3",
        "4",
        "5",
      ].forEach((ans, idx) => {
        expect(system.log.mock.calls[idx][0]).toBe(ans);
      });
    });
  });

  describe("Core Lib", () => {
    // This allows for testing blocking IO;
    it("input()", async () => {
      const { interpreter, system } = await makeSut(`
        output("Digit your name: ");
        var name = input();
        output("Digit your surname: ");
        var surname = input();

        print "Hello " + name + " " + surname + "!" ; 
      `);

      system.input
        .mockImplementationOnce(async () => {
          return "John";
        })
        .mockImplementationOnce(async () => {
          return "Doe";
        });

      await interpreter.interpret();

      expect(system.input).toHaveBeenCalledTimes(2);
      expect(system.log).toHaveBeenCalledTimes(3);
      expect(system.log.mock.calls[0][0]).toBe("Digit your name: ");
      expect(system.log.mock.calls[1][0]).toBe("Digit your surname: ");
      expect(system.log.mock.calls[2][0]).toBe("Hello John Doe!");
    });

    it("clear()", async () => {
      const { interpreter, system } = await makeSut(`
        clear();
      `);

      await interpreter.interpret();

      expect(system.clear).toHaveBeenCalledTimes(1);
    });

    it("int()", async () => {
      (await expectCoreLib(new lib.Int())(5.5)).toBe(5);
      (await expectCoreLib(new lib.Int())("5.5")).toBe(5);
    });

    it("len(string|Value[])", async () => {
      (await expectCoreLib(new lib.Len())("str")).toBe(3);
      (await expectCoreLib(new lib.Len())([1, 2, 3, 4, 5])).toBe(5);
    });

    it("push(Value[], Value)", async () => {
      const arr = [1, 2, 3];

      (await expectCoreLib(new lib.Push())(arr, 4)).toBe(4);
      (await expectCoreLib(new lib.Push())(arr, "test")).toBe(5);

      expect(arr[3]).toBe(4);
      expect(arr[4]).toBe("test");
    });

    it("pop(Value[])", async () => {
      const arr = [3, 2, 1];

      (await expectCoreLib(new lib.Pop())(arr)).toBe(1);
      (await expectCoreLib(new lib.Pop())(arr)).toBe(2);

      expect(arr).toEqual([3]);
    });

    it("shift(Value[])", async () => {
      const arr = [3, 2, 1];

      (await expectCoreLib(new lib.Shift())(arr)).toBe(3);
      (await expectCoreLib(new lib.Shift())(arr)).toBe(2);

      expect(arr).toEqual([1]);
    });

    it("unshift(Value[], Value)", async () => {
      const arr = [1, 2, 3];

      (await expectCoreLib(new lib.Unshift())(arr, 4)).toBe(4);
      (await expectCoreLib(new lib.Unshift())(arr, "test")).toBe(5);

      expect(arr).toEqual(["test", 4, 1, 2, 3]);
    });

    it("copy(Value[])", async () => {
      const arr = [1, 2, 3];

      (await expectCoreLib(new lib.Copy())(arr)).not.toBe(arr);
    });

    describe("insert(Value[], number, Value)", () => {
      it("✔️", async () => {
        const arr = [1, 2, 3];

        await expectCoreLib(new lib.Insert())(arr, 0, -1);
        expect(arr).toEqual([-1, 1, 2, 3]);

        await expectCoreLib(new lib.Insert())(arr, 4, "test2");
        expect(arr).toEqual([-1, 1, 2, 3, "test2"]);

        await expectCoreLib(new lib.Insert())(arr, 2, "test3");
        expect(arr).toEqual([-1, 1, "test3", 2, 3, "test2"]);
      });

      it("❌: Expected array.", async () => {
        (
          await expectCoreLibException(new lib.Insert())("not-an-array", 0, -1)
        ).rejects.toThrow("Expected array.");
        (
          await expectCoreLibException(new lib.Insert())(null, 4, "test2")
        ).rejects.toThrow("Expected array.");
        (
          await expectCoreLibException(new lib.Insert())(undefined, 4, "test2")
        ).rejects.toThrow("Expected array.");
        (
          await expectCoreLibException(new lib.Insert())(5, 2, "test3")
        ).rejects.toThrow("Expected array.");
      });

      it("❌: Index must be an integer.", async () => {
        (
          await expectCoreLibException(new lib.Insert())(
            [1, 2, 3],
            1.5,
            "test3"
          )
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Insert())(
            [],
            "not-an-integer",
            -1
          )
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Insert())([], undefined, "test2")
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Insert())([], [], "test2")
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Insert())([], null, "test3")
        ).rejects.toThrow("Index must be an integer.");
      });

      it("❌: Index out of bounds.", async () => {
        (
          await expectCoreLibException(new lib.Insert())([], 1, -1)
        ).rejects.toThrow("Index out of bounds.");
        (
          await expectCoreLibException(new lib.Insert())([1, 2], 4, "test2")
        ).rejects.toThrow("Index out of bounds.");
        (
          await expectCoreLibException(new lib.Insert())([], -1, "test2")
        ).rejects.toThrow("Index out of bounds.");
        (
          await expectCoreLibException(new lib.Insert())(
            [1, 2, 3, 4],
            99,
            "test3"
          )
        ).rejects.toThrow("Index out of bounds.");
      });
    });

    describe("remove(Value[], number)", () => {
      it("✔️", async () => {
        const arr = [1, 2, 3];

        await expectCoreLib(new lib.Remove())(arr, 0);
        expect(arr).toEqual([2, 3]);

        await expectCoreLib(new lib.Remove())(arr, 1);
        expect(arr).toEqual([2]);

        await expectCoreLib(new lib.Remove())(arr, 0);
        expect(arr).toEqual([]);
      });

      it("❌: Expected array.", async () => {
        (
          await expectCoreLibException(new lib.Remove())("not-an-array", 0)
        ).rejects.toThrow("Expected array.");
        (
          await expectCoreLibException(new lib.Remove())(null, 4)
        ).rejects.toThrow("Expected array.");
        (
          await expectCoreLibException(new lib.Remove())(undefined, 4)
        ).rejects.toThrow("Expected array.");
        (await expectCoreLibException(new lib.Remove())(5, 2)).rejects.toThrow(
          "Expected array."
        );
      });

      it("❌: Index must be an integer.", async () => {
        (
          await expectCoreLibException(new lib.Remove())([1, 2, 3], 1.5)
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Remove())([], "not-an-integer")
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Remove())([], undefined)
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Remove())([], [])
        ).rejects.toThrow("Index must be an integer.");
        (
          await expectCoreLibException(new lib.Remove())([], null)
        ).rejects.toThrow("Index must be an integer.");
      });

      it("❌: Index out of bounds.", async () => {
        (await expectCoreLibException(new lib.Remove())([], 1)).rejects.toThrow(
          "Index out of bounds."
        );
        (
          await expectCoreLibException(new lib.Remove())([1, 2], 4)
        ).rejects.toThrow("Index out of bounds.");
        (
          await expectCoreLibException(new lib.Remove())([], -1)
        ).rejects.toThrow("Index out of bounds.");
        (
          await expectCoreLibException(new lib.Remove())([1, 2, 3, 4], 99)
        ).rejects.toThrow("Index out of bounds.");
      });
    });

    describe("indexOf(Value[], Value)", () => {
      it("✔️", async () => {
        (
          await expectCoreLib(new lib.IndexOf())([1, 2, 3, 2, "test", null], 2)
        ).toBe(1);
        (
          await expectCoreLib(new lib.IndexOf())(
            [1, 2, 3, 2, "test", null],
            "test"
          )
        ).toBe(4);
        (
          await expectCoreLib(new lib.IndexOf())(
            [1, 2, 3, 2, "test", null],
            null
          )
        ).toBe(5);
      });

      it("❌: Expected array.", async () => {
        (
          await expectCoreLibException(new lib.IndexOf())("not-an-array", 0)
        ).rejects.toThrow("Expected array.");
        (
          await expectCoreLibException(new lib.IndexOf())(null, 4)
        ).rejects.toThrow("Expected array.");
        (
          await expectCoreLibException(new lib.IndexOf())(undefined, 4)
        ).rejects.toThrow("Expected array.");
        (await expectCoreLibException(new lib.IndexOf())(5, 2)).rejects.toThrow(
          "Expected array."
        );
      });
    });

    it("boolean(Value)", async () => {
      (await expectCoreLib(new lib.Boolean())(false)).toBe(false);
      (await expectCoreLib(new lib.Boolean())(undefined)).toBe(false);
      (await expectCoreLib(new lib.Boolean())(null)).toBe(false);
      (await expectCoreLib(new lib.Boolean())([1, 2, 3])).toBe(true);
      (await expectCoreLib(new lib.Boolean())("")).toBe(true);
      (await expectCoreLib(new lib.Boolean())(0)).toBe(true);
      (await expectCoreLib(new lib.Boolean())({ test: "true" })).toBe(true);
    });
  });

  describe("Code files", () => {
    it("BMI Calculation", async () => {
      const { interpreter, system } = await makeSutFileRead("./bmi-calc.in");

      system.input
        .mockImplementationOnce(async () => "1.80")
        .mockImplementationOnce(async () => "80");

      await interpreter.interpret();

      expect(
        parseFloat(
          system.log.mock.calls[system.log.mock.calls.length - 1][0]
        ).toFixed(2)
      ).toBe("24.69");
    });

    it("Grades average", async () => {
      const { interpreter, system } = await makeSutFileRead("./avg.in");

      system.input
        .mockImplementationOnce(async () => "3")
        .mockImplementationOnce(async () => "6")
        .mockImplementationOnce(async () => "7")
        .mockImplementationOnce(async () => "10");

      await interpreter.interpret();

      expect(
        parseFloat(
          system.log.mock.calls[system.log.mock.calls.length - 1][0]
        ).toFixed(2)
      ).toBe(((6 + 7 + 10) / 3).toFixed(2));
    });

    describe("Linear function", () => {
      it("1", async () => {
        const { interpreter, system } = await makeSutFileRead(
          "./calc-linear-fn.in"
        );

        system.input
          .mockImplementationOnce(async () => "0")
          .mockImplementationOnce(async () => "5")
          .mockImplementationOnce(async () => "1")
          .mockImplementationOnce(async () => "3");

        await interpreter.interpret();

        expect(system.log.mock.calls[4][0]).toBe("y = -2x + 5");
      });

      it("2", async () => {
        const { interpreter, system } = await makeSutFileRead(
          "./calc-linear-fn.in"
        );

        system.input
          .mockImplementationOnce(async () => "0")
          .mockImplementationOnce(async () => "-5")
          .mockImplementationOnce(async () => "1")
          .mockImplementationOnce(async () => "1");

        await interpreter.interpret();

        expect(system.log.mock.calls[4][0]).toBe("y = 6x - 5");
      });

      it("3", async () => {
        const { interpreter, system } = await makeSutFileRead(
          "./calc-linear-fn.in"
        );

        system.input
          .mockImplementationOnce(async () => "0")
          .mockImplementationOnce(async () => "0")
          .mockImplementationOnce(async () => "1")
          .mockImplementationOnce(async () => "1");

        await interpreter.interpret();

        expect(system.log.mock.calls[4][0]).toBe("y = 1x");
      });
    });

    describe("Insertion sort", () => {
      it("1", async () => {
        const { interpreter, system } = await makeSutFileRead(
          "./insertion-sort.in"
        );
        const arr = [
          5, 6, 7, 18, 20, 22, 24, 25, 30, 32, 37, 54, 57, 62, 66, 67, 73, 91,
          92, 96,
        ];

        let builder = system.input.mockImplementationOnce(async () => {
          return Promise.resolve(arr.length.toString());
        });

        for (const num of arr) {
          builder = builder.mockImplementationOnce(async () => {
            return Promise.resolve(num.toString());
          });
        }

        await interpreter.interpret();

        expect(system.log.mock.calls[system.log.mock.calls.length - 1][0]).toBe(
          JSON.stringify(arr.sort((a, b) => a - b))
        );
      });

      it("2", async () => {
        const { interpreter, system } = await makeSutFileRead(
          "./insertion-sort.in"
        );
        const arr = [
          6, 14, 24, 28, 35, 43, 47, 50, 52, 58, 59, 65, 66, 67, 72, 76, 82, 87,
          92, 95,
        ];

        let builder = system.input.mockImplementationOnce(async () => {
          return Promise.resolve(arr.length.toString());
        });

        for (const num of arr) {
          builder = builder.mockImplementationOnce(async () => {
            return Promise.resolve(num.toString());
          });
        }

        await interpreter.interpret();

        expect(system.log.mock.calls[system.log.mock.calls.length - 1][0]).toBe(
          JSON.stringify(arr.sort((a, b) => a - b))
        );
      });
    });

    describe("Breadth First Search", () => {
      it("1", async () => {
        const { interpreter, system } = await makeSutFileRead(
          "./breadth-first-search.in"
        );

        system.input
          .mockImplementationOnce(async () => "A")
          .mockImplementationOnce(async () => "FINAL");

        await interpreter.interpret();

        expect(system.log.mock.calls[system.log.mock.calls.length - 1][0]).toBe(
          '["A","B","P","C","K","L","E","F","G","FINAL"]'
        );
      });

      it("2", async () => {
        const { interpreter, system } = await makeSutFileRead(
          "./breadth-first-search.in"
        );

        system.input
          .mockImplementationOnce(async () => "D")
          .mockImplementationOnce(async () => "FINAL");

        await interpreter.interpret();

        expect(system.log.mock.calls[system.log.mock.calls.length - 1][0]).toBe(
          '["D","N","F","G","FINAL"]'
        );
      });
    });

    describe("Dijkstra", () => {
      it("1", async () => {
        const { interpreter, system } = await makeSutFileRead("./dijkstra.in");

        system.input
          .mockImplementationOnce(async () => "F")
          .mockImplementationOnce(async () => "G");

        await interpreter.interpret();

        expect(system.log.mock.calls[system.log.mock.calls.length - 1][0]).toBe(
          '["F","G"]'
        );
      });

      it("2", async () => {
        const { interpreter, system } = await makeSutFileRead("./dijkstra.in");

        system.input
          .mockImplementationOnce(async () => "D")
          .mockImplementationOnce(async () => "FINAL");

        await interpreter.interpret();

        expect(system.log.mock.calls[system.log.mock.calls.length - 1][0]).toBe(
          '["D","E","G","FINAL"]'
        );
      });
    });
  });
});
