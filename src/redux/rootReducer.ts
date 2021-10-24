import { combineReducers } from 'redux';
import { orderFormSlice } from '../app/components/orderForm/redux/orderFormSlice';

export const rootReducer = combineReducers({
  taxi: orderFormSlice.reducer
});

