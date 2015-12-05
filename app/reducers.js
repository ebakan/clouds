import { combineReducers } from "redux";
import { handleActions } from "redux-actions";
import update from "react/lib/update";
import moment from 'moment';

const defaultState = {
  chat: {},
  date: moment(new Date()).startOf('day'),
  timescale: 'day',
  format: 'separate',
  loading: true
};

export default handleActions({
  GET_CHAT: (state, action) => {
    switch (action.meta) {
      case undefined:
        return update(state, {loading: {$set: true}});
      case "success":
        return update(state, {$merge: {loading: false, chat: action.payload}});
      case "error":
        console.error(`Error getting chat: ${state.payload}`);
        return update(state, {loading: {$set: false}});
      default:
        console.error(`Invalid meta: ${state.meta}`);
        return state;
    }
  },
  SET_RENDER_DATE: (state, action) => {
    return update(state, {date: {$set: action.payload}});
  },
  SET_RENDER_TIMESCALE: (state, action) => {
    return update(state, {$merge: {timescale: action.payload, date: state.date.startOf(action.payload)}});
  },
  SET_RENDER_FORMAT: (state, action) => {
    return update(state, {format: {$set: action.payload}});
  }
}, defaultState);
