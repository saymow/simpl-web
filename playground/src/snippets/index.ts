import { AVG_SNIPPET } from "./avg";
import { BMI_CALC_SNIPPET } from "./bmi-calc";
import { BREADTH_FIRST_SEARCH_SNIPPET } from "./bredth-first-search";
import { INSERTION_SORT_SNIPPET } from "./insertion-sort";
import { LEXER } from "./lexer";
import { LINEAR_FUNCTION_SNIPPET } from "./linear-function";
import { TODO_LIST_SNIPPET } from "./todo-list";

const SNIPPET_SLUG_MAP = {
  avg: AVG_SNIPPET,
  bmi: BMI_CALC_SNIPPET,
  breadth_first_search: BREADTH_FIRST_SEARCH_SNIPPET,
  insertion_sort: INSERTION_SORT_SNIPPET,
  linear_function: LINEAR_FUNCTION_SNIPPET,
  todo_list: TODO_LIST_SNIPPET,
  lexer: LEXER
} as const;

export const makeSnippet = (slug: string) => {
  if (!(slug in SNIPPET_SLUG_MAP)) {
    return "";
  }

  return SNIPPET_SLUG_MAP[slug as keyof typeof SNIPPET_SLUG_MAP];
};
