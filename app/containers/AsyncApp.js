import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import actions from '../actions';
import ConversationView from '../components/ConversationView';
import FrequencySeries from '../components/FrequencySeries';
import Slider from 'rc-slider';
import moment from 'moment';
import { Button, ButtonGroup } from 'react-bootstrap';

const stopWords = /^(i|me|my|myself|we|us|our|ours|ourselves|you|your|yours|yourself|yourselves|he|him|his|himself|she|her|hers|herself|it|its|itself|they|them|their|theirs|themselves|what|which|who|whom|whose|this|that|these|those|am|is|are|was|were|be|been|being|have|has|had|having|do|does|did|doing|will|would|should|can|could|ought|i'm|you're|he's|she's|it's|we're|they're|i've|you've|we've|they've|i'd|you'd|he'd|she'd|we'd|they'd|i'll|you'll|he'll|she'll|we'll|they'll|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|doesn't|don't|didn't|won't|wouldn't|shan't|shouldn't|can't|cannot|couldn't|mustn't|let's|that's|who's|what's|here's|there's|when's|where's|why's|how's|a|an|the|and|but|if|or|because|as|until|while|of|at|by|for|with|about|against|between|into|through|during|before|after|above|below|to|from|up|upon|down|in|out|on|off|over|under|again|further|then|once|here|there|when|where|why|how|all|any|both|each|few|more|most|other|some|such|no|nor|not|only|own|same|so|than|too|very|say|says|said|shall)$/;

const punctuation = /[!"&()*+,-\.\/:;<=>?\[\\\]^`\{|\}~]+/g;
const wordSeparators = /[\s\u3031-\u3035\u309b\u309c\u30a0\u30fc\uff70]+/g;
const discard = /^(@|https?:)/;
const timescaleOptions = ['day', 'week', 'month'];
const displayTimescaleOptions = {day: 'Daily', week: 'Weekly', month: 'Monthly'};

class AsyncApp extends Component {
  constructor(props) {
    super(props);
    this.handleTimescaleChange = this.handleTimescaleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleFormatChange = this.handleFormatChange.bind(this);
  }

  componentDidMount() {
    this.props.dispatch(actions.getChat());
  }

  handleTimescaleChange(timescale) {
    this.props.dispatch(actions.setRenderTimescale(timescale));
  }

  handleDateChange(date) {
    this.props.dispatch(actions.setRenderDate(date));
  }

  handleFormatChange(format) {
    this.props.dispatch(actions.setRenderFormat(format));
  }

  render() {
    const { statistics, date, timescale, format, loading } = this.props;
    if (!loading) {
      let dates = Array.from(new Set(Object.keys(statistics).map(id => {
        return Object.keys(statistics[id].dates).map(date => new Date(date));
      }).reduce((a,b) => a.concat(b), [])));
      dates.sort((a,b) => a.valueOf() - b.valueOf());
      const handleDateChange = this.handleDateChange;
      const handleTimescaleChange = this.handleTimescaleChange;
      const onChange = dateIndex => handleDateChange(moment(dates[dateIndex]));
      const index = dates.map(d => d.toString()).indexOf(date.toDate().toString());
      return (
        <div className='app'>
          <div className='date'>{moment(date).format('ll')}</div>
          <ConversationView statistics={statistics} date={date} format={format} />
          <div className='timescale-chooser'>
            <ButtonGroup>
              {timescaleOptions.map(option => (
                <Button key={option} active={timescale === option} onClick={() => handleTimescaleChange(option)}>{displayTimescaleOptions[option]}</Button>
              ))}
            </ButtonGroup>
          </div>
          <FrequencySeries statistics={statistics} />
          <Slider min={0} max={dates.length - 1} included={false} tipFormatter={i => dates[i] && moment(dates[i]).format('ll')} value={index} onChange={onChange}/>
        </div>
      );
    }
    else {
      return (
          <div className='loading'>
            <div className='loading-text'>Loading Chats</div>
            <img className='loading-icon' src='loading.gif' />
          </div>
      );
    }
  }
}

AsyncApp.propTypes = {
  statistics: PropTypes.object.isRequired,
  date: PropTypes.object.isRequired,
  timescale: PropTypes.string.isRequired,
  format: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired
};

const selectChat = state => state.chat;
const selectTimescale = state => state.timescale;
const selectStatistics = createSelector(selectChat, selectTimescale, (chat, timescale) => {
  if(!chat || !chat.conversation_state) { return {}; }
  let participantData = {};
  for (let participant of chat.conversation_state.conversation.participant_data) {
    participantData[participant.id.chat_id] = {name: participant.fallback_name, dates: {}}
  }
  for(let event of chat.conversation_state.event) {
    if (event.event_type !== 'REGULAR_CHAT_MESSAGE' || event.chat_message.message_content.segment === undefined) { continue; }
    let timestamp = moment(parseInt(event.timestamp) / 1000).startOf(timescale).toString();
    // console.log(timescale, timestamp.toString());
    let dates = participantData[event.sender_id.chat_id].dates;
    dates[timestamp] = dates[timestamp] || {str: ''};
    for (let segment of event.chat_message.message_content.segment) {
      dates[timestamp].str += segment.text + ' ';
    }
  }
  for(let id of Object.keys(participantData)) {
    let data = participantData[id];
    let series = Object.keys(data.dates).map(date => {
      let dateData = data.dates[date];
      let words = dateData.str.split(wordSeparators);
      let wordsHash = {};
      for (let word of words) {
        if(discard.test(word)) { continue; }
        if(!punctuation.test(word[0])) { word = word.replace(punctuation, '').toLowerCase(); }
        if(stopWords.test(word)) { continue; }
        wordsHash[word] = wordsHash[word] || 0;
        wordsHash[word]++;
      }
      dateData.words = Object.keys(wordsHash).map(word => {return {text: word, size: Math.log(wordsHash[word]) + 1}});
      dateData.totalWordCount = words.length;
      dateData.uniqueWordCount = Object.keys(wordsHash).length
    });
  }
  return participantData;
});

function mapStateToProps(state) {
  const { date, timescale, format, loading } = state;
  const statistics = selectStatistics(state);
  return { date, timescale, format, statistics, loading };
}

export default connect(mapStateToProps)(AsyncApp);
