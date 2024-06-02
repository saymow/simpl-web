import { Terminal, TerminalIn, TerminalOut } from "../../interfaces";
import TerminalInComponent from "../TerminalIn";
import TerminalOutComponent from "../TerminalOut";
import "./styles.css";

interface Props {
  lines: Terminal[];
}

const TerminalComponent: React.FC<Props> = (props) => {
  return (
    <label htmlFor="input-line" className="terminal">
      {props.lines.map((line, idx) =>
        line instanceof TerminalIn ? (
          <TerminalInComponent key={idx} instance={line} />
        ) : (
          <TerminalOutComponent key={idx} instance={line as TerminalOut} />
        )
      )}
    </label>
  );
};

export default TerminalComponent;
