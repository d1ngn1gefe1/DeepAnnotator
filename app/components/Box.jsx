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
    console.log("Box info:", this.state.box);
    return (
      <Rect
        x={this.state.box.x}
        y={this.state.box.y}
        width={this.state.box.width}
        height={this.state.height}
        fill={"red"}
        shadowBlur={10}
        draggable={true}
       />
    );
  }
}
