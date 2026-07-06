import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  franchises: [],
  loading: false,
  error: null,
};

const franchiseSlice = createSlice({
  name: 'franchise',
  initialState,
  reducers: {
    setFranchises(state, action) {
      state.franchises = action.payload;
    },
    addFranchise(state, action) {
      state.franchises.push(action.payload);
    },
  },
});

export const { setFranchises, addFranchise } = franchiseSlice.actions;
export default franchiseSlice.reducer;
