import { Value } from "../../expr";

export const isArray = (value: Value) => Array.isArray(value);

export const isNumber = (value: Value) => typeof value === "number";

export const isString = (value: Value) => typeof value === "string";

export const isNil = (value: Value) => value === undefined || value === null;
