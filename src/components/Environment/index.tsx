import { useCallback, useEffect, useRef, useState } from "react";
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
import { Terminal, TerminalIn } from "../../interfaces";
import Editor from "../Editor";
import TerminalComponent from "../Terminal";
import "./styles.css";

const HORIZONTAL_ORIENTATION_THRESHOLD = 640;
const TERMINAL_MIN_WIDTH = 160;
const TERMINAL_MIN_HEIGHT = 80;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

enum Orientation {
  Horizontal,
  Vertical,
}

const computeOrientation = (client: HTMLElement): Orientation => {
  const clientWidth = client.getBoundingClientRect().width;

  if (clientWidth < HORIZONTAL_ORIENTATION_THRESHOLD) {
    return Orientation.Vertical;
  } else {
    return Orientation.Horizontal;
  }
};

const computeOrientationClassName = (orientation: Orientation): string => {
  if (orientation === Orientation.Vertical) {
    return "verticaly";
  } else {
    return "horizontaly";
  }
};

const resizeHorizontaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement,
  absoluteX: number
) => {
  document.querySelector("body")?.style.setProperty("cursor", "ew-resize");

  const envLeft = environment.getBoundingClientRect().left;
  const envWidth = environment.getBoundingClientRect().width;
  const relativeX = absoluteX - envLeft;

  let editorRatio = clamp(relativeX / envWidth, 0.2, 1);
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedWidth = terminalRatio * envWidth;

  if (terminalEstimatedWidth < TERMINAL_MIN_WIDTH) {
    editorRatio = 1;
  }

  editor.style.setProperty("width", `${editorRatio * 100}%`);
  if (editorRatio === 1) terminal.style.setProperty("width", "0%");
  else terminal.style.setProperty("width", "auto");
};

const resizeVerticaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement,
  absoluteY: number
) => {
  document.querySelector("body")?.style.setProperty("cursor", "ew-resize");

  const envTop = environment.getBoundingClientRect().top;
  const envHeight = environment.getBoundingClientRect().height;
  const relativeY = absoluteY - envTop;

  let editorRatio = clamp(relativeY / envHeight, 0.2, 1);
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedHeight = terminalRatio * envHeight;

  if (terminalEstimatedHeight < TERMINAL_MIN_HEIGHT) {
    editorRatio = 1;
  }

  editor.style.setProperty("height", `${editorRatio * 100}%`);
  terminal.style.setProperty("height", `${terminalRatio * 100}%`);
};

const setResizeHorizontaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement
) => {
  document.querySelector("body")?.style.removeProperty("cursor");

  const envWidth = environment.getBoundingClientRect().width;
  const editorWidthProp = editor.style.getPropertyValue("width");
  const editorRatio = parseInt(editorWidthProp.replace("%", "")) / 100;
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedWidth = terminalRatio * envWidth;

  if (terminalEstimatedWidth < TERMINAL_MIN_WIDTH) {
    editor.style.setProperty("width", "100%");
    terminal.style.setProperty("width", "0");
  } else {
    terminal.style.setProperty("width", "auto");
  }
};

const setResizeVerticaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement
) => {
  document.querySelector("body")?.style.removeProperty("cursor");

  const envHeight = environment.getBoundingClientRect().height;
  const editorHeightProp = editor.style.getPropertyValue("height");
  const editorRatio = parseInt(editorHeightProp.replace("%", "")) / 100;
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedHeight = terminalRatio * envHeight;

  if (terminalEstimatedHeight < TERMINAL_MIN_HEIGHT) {
    editor.style.setProperty("height", "100%");
    terminal.style.setProperty("height", "0");
  } else {
    terminal.style.setProperty("height", `${terminalRatio * 100}%`);
  }
};

export type Program = Stmt[];

interface Props {
  program: Program | null;
  onProgramChange: (program: Program | null) => void;
  terminal: Terminal[];
}

