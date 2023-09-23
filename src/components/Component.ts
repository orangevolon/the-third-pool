export abstract class Component<
  TProps = void,
  TNode extends HTMLElement = HTMLElement,
> {
  constructor(props: TProps) {
    this.props = props;
  }

  protected props: TProps;

  update(updatedProps: Partial<TProps>) {
    this.props = {
      ...this.props,
      ...updatedProps,
    };
  }

  abstract unmount(): void;
  abstract mount(): TNode;
}
