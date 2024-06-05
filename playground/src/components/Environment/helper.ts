export const HORIZONTAL_ORIENTATION_THRESHOLD = 640;
export const TERMINAL_MIN_WIDTH = 160;
export const TERMINAL_MIN_HEIGHT = 80;

export enum Orientation {
  Horizontal,
  Vertical,
}

export const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const computeOrientation = (client: HTMLElement): Orientation => {
  const clientWidth = client.getBoundingClientRect().width;

  if (clientWidth < HORIZONTAL_ORIENTATION_THRESHOLD) {
    return Orientation.Vertical;
  } else {
    return Orientation.Horizontal;
  }
};

export const computeOrientationClassName = (
  orientation: Orientation
): string => {
  if (orientation === Orientation.Vertical) {
    return "verticaly";
  } else {
    return "horizontaly";
  }
};

export const resizeHorizontaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement,
  absoluteX: number
) => {
  document.querySelector("body")?.style.setProperty("cursor", "ew-resize");

  const envLeft = environment.getBoundingClientRect().left;
  const envWidth = environment.getBoundingClientRect().width;
  const relativeX = absoluteX - envLeft;

  let editorRatio = clamp(relativeX / envWidth, 0.2, 1);
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedWidth = terminalRatio * envWidth;

  if (terminalEstimatedWidth < TERMINAL_MIN_WIDTH) {
    editorRatio = 1;
  }

  editor.style.setProperty("width", `${editorRatio * 100}%`);
  if (editorRatio === 1) terminal.style.setProperty("width", "0%");
  else terminal.style.setProperty("width", "auto");
};

export const resizeVerticaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement,
  absoluteY: number
) => {
  document.querySelector("body")?.style.setProperty("cursor", "ew-resize");

  const envTop = environment.getBoundingClientRect().top;
  const envHeight = environment.getBoundingClientRect().height;
  const relativeY = absoluteY - envTop;

  let editorRatio = clamp(relativeY / envHeight, 0.2, 1);
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedHeight = terminalRatio * envHeight;

  if (terminalEstimatedHeight < TERMINAL_MIN_HEIGHT) {
    editorRatio = 1;
  }

  editor.style.setProperty("height", `${editorRatio * 100}%`);
  terminal.style.setProperty("height", `${terminalRatio * 100}%`);
};

export const setResizeHorizontaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement
) => {
  document.querySelector("body")?.style.removeProperty("cursor");

  const envWidth = environment.getBoundingClientRect().width;
  const editorWidthProp = editor.style.getPropertyValue("width");
  const editorRatio = parseInt(editorWidthProp.replace("%", "")) / 100;
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedWidth = terminalRatio * envWidth;

  if (terminalEstimatedWidth < TERMINAL_MIN_WIDTH) {
    editor.style.setProperty("width", "100%");
    terminal.style.setProperty("width", "0");
  } else {
    terminal.style.setProperty("width", "auto");
  }
};

export const setResizeVerticaly = (
  environment: HTMLElement,
  editor: HTMLElement,
  terminal: HTMLElement
) => {
  document.querySelector("body")?.style.removeProperty("cursor");

  const envHeight = environment.getBoundingClientRect().height;
  const editorHeightProp = editor.style.getPropertyValue("height");
  const editorRatio = parseInt(editorHeightProp.replace("%", "")) / 100;
  const terminalRatio = 1 - editorRatio;
  const terminalEstimatedHeight = terminalRatio * envHeight;

  if (terminalEstimatedHeight < TERMINAL_MIN_HEIGHT) {
    editor.style.setProperty("height", "100%");
    terminal.style.setProperty("height", "0");
  } else {
    terminal.style.setProperty("height", `${terminalRatio * 100}%`);
  }
};
