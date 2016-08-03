import React from 'react';
import {Group, Rect, Circle} from 'react-konva';

export default class Box extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      x1: 50,
      y1: 50,
      x2: 100,
      y2: 100,
      strokeWidth1: 2,
      strokeWidth2: 2
    };
  }

  componentDidMount() {
    var self = this;

    self.refs.anchor1.setZIndex(10);
    self.refs.anchor2.setZIndex(10);
    self.refs.rect.setZIndex(-1);
  }

  handleMouseEnterAnchor(id) {
    var self = this;
    console.log("mouse enter");

    if (id == 0) {
      self.setState({
        strokeWidth1: 4
      });
    } else if (id == 1) {
      self.setState({
        strokeWidth2: 4
      });
    }
  }

  handleMouseLeaveAnchor(id) {
    var self = this;
    console.log("mouse leave");

    self.setState({
      strokeWidth1: 2,
      strokeWidth2: 2
    });
  }

  handleDragMoveAnchor(id) {
    var self = this;
    console.log("drag move anchor");

    if (id == 0) {
      var x1 = self.refs.anchor1.getAttr("x");
      var y1 = self.refs.anchor1.getAttr("y");
      self.setState({
        x1: x1,
        y1: y1
      });
    } else if (id == 1) {
      var x2 = self.refs.anchor2.getAttr("x");
      var y2 = self.refs.anchor2.getAttr("y");
      self.setState({
        x2: x2,
        y2: y2
      });
    }
  }

  handleDragMoveRect() {
    var self = this;
    console.log("drag move rect");

    var x = self.refs.rect.getAttr("x");
    var y = self.refs.rect.getAttr("y");
    var width = self.refs.rect.getAttr("width");
    var height = self.refs.rect.getAttr("height");

    self.setState({
      x1: x,
      y1: y,
      x2: x+width,
      y2: y+height
    });
  }

  render() {
    var self = this;
    return (
      <Group>
        <Circle
          ref="anchor1"
          x={self.state.x1} y={self.state.y1} radius={8} strokeWidth={self.state.strokeWidth1}
          fill="#ddd" stroke="#666"
          draggable={true}
          onMouseEnter={this.handleMouseEnterAnchor.bind(self, 0)}
          onMouseLeave={this.handleMouseLeaveAnchor.bind(self, 0)}
          onDragMove={this.handleDragMoveAnchor.bind(self, 0)}
        />

        <Circle
          ref="anchor2"
          x={self.state.x2} y={self.state.y2} radius={8} strokeWidth={self.state.strokeWidth2}
          fill="#ddd" stroke="#666"
          draggable={true}
          onMouseEnter={this.handleMouseEnterAnchor.bind(self, 1)}
          onMouseLeave={this.handleMouseLeaveAnchor.bind(self, 1)}
          onDragMove={this.handleDragMoveAnchor.bind(self, 1)}
        />

        <Rect
          ref="rect"
          x={self.state.x1}
          y={self.state.y1}
          width={self.state.x2-self.state.x1}
          height={self.state.y2-self.state.y1}
          fill={"blue"}
          opacity={0.2}
          shadowBlur={10}
          draggable={true}
          onDragMove={this.handleDragMoveRect.bind(self)}
        />
      </Group>
    );
  }
}
