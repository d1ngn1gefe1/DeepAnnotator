import React from 'react';
import {Rect} from 'react-konva';

export default class Box extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      box: {
        x: 200,
        y: 200,
        width: 50,
        height: 50,
      },
    };
  }

  render() {
    var self = this;
    return (
      <Rect
        x={self.state.box.x}
        y={self.state.box.y}
        width={self.state.box.width}
        height={self.state.box.height}
        fill={"red"}
        shadowBlur={10}
        draggable={true}
       />
    );
  }
}
