export interface System {
  log(message?: string | number): void;
  error(message: string): void;
}
