import "./styles.css";

interface Props {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: VoidFunction;
}

const Button: React.FC<Props> = (props) => {
  return (
    <button disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  );
};

export default Button;
