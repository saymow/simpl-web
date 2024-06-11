import { useEffect, useRef, useState } from "react";
import { TerminalIn } from "../../interfaces";
import "./styles.css";

interface Props {
  instance: TerminalIn;
}

const TerminalInComponent: React.FC<Props> = (props) => {
  const lineRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState("");

  const handleKeyDownEvent: React.KeyboardEventHandler<HTMLDivElement> = (
    e
  ) => {
    if (!props.instance.active) return;

    if (e.key === "Enter") {
      e.preventDefault();
      props.instance.handle(value);
    }
  };

  useEffect(() => {
    if (props.instance.active && lineRef.current) {
      lineRef.current.focus();
      lineRef.current.textContent = "";
    }
  }, [props.instance.active]);

  return (
    <span className="terminal-out">
      <section>
        <span>$</span>
        {props.instance.active ? (
          <div
            ref={lineRef}
            id="input-line"
            className="input-line"
            contentEditable="plaintext-only"
            onKeyDown={handleKeyDownEvent}
            onInput={(e) => setValue(e.currentTarget.innerText)}
          ></div>
        ) : (
          <div className="input-line">{props.instance.input}</div>
        )}
      </section>
    </span>
  );
};

export default TerminalInComponent;
