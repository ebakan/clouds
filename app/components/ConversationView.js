import React, { Component, PropTypes } from 'react';
import Cloud from './Cloud';

export default class ConversationView extends Component {
  render() {
    const { statistics, date, format } = this.props;
    const dateStr = date.toString();
    return (
      <div className='conversation'>
        {Object.keys(statistics).map(key => {
          let data = statistics[key].dates[dateStr] && statistics[key].dates[dateStr] || {uniqueWordCount: 0, totalWordCount: 0, words: []};
          return (
            <div className='participant' key={key}>
              <div className='participant-header'>
                <div className='participant-name'>{statistics[key].name}</div>
                <div className='participant-data'>{data.uniqueWordCount || 0} Unique Words</div>
                <div className='participant-data'>{data.totalWordCount || 0} Total Words</div>
              </div>
              <Cloud words={data.words} />
            </div>
          );
        })}
      </div>
    );
  }
}

ConversationView.propTypes = {
  statistics: PropTypes.object.isRequired,
  date: PropTypes.object.isRequired,
  format: PropTypes.string.isRequired
};
