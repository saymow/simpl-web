import "./styles.css";

interface Props {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: VoidFunction;
  isLoading?: boolean;
}

const Button: React.FC<Props> = (props) => {
  return (
    <button
      disabled={props.disabled}
      data-loading={props.isLoading ? "loading" : undefined}
      onClick={props.onClick}
    >
      {props.children}
    </button>
  );
};

export default Button;