const Environment: React.FC<Props> = (props) => {
  const { onProgramChange, terminal } = props;
  const environmentRef = useRef<HTMLDivElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const terminalWrapperRef = useRef<HTMLDivElement>(null);
  const [orientation, setOrientation] = useState(Orientation.Horizontal);
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

  const refreshOrientation = useCallback(() => {
    if (!environmentRef.current) return;

    setOrientation(computeOrientation(environmentRef.current));
  }, []);

  const onOrientationUpdate = useCallback(() => {
    if (!(editorWrapperRef.current && terminalWrapperRef.current)) return;

    if (orientation === Orientation.Vertical) {
      editorWrapperRef.current.style.setProperty("height", "60%");
      editorWrapperRef.current.style.setProperty("width", "100%");
      terminalWrapperRef.current.style.setProperty("height", "40%");
      terminalWrapperRef.current.style.setProperty("width", "100%");
    } else {
      editorWrapperRef.current.style.setProperty("width", "70%");
      editorWrapperRef.current.style.setProperty("height", "100%");
      terminalWrapperRef.current.style.setProperty("width", "30%");
      terminalWrapperRef.current.style.setProperty("height", "100%");
    }
  }, [orientation]);

  const onTerminalPrompt = useCallback(() => {
    if (!(editorWrapperRef.current && terminalWrapperRef.current)) return;

    if (orientation === Orientation.Vertical) {
      if (
        terminalWrapperRef.current.style.getPropertyValue("height") === "0px"
      ) {
        editorWrapperRef.current.style.setProperty("height", "70%");
        terminalWrapperRef.current.style.setProperty("height", "30%");
      }
    } else {
      if (
        terminalWrapperRef.current.style.getPropertyValue("width") === "0px"
      ) {
        editorWrapperRef.current.style.setProperty("width", "70%");
        terminalWrapperRef.current.style.setProperty("width", "30%");
      }
    }
  }, [orientation]);

  useEffect(() => {
    refreshOrientation();
    window.addEventListener("resize", refreshOrientation);
    return () => {
      window.removeEventListener("resize", refreshOrientation);
    };
  }, [refreshOrientation]);

  useEffect(() => {
    onOrientationUpdate();
  }, [onOrientationUpdate]);

  useEffect(() => {
    if (terminal.length > 0) {
      onTerminalPrompt();
    }
  }, [onTerminalPrompt, terminal]);

  const handleHandleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (
        !(
          editorWrapperRef.current &&
          environmentRef.current &&
          terminalWrapperRef.current
        )
      )
        return;

      if (orientation === Orientation.Horizontal) {
        resizeHorizontaly(
          environmentRef.current,
          editorWrapperRef.current,
          terminalWrapperRef.current,
          e.clientX
        );
      } else {
        resizeVerticaly(
          environmentRef.current,
          editorWrapperRef.current,
          terminalWrapperRef.current,
          e.clientY
        );
      }
    },
    [orientation]
  );

  const handleHandleMouseMoveEnd = useCallback(() => {
    if (
      !(
        editorWrapperRef.current &&
        terminalWrapperRef.current &&
        environmentRef.current
      )
    )
      return;

    if (orientation === Orientation.Horizontal) {
      setResizeHorizontaly(
        environmentRef.current,
        editorWrapperRef.current,
        terminalWrapperRef.current
      );
    } else {
      setResizeVerticaly(
        environmentRef.current,
        editorWrapperRef.current,
        terminalWrapperRef.current
      );
    }

    window.removeEventListener("mousemove", handleHandleMouseMove);
    window.removeEventListener("mouseup", handleHandleMouseMoveEnd);
  }, [handleHandleMouseMove, orientation]);

  const handleHandleClick = () => {
    window.addEventListener("mousemove", handleHandleMouseMove);
    window.addEventListener("mouseup", handleHandleMouseMoveEnd);
  };

  return (
    <article
      ref={environmentRef}
      className={`environment ${computeOrientationClassName(orientation)}`}
    >
      <div ref={editorWrapperRef} className="editor-wrapper">
        <Editor
          source={source}
          formattedSource={syntaxHighlightedSource}
          setSource={setSource}
        />
        <span
          onMouseDown={handleHandleClick}
          className={`handle ${computeOrientationClassName(orientation)}`}
        ></span>
      </div>
      <div ref={terminalWrapperRef} className="terminal-wrapper">
        <TerminalComponent lines={terminal} />
      </div>
    </article>
  );
};

export default Environment;
