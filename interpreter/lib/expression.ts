import Token from "./token";

type Value = any;

class Expr {}

class Literal extends Expr {
  constructor(public object: Value) {
    super();
  }
}

class Variable extends Expr {
  constructor(public name: Token) {
    super();
  }
}

class Unary extends Expr {
  constructor(public operator: Token, public right: Expr) {
    super();
  }
}

class Binary extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }
}

class Logical extends Expr {
  constructor(public left: Expr, public operator: Token, public right: Expr) {
    super();
  }
}

class Grouping extends Expr {
  constructor(public expr: Expr) {
    super();
  }
}

class This extends Expr {
  constructor(public token: Token) {
    super();
  }
}

class Super extends Expr {
  constructor(public token: Token, public method: Token) {
    super();
  }
}

class Get extends Expr {
  constructor(public expr: Expr, public token: Token) {
    super();
  }
}

class Call extends Expr {
  constructor(public callee: Expr, public paren: Token, public args: Expr[]) {
    super();
  }
}

export {
  Expr,
  Literal,
  Variable,
  Unary,
  Binary,
  Logical,
  Grouping,
  This,
  Super,
  Get,
  Call,
};
