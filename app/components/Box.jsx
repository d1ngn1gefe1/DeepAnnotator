import React from "react";
import {Group, Rect, Circle, Text} from "react-konva";

// don't change these!
var HEIGHT = 240;
var WIDTH = 320;
var SCALING = 2;

export default class Box extends React.Component {
  constructor(props) {
    super(props);
    var self = this;

    self.state = {
      /*
        bboxes is a list of bbox = [x1, y1, x2, x2, currentFrame]
      */
      bboxes: [[100, 100, 200, 200, 0]],
      strokeWidth1: 2,
      strokeWidth2: 2,
      strokeWidth3: 2,
      strokeWidth4: 2
    };

    self.bbox = self.getCurrentBbox();
    self.colors = ["#777777", "#449d44", "#5bc0de", "#d9534f"];
  }

  componentDidMount() {
    var self = this;
  }

  componentWillUpdate() {
    var self = this;
    self.bbox = self.getCurrentBbox();
  }

  getData() {
    var self = this;
    var data = {
      bboxes: self.state.bboxes
    }
    return data;
  }

  setData(data) {
    this.setState({
      bboxes: data["bboxes"]
    })
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
    } else if (id == 2) {
      self.setState({
        strokeWidth3: 4
      });
    } else if (id == 3) {
      self.setState({
        strokeWidth4: 4
      });
    }
  }

  handleMouseLeaveAnchor(id) {
    var self = this;
    console.log("mouse leave");

    self.setState({
      strokeWidth1: 2,
      strokeWidth2: 2,
      strokeWidth3: 2,
      strokeWidth4: 2
    });
  }

  fixAnchor(x1, y1, x2, y2) {
    x1 = Math.min(Math.max(x1, 0), WIDTH*SCALING);
    y1 = Math.min(Math.max(y1, 0), HEIGHT*SCALING);
    x2 = Math.min(Math.max(x2, 0), WIDTH*SCALING);
    y2 = Math.min(Math.max(y2, 0), HEIGHT*SCALING);

    return [x1, y1, x2, y2];
  }

  fixRect(x1, y1, x2, y2) {
    var self = this;

    var x = [x1, x2];
    var y = [y1, y2];
    self.adjustCoord(x, Math.abs(x1-x2), WIDTH*SCALING, false);
    self.adjustCoord(x, Math.abs(x1-x2), WIDTH*SCALING, true);
    self.adjustCoord(y, Math.abs(y1-y2), HEIGHT*SCALING, false);
    self.adjustCoord(y, Math.abs(y1-y2), HEIGHT*SCALING, true);

    return [x[0], y[0], x[1], y[1]];
  }

  adjustCoord(c, dist, max, reverse) {
    if (reverse) {
      var c1 = c[1];
      var c2 = c[0];
    } else {
      var c1 = c[0];
      var c2 = c[1];
    }
    if (c1 < 0) {
      c1 = 0;
      c2 = dist;
    } else if (c1 > max) {
      c1 = max;
      c2 = max - dist;
    }
    if (reverse) {
      c[1] = c1;
      c[0] = c2;
    } else {
      c[0] = c1;
      c[1] = c2;
    }
  }

  handleDragMoveAnchor(id) {
    var self = this;
    console.log("drag move anchor");

    var bboxes = self.state.bboxes;
    var x1, y1, x2, y2;

    // silly but efficient
    for (var i = 0; i < bboxes.length; i++) {
      if (bboxes[i][4] == self.props.currentFrame) {
        if (id == 0) {
          x1 = self.refs.anchor1.getAttr("x");
          y1 = self.refs.anchor1.getAttr("y");
          x2 = bboxes[i][2];
          y2 = bboxes[i][3];
        } else if (id == 1) {
          x1 = self.refs.anchor2.getAttr("x");
          y1 = bboxes[i][1];
          x2 = bboxes[i][2];
          y2 = self.refs.anchor2.getAttr("y");
        } else if (id == 2) {
          x1 = bboxes[i][0];
          y1 = bboxes[i][1];
          x2 = self.refs.anchor3.getAttr("x");
          y2 = self.refs.anchor3.getAttr("y");
        } else if (id == 3) {
          x1 = bboxes[i][0];
          y1 = self.refs.anchor4.getAttr("y");
          x2 = self.refs.anchor4.getAttr("x");
          y2 = bboxes[i][3];
        }

        var coor = self.fixAnchor(x1, y1, x2, y2);
        x1 = coor[0];
        y1 = coor[1];
        x2 = coor[2];
        y2 = coor[3];
        bboxes[i][0] = x1;
        bboxes[i][1] = y1;
        bboxes[i][2] = x2;
        bboxes[i][3] = y2;
        break;
      } else if (bboxes[i][4] > self.props.currentFrame) {
        if (id == 0) {
          x1 = self.refs.anchor1.getAttr("x");
          y1 = self.refs.anchor1.getAttr("y");
          x2 = bboxes[i][2];
          y2 = bboxes[i][3];
        } else if (id == 1) {
          x1 = self.refs.anchor2.getAttr("x");
          y1 = bboxes[i][1];
          x2 = bboxes[i][2];
          y2 = self.refs.anchor2.getAttr("y");
        } else if (id == 2) {
          x1 = bboxes[i][0];
          y1 = bboxes[i][1];
          x2 = self.refs.anchor3.getAttr("x");
          y2 = self.refs.anchor3.getAttr("y");
        } else if (id == 3) {
          x1 = bboxes[i][0];
          y1 = self.refs.anchor4.getAttr("y");
          x2 = self.refs.anchor4.getAttr("x");
          y2 = bboxes[i][3];
        }

        var coor = self.fixAnchor(x1, y1, x2, y2);
        x1 = coor[0];
        y1 = coor[1];
        x2 = coor[2];
        y2 = coor[3];
        bboxes.splice(i, 0, [x1, y1, x2, y2, self.props.currentFrame]);
        break;
      } else if (i == bboxes.length-1) {
        if (id == 0) {
          x1 = self.refs.anchor1.getAttr("x");
          y1 = self.refs.anchor1.getAttr("y");
          x2 = bboxes[i][2];
          y2 = bboxes[i][3];
        } else if (id == 1) {
          x1 = self.refs.anchor2.getAttr("x");
          y1 = bboxes[i][1];
          x2 = bboxes[i][2];
          y2 = self.refs.anchor2.getAttr("y");
        } else if (id == 2) {
          x1 = bboxes[i][0];
          y1 = bboxes[i][1];
          x2 = self.refs.anchor3.getAttr("x");
          y2 = self.refs.anchor3.getAttr("y");
        } else if (id == 3) {
          x1 = bboxes[i][0];
          y1 = self.refs.anchor4.getAttr("y");
          x2 = self.refs.anchor4.getAttr("x");
          y2 = bboxes[i][3];
        }

        var coor = self.fixAnchor(x1, y1, x2, y2);
        x1 = coor[0];
        y1 = coor[1];
        x2 = coor[2];
        y2 = coor[3];
        bboxes.push([x1, y1, x2, y2, self.props.currentFrame]);
        break;
      }
    }

    self.setState({
      bboxes: bboxes
    });
    self.bbox = self.getCurrentBbox();
    self.props.notSaved();
  }

  handleDragMoveRect() {
    var self = this;
    console.log("drag move rect");

    var bboxes = self.state.bboxes;

    var x1 = self.refs.rect.getAttr("x");
    var y1 = self.refs.rect.getAttr("y");
    var x2 = x1+self.refs.rect.getAttr("width");
    var y2 = y1+self.refs.rect.getAttr("height");

    var coor = self.fixRect(x1, y1, x2, y2);
    x1 = coor[0];
    y1 = coor[1];
    x2 = coor[2];
    y2 = coor[3];

    for (var i = 0; i < bboxes.length; i++) {
      if (bboxes[i][4] == self.props.currentFrame) {
        bboxes[i][0] = x1;
        bboxes[i][1] = y1;
        bboxes[i][2] = x2;
        bboxes[i][3] = y2;
        break;
      } else if (bboxes[i][4] > self.props.currentFrame) {
        bboxes.splice(i, 0, [x1, y1, x2, y2, self.props.currentFrame]);
        break;
      } else if (i == bboxes.length-1) {
        bboxes.push([x1, y1, x2, y2, self.props.currentFrame]);
        break;
      }
    }

    self.setState({
      bboxes: bboxes
    });
    self.bbox = self.getCurrentBbox();
    self.props.notSaved();
  }

  getCurrentBbox() {
    var self = this;

    var bboxes = self.state.bboxes;

    for (var i = 0; i < bboxes.length; i++) {
      if (bboxes[i][4] == self.props.currentFrame) {
        return bboxes[i];
      } else if (bboxes[i][4] > self.props.currentFrame) {
        var currentFrame = self.props.currentFrame;
        var pastFrame = bboxes[i-1][4];
        var futureFrame = bboxes[i][4];

        var ratio = 1.0*(currentFrame-pastFrame)/(futureFrame-pastFrame);

        var x1 = bboxes[i-1][0]+ratio*(bboxes[i][0]-bboxes[i-1][0]);
        var y1 = bboxes[i-1][1]+ratio*(bboxes[i][1]-bboxes[i-1][1]);
        var x2 = bboxes[i-1][2]+ratio*(bboxes[i][2]-bboxes[i-1][2]);
        var y2 = bboxes[i-1][3]+ratio*(bboxes[i][3]-bboxes[i-1][3]);

        return [x1, y1, x2, y2];
      } else if (i == bboxes.length-1) {
        return bboxes[i];
      }
    }
  }

  render() {
    var self = this;

    if (self.props.currentOption == 1) { // out of frame
      return (
        <Group></Group>
      );
    }

    return (
      <Group>
        <Rect
          ref="rect"
          x={self.bbox[0]}
          y={self.bbox[1]}
          width={self.bbox[2]-self.bbox[0]}
          height={self.bbox[3]-self.bbox[1]}
          fill={self.colors[self.props.currentOption+1]}
          opacity={0.2}
          shadowBlur={10}
          draggable={true}
          onDragMove={this.handleDragMoveRect.bind(self)}
        />

        <Text
          text={"Object "+self.props.id}
          x={Math.min(self.bbox[0], self.bbox[2])+10}
          y={Math.min(self.bbox[1], self.bbox[3])+10}
          fill={"#fff"}
          fontSize={14}
          fontFamily={"Lato"}
        />

        <Circle
          ref="anchor1"
          x={self.bbox[0]} y={self.bbox[1]} radius={6} strokeWidth={self.state.strokeWidth1}
          fill="#ddd" stroke="#666"
          draggable={true}
          onMouseEnter={this.handleMouseEnterAnchor.bind(self, 0)}
          onMouseLeave={this.handleMouseLeaveAnchor.bind(self, 0)}
          onDragMove={this.handleDragMoveAnchor.bind(self, 0)}
        />

        <Circle
          ref="anchor2"
          x={self.bbox[0]} y={self.bbox[3]} radius={6} strokeWidth={self.state.strokeWidth2}
          fill="#ddd" stroke="#666"
          draggable={true}
          onMouseEnter={this.handleMouseEnterAnchor.bind(self, 1)}
          onMouseLeave={this.handleMouseLeaveAnchor.bind(self, 1)}
          onDragMove={this.handleDragMoveAnchor.bind(self, 1)}
        />

        <Circle
          ref="anchor3"
          x={self.bbox[2]} y={self.bbox[3]} radius={6} strokeWidth={self.state.strokeWidth3}
          fill="#ddd" stroke="#666"
          draggable={true}
          onMouseEnter={this.handleMouseEnterAnchor.bind(self, 2)}
          onMouseLeave={this.handleMouseLeaveAnchor.bind(self, 2)}
          onDragMove={this.handleDragMoveAnchor.bind(self, 2)}
        />

        <Circle
          ref="anchor4"
          x={self.bbox[2]} y={self.bbox[1]} radius={6} strokeWidth={self.state.strokeWidth4}
          fill="#ddd" stroke="#666"
          draggable={true}
          onMouseEnter={this.handleMouseEnterAnchor.bind(self, 3)}
          onMouseLeave={this.handleMouseLeaveAnchor.bind(self, 3)}
          onDragMove={this.handleDragMoveAnchor.bind(self, 3)}
        />
      </Group>
    );
  }
}

Box.propTypes = {
  currentFrame: React.PropTypes.number,
  labelToBoxDatum: React.PropTypes.object
};

Box.defaultProps = {
  currentFrame: 0,
  labelToBoxDatum: null
};
