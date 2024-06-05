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
      {props.lines.length > 0 ? (
        props.lines.map((line, idx) =>
          line instanceof TerminalIn ? (
            <TerminalInComponent key={idx} instance={line} />
          ) : (
            <TerminalOutComponent key={idx} instance={line as TerminalOut} />
          )
        )
      ) : (
        <p>Results of your code will appear here when you <strong>Run</strong> the project.</p>
      )}
    </label>
  );
};

export default TerminalComponent;
