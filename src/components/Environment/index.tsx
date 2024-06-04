import { useEffect, useState } from "react";
import {
  Lexer,
  LexerError,
  Parser,
  ParserError,
  Stmt,
} from "../../../interpreter";
import { INITIAL_PROGRAM } from "../../data";
import { CustomParserError, TokenError } from "../../errors";
import { bindTokens } from "../../helpers";
import { Terminal } from "../../interfaces";
import Editor from "../Editor";
import TerminalComponent from "../Terminal";
import "./styles.css";

export type Program = Stmt[];

interface Props {
  program: Program | null;
  onProgramChange: (program: Program | null) => void;
  terminal: Terminal[];
}

const Environment: React.FC<Props> = (props) => {
  const { onProgramChange, terminal } = props;
  const [source, setSource] = useState(INITIAL_PROGRAM);
  const [syntaxHighlightedSource, setSyntaxHighlightedSource] =
    useState<string>();

  useEffect(() => {
    try {
      const tokens = new Lexer(source).scan();
      let syntaxTree;

      try {
        syntaxTree = new Parser(tokens).parse();
      } catch (err) {
        if (err instanceof ParserError) {
          throw new CustomParserError(
            tokens,
            err.token,
            err.message,
            err.stack
          );
        }

        throw Error("Unexpected error");
      }

      onProgramChange(syntaxTree);
      setSyntaxHighlightedSource(bindTokens(source, tokens));
    } catch (err) {
      onProgramChange(null);
      if (err instanceof LexerError) {
        setSyntaxHighlightedSource(bindTokens(source, err.tokens));
      } else if (err instanceof CustomParserError) {
        console.log(err);
        setSyntaxHighlightedSource(
          bindTokens(source, err.tokens, new TokenError(err.token, err.message))
        );
      } else {
        setSyntaxHighlightedSource(undefined);
        console.error("Unexpected error: ", err);
      }
    }
  }, [onProgramChange, source]);

  return (
    <article className="environment">
      <Editor
        source={source}
        formattedSource={syntaxHighlightedSource}
        setSource={setSource}
      />
      <TerminalComponent lines={terminal} />
    </article>
  );
};

export default Environment;
