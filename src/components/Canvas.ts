import { Component } from './Component';

interface Props {
  width: number;
  height: number;
  id?: string;
}

export class Canvas extends Component<Props> {
  mount() {
    const canvas = document.createElement('canvas');
    canvas.width = this.props.width;
    canvas.height = this.props.height;

    if (this.props.id) {
      canvas.setAttribute('id', this.props.id);
    }

    return canvas;
  }
}
