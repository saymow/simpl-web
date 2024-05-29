import Token from "./token.mjs";

class Expr {}

/**
 * @typedef {any} Value
 */

class Literal extends Expr {
  /** @type {Value} */
  #object;

  /**
   * @param {Value} object
   */
  constructor(object) {
    super();
    this.#object = object;
  }
}

class Variable extends Expr {
  /** @type {Token} */
  #name;

  /**
   * @param {Token} name
   */
  constructor(name) {
    super();
    this.#name = name;
  }
}

class Unary extends Expr {
  /** @type {Token} */
  #operator;
  /** @type {Expr} */
  #right;

  /**
   * @param {Token} operator
   * @param {Expr} right
   */
  constructor(operator, right) {
    super();
    this.#operator = operator;
    this.#right = right;
  }
}

class Binary extends Expr {
  /** @type {Expr} */
  #left;
  /** @type {Token} */
  #operator;
  /** @type {Expr} */
  #right;

  /**
   * @param {Expr} left
   * @param {Token} operator
   * @param {Expr} right
   */
  constructor(left, operator, right) {
    super();
    this.#left = left;
    this.#operator = operator;
    this.#right = right;
  }
}

export default {
  Base: Expr,
  Literal,
  Variable,
  Unary,
  Binary,
};
