import React, { Component, PropTypes } from 'react';
import { AreaChart } from 'react-d3';

export default class FrequencySeries extends Component {
  constructor(props) {
    super(props);
    this.state = {width: 0};
    this.resize = this.resize.bind(this);
  }

  resize() {
    this.setState({width: window.innerWidth});
  }
  componentDidMount() {
    this.resize();
    window.addEventListener('resize', this.resize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  render() {
    let width = this.state.width
    const { statistics } = this.props;
    let dates = {}
    for (let key of Object.keys(statistics)) {
      let participant = statistics[key];
      for (let date of Object.keys(participant.dates)) {
        dates[date] = dates[date] || {};
        dates[date][key] = participant.dates[date].totalWordCount;
      }
    }
    let series = Object.keys(statistics).map(key => {
      let data = statistics[key];
      let values = Object.keys(dates).map((date) => {
        return {x: new Date(date), y: dates[date][key] && dates[date][key] || 0}
      });
      values.sort((a,b) => a.x - b.x);
      return {
        name: data.name,
        values: values
      };
    });
    return (
      <div className='frequency-series'>
        <AreaChart data={series}
                   xAxisTickInterval={{}}
                   width={width}
                   height={200}
                   margins={{top: 0, right: 0, bottom: 40, left: 0}}
                   />
      </div>
    );
  }
}

FrequencySeries.propTypes = {
  statistics: PropTypes.object.isRequired,
}
