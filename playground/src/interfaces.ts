export class Terminal {}

export class TerminalOut extends Terminal {
  constructor(public readonly message: string) {
    super();
  }
}

export class TerminalIn extends Terminal {
  public active: boolean = true;
  public input: string = "";

  handle(input: string) {
    this.active = false;
    this.input = input;
    this.handler(input);
  }

  constructor(private readonly handler: (input: string) => void) {
    super();
  }
}
