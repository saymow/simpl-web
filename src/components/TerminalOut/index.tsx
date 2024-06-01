import { TerminalOut } from "../../interfaces";

interface Props {
  instance: TerminalOut;
}

const TerminalOutComponent: React.FC<Props> = (props) => {
  return <p>{props.instance.message}</p>;
};

export default TerminalOutComponent;
