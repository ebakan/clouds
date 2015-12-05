import { createAction } from 'redux-actions';
import update from "react/lib/update";
import d3 from "d3";

export default {
  getChat: () => {
    let action = createAction('GET_CHAT')({});
    return dispatch => {
      dispatch(action);
      d3.json("chat.json", function(error, json) {
        if (error) {
          dispatch(update(action, {$merge: {meta: "error", payload: error}}));
        } else {
          dispatch(update(action, {$merge: {meta: "success", payload: json}}));
        }
      });
    };
  },
  setRenderDate: createAction('SET_RENDER_DATE'),
  setRenderTimescale: createAction('SET_RENDER_TIMESCALE'),
  setRenderFormat: createAction('SET_RENDER_FORMAT')
};
