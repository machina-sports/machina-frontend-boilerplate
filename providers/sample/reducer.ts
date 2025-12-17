import { createSlice } from '@reduxjs/toolkit';
import { loadWelcome } from '@/providers/sample/actions';

type SampleState = {
  message: string;
  status: 'idle' | 'loading' | 'failed';
  loaded: boolean;
  error?: string;
};

const initialState: SampleState = {
  message: 'Welcome to Machina boilerplate',
  status: 'idle',
  loaded: false,
};

const SampleReducer = createSlice({
  name: 'sample',
  initialState,
  reducers: {
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    clearMessage: (state) => {
      state.message = initialState.message;
      state.status = initialState.status;
      state.loaded = initialState.loaded;
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWelcome.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(loadWelcome.fulfilled, (state, action) => {
        state.message = action.payload ?? state.message;
        state.status = 'idle';
        state.loaded = true;
      })
      .addCase(loadWelcome.rejected, (state, action) => {
        state.status = 'failed';
        state.loaded = true;
        state.error = (action.payload as string) ?? action.error.message;
      });
  },
});

export const { setMessage, clearMessage } = SampleReducer.actions;
export default SampleReducer;
