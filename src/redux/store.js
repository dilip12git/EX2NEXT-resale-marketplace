import { configureStore } from '@reduxjs/toolkit';
import coordinatesReducer from './coordinatesSlice';

const store = configureStore({
    reducer: {
        coordinates: coordinatesReducer,
    },
});

export default store;
