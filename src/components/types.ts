export interface Component<TProps = void> {
  element: HTMLElement;
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: (newProps: TProps) => void;
}

export interface SurfaceTouchEvent {
  x: number;
  y: number;
  timeMs: number;
}