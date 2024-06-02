import { useRef } from "react";
import "./styles.css";

interface Props {
  source: string;
  formattedSource?: string;
  setSource(source: string): void;
}

const Editor: React.FC<Props> = (props) => {
  const { source, formattedSource, setSource } = props;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const backgroundRef = useRef<HTMLElement>(null);

  const onInputScroll = () => {
    if (!(inputRef.current && backgroundRef.current)) return;

    backgroundRef.current.scrollTop = inputRef.current.scrollTop;
  };

  return (
    <section className="input-container">
      <article
        ref={backgroundRef}
        dangerouslySetInnerHTML={{ __html: formattedSource ?? source }}
        className="input-background"
      ></article>
      <textarea
        ref={inputRef}
        onScroll={onInputScroll}
        className="input"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
    </section>
  );
};

export default Editor;
