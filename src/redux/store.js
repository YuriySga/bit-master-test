import { configureStore } from '@reduxjs/toolkit';
import { reduxBatch } from '@manaflair/redux-batch';
import { rootReducer } from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  devTools: true,
  enhancers: [reduxBatch],
});

export default store;
