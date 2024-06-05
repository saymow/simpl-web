import { useCallback, useEffect, useRef, useState } from "react";
import { TerminalIn } from "../../interfaces";
import "./styles.css";

interface Props {
  instance: TerminalIn;
}

const TerminalInComponent: React.FC<Props> = (props) => {
  const lineRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");
  const [isTriggered, setTriggered] = useState(false);

  const handleKeyDownEvent: React.KeyboardEventHandler<HTMLDivElement> = (
    e
  ) => {
    if (isTriggered) return;

    if (e.key === "Enter") {
      e.preventDefault();
      setTriggered(true);
      props.instance.handler(value);
    }
  };

  useEffect(() => {
    if (!isTriggered && lineRef.current) {
      lineRef.current.focus();
      lineRef.current.textContent = "";
    }
  }, [isTriggered]);

  return (
    <span className="terminal-out">
      <section>
        <span>$</span>
        <div
          ref={lineRef}
          id={isTriggered ? undefined : "input-line"}
          className="input-line"
          contentEditable={isTriggered ? false : "plaintext-only"}
          onKeyDown={handleKeyDownEvent}
          onInput={(e) => setValue(e.currentTarget.innerText)}
        ></div>
      </section>
    </span>
  );
};

export default TerminalInComponent;
