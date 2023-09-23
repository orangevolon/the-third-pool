export interface Component<TProps = void> {
  element: HTMLElement;
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: (newProps: TProps) => void;
}

export interface Rect {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface TouchEvent extends Point {
  timeMs: number;
}
