export interface Component<TProps = void> {
  element: HTMLElement;
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: (newProps: TProps) => void;
}
