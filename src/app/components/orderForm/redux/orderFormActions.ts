import * as requestFromServer from './orderFormCrud';
import { callTypes, orderFormSlice } from './orderFormSlice';
import { ICreateOrderQuery, IGetCrewsQuery } from './../types'
import { Dispatch } from 'redux';

const { actions } = orderFormSlice;

export const fetchCrews = (queryParams: IGetCrewsQuery) => (dispatch: Dispatch) => {
  dispatch(actions.startCall({ callType: callTypes.crews }));
  return requestFromServer
    .getCrews(queryParams)
    .then(response => {
      dispatch(actions.crewsFetched(response));
    })
    .catch(error => {
      error.clientMessage = "Can't find crews!";
      dispatch(actions.catchError({ error, callType: callTypes.crews }));
    });
};

export const removeCrews = () => (dispatch: Dispatch) => {
  dispatch(actions.removeCrews());
};

export const createOrder = (queryParams: ICreateOrderQuery) => (dispatch: Dispatch) => {
  dispatch(actions.startCall({ callType: callTypes.order }));
  return requestFromServer
    .createOrder(queryParams)
    .then(response => {
      dispatch(actions.orderCreated(response));
    })
    .catch(error => {
      error.clientMessage = "Can't create order!";
      dispatch(actions.catchError({ error, callType: callTypes.order }));
    });
};

export const clearState = () => (dispatch: Dispatch) => {
  dispatch(actions.clear());
};