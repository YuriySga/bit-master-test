import { createSlice } from '@reduxjs/toolkit';
import { IOrderFormState } from '../types';

const initialOrderFormState: IOrderFormState = {
  crewsLoading: false,
  orderLoading: false,
  entities: [],
  orderId: null,
  error: null
};

export const callTypes = {
  crews: 'crews',
  order: 'order',
};

export const orderFormSlice = createSlice({
  name: 'orderForm',
  initialState: initialOrderFormState,
  reducers: {
    catchError: (state, action) => {
      state.error = `${action.type}: ${action.payload.error}`;
      if (action.payload.callType === callTypes.crews) {
        state.crewsLoading = false;
        return;
      };

      if (action.payload.callType === callTypes.order) {
        state.orderLoading = false;
        return;
      };
    },

    startCall: (state, action) => {
      state.error = null;
      if (action.payload.callType === callTypes.crews) {
        state.crewsLoading = true;
        return;
      };

      if (action.payload.callType === callTypes.order) {
        state.orderLoading = true;
        return;
      };
    },

    crewsFetched: (state, action) => {
      const { crews_info } = action.payload.data;
      state.crewsLoading = false;
      state.error = null;
      state.entities = crews_info;
    },

    removeCrews: (state) => {
      state.crewsLoading = false;
      state.error = null;
      state.entities = [];
    },

    orderCreated: (state, action) => {
      const { order_id } = action.payload.data;
      state.orderLoading = false;
      state.error = null;
      state.orderId = order_id;
    },

    clear: (state) => {
      state.crewsLoading = initialOrderFormState.crewsLoading;
      state.orderLoading = initialOrderFormState.orderLoading;
      state.entities = initialOrderFormState.entities;
      state.orderId = initialOrderFormState.orderId;
      state.error = initialOrderFormState.error
    },
  },
});
