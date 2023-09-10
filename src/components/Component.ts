export abstract class Component<
  TProps = void,
  TNode extends HTMLElement = HTMLElement
> {
  constructor(props: TProps) {
    this.props = props;
  }

  protected props: TProps;

  update(props: TProps) {
    this.props = props;
    this.render();
  }

  unmount(): void {}
  render(): void {}

  abstract mount(): TNode;
}
