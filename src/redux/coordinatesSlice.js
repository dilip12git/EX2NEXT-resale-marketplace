import { createSlice } from '@reduxjs/toolkit';

const coordinatesSlice = createSlice({
    name: 'coordinates',
    initialState: JSON.parse(localStorage.getItem('userCoordinates')) || { lat: null, lon: null },
    reducers: {
        setCoordinates: (state, action) => {
            localStorage.setItem('userCoordinates', JSON.stringify(action.payload));
            return action.payload;
        },
    },
});

export const { setCoordinates } = coordinatesSlice.actions;
export default coordinatesSlice.reducer;
