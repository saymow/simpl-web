import { useCallback, useEffect, useRef, useState } from "react";
import { Terminal } from "../../interfaces";
import Editor from "../Editor";
import TerminalComponent from "../Terminal";
import {
  Orientation,
  computeOrientation,
  computeOrientationClassName,
  resizeHorizontaly,
  resizeVerticaly,
  setResizeHorizontaly,
  setResizeVerticaly,
} from "./helper";
import "./styles.css";

interface Props {
  terminal: Terminal[];
  source: string;
  onSourceChange: (source: string) => void;
  syntaxHighlightedSource?: string;
  isLoading: boolean;
}

const Environment: React.FC<Props> = (props) => {
  const {
    source,
    onSourceChange,
    syntaxHighlightedSource,
    terminal,
    isLoading,
  } = props;
  const environmentRef = useRef<HTMLDivElement>(null);
  const editorWrapperRef = useRef<HTMLDivElement>(null);
  const terminalWrapperRef = useRef<HTMLDivElement>(null);
  const [orientation, setOrientation] = useState(Orientation.Horizontal);

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

  const handleMoveHandle = useCallback(
    (x: number, y: number) => {
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
          x
        );
      } else {
        resizeVerticaly(
          environmentRef.current,
          editorWrapperRef.current,
          terminalWrapperRef.current,
          y
        );
      }
    },
    [orientation]
  );

  const handleHandleMouseMove = useCallback(
    (e: MouseEvent) => {
      handleMoveHandle(e.clientX, e.clientY);
    },
    [handleMoveHandle]
  );

  const handleHandleTouchMove = useCallback(
    (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      handleMoveHandle(x, y);
    },
    [handleMoveHandle]
  );

  const handleHandleMoveEnd = useCallback(() => {
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
    window.removeEventListener("touchmove", handleHandleTouchMove);
    window.removeEventListener("mouseup", handleHandleMoveEnd);
    window.removeEventListener("touchend", handleHandleMoveEnd);
  }, [handleHandleMouseMove, handleHandleTouchMove, orientation]);

  const handleHandleMoveStart = () => {
    window.addEventListener("mousemove", handleHandleMouseMove);
    window.addEventListener("touchmove", handleHandleTouchMove);
    window.addEventListener("mouseup", handleHandleMoveEnd);
    window.addEventListener("touchend", handleHandleMoveEnd);
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
          setSource={onSourceChange}
        />
        <span
          onMouseDown={handleHandleMoveStart}
          onTouchStart={handleHandleMoveStart}
          className={`handle ${computeOrientationClassName(orientation)}`}
        ></span>
      </div>
      <div ref={terminalWrapperRef} className="terminal-wrapper">
        <TerminalComponent isLoading={isLoading} lines={terminal} />
      </div>
    </article>
  );
};

export default Environment;
