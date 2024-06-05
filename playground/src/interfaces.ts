export class Terminal {}

export class TerminalOut extends Terminal {
  constructor(public readonly message: string) {
    super();
  }
}

export class TerminalIn extends Terminal {
  constructor(public readonly handler: (input: string) => void) {
    super();
  }
}
