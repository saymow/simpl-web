import { Value } from "../../expr";

export const isArray = (value: Value) => Array.isArray(value);

export const isNumber = (value: Value) => typeof value === "number";

export const isInteger = (value: Value) =>
  isNumber(value) && Number.isInteger(value);

export const isString = (value: Value) => typeof value === "string";

export const isNil = (value: Value) => value === undefined || value === null;

export const isObject = (value: Value) =>
  typeof value === "object" && !isArray(value) && value !== null;
