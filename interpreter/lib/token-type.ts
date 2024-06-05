enum TokenType {
  // Single-character tokens.
  COLON = "COLON",
  LEFT_BRACKET = "LEFT_BRACKET",
  RIGHT_BRACKET = "RIGHT_BRACKET",
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  SEMICOLON = "SEMICOLON",
  COMMA = "COMMA",
  DOT = "DOT",
  // One or two character tokens.
  MINUS = "MINUS",
  MINUS_MINUS = "MINUS_MINUS",
  MINUS_EQUAL = "MINUS_EQUAL",
  PLUS = "PLUS",
  PLUS_PLUS = "PLUS_PLUS",
  PLUS_EQUAL = "PLUS_EQUAL",
  SLASH = "SLASH",
  SLASH_EQUAL = "SLASH_EQUAL",
  STAR = "STAR",
  STAR_EQUAL = "STAR_EQUAL",
  BANG = "BANG",
  BANG_EQUAL = "BANG_EQUAL",
  EQUAL = "EQUAL",
  EQUAL_EQUAL = "EQUAL_EQUAL",
  GREATER = "GREATER",
  GREATER_EQUAL = "GREATER_EQUAL",
  LESS = "LESS",
  LESS_EQUAL = "LESS_EQUAL",
  // Literals.
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",
  // Keywords.
  AND = "AND",
  CLASS = "CLASS",
  ELSE = "ELSE",
  FALSE = "FALSE",
  FOR = "FOR",
  FUN = "FUN",
  IF = "IF",
  NIL = "NIL",
  OR = "OR",
  PRINT = "PRINT",
  RETURN = "RETURN",
  SUPER = "SUPER",
  THIS = "THIS",
  TRUE = "TRUE",
  VAR = "VAR",
  WHILE = "WHILE",
  ERROR = "ERROR",
  EOF = "EOF",
}

export default TokenType;
