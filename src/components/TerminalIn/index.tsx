import { useCallback, useEffect, useState } from "react";
import { TerminalIn } from "../../interfaces";
import "./styles.css";

interface Props {
  instance: TerminalIn;
}

const TerminalInComponent: React.FC<Props> = (props) => {
  const [value, setValue] = useState("");
  const [isTriggered, setTriggered] = useState(false);

  const handleKeyUpEvent = useCallback(
    (e: KeyboardEvent) => {
      if (isTriggered) return;

      if (e.key === "Enter") {
        setTriggered(true);
        props.instance.handler(value);
      }
    },
    [props.instance, isTriggered, value]
  );

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUpEvent);
    return () => {
      window.removeEventListener("keyup", handleKeyUpEvent);
    };
  }, [handleKeyUpEvent]);

  return (
    <span className="terminal-out">
      <p>{props.instance.text}</p>
      <section>
        {"$ "}
        <input
          autoFocus
          readOnly={isTriggered}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </section>
    </span>
  );
};

export default TerminalInComponent;
