import React, { Component, PropTypes } from 'react';
import { findDomNode } from 'react-dom';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import update from "react/lib/update";

export default class Cloud extends Component {

  constructor(props) {
    super(props);
    this.state = {width: 0, height: 0};
    this.resize = this.resize.bind(this);
  }

  resize() {
    this.setState({width: window.innerWidth / 2, height: window.innerHeight - 500});
  }
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  componentDidUpdate() {
    let fill = d3.scale.category20();
    let el = this.refs.cloud;
    const maxSize = Math.min(this.state.height, this.state.width) / Math.log(this.props.words.length) * 0.5;
    let wordSizes = this.props.words.map(w => w.size);
    let scaleFactor = maxSize / Math.max.apply(null, wordSizes);
    let updatedWords = this.props.words.map(w => update(w, {size: {$set: w.size * scaleFactor}}));
    let layout =
      cloud()
      .size([this.state.width, this.state.height])
      .words(updatedWords)
      .spiral("archimedean")
      .rotate(0)
      .fontSize(d => d.size)
      .on("end", (words) => {
        d3.select(el).select("svg").remove();
        d3.select(el)
          .append("svg")
          .attr("width", layout.size()[0])
          .attr("height", layout.size()[1])
          .append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
          .data(words)
          .enter()
          .append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("font-family", "Helvetica")
          .style("fill", function(d, i) { return fill(i); })
          .attr("text-anchor", "middle")
          .attr("transform", d => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
          .text(function(d) { return d.text; });


      })
    layout.start();
  }

  render() {
    return (
        <div>
          <div className="cloud" ref="cloud"></div>
        </div>
    );
  }
}

Cloud.propTypes = {
  words: PropTypes.arrayOf(PropTypes.shape({word: React.PropTypes.string, size: React.PropTypes.number}))
};
