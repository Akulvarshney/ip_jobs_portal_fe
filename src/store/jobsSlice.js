import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// 1. Fetch public / candidate jobs with optional query params
export const fetchAllJobs = createAsyncThunk('jobs/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/jobs', { params });
    return response.data?.data !== undefined ? response.data.data : response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch jobs');
  }
});

// 2. Fetch single job details
export const fetchJobById = createAsyncThunk('jobs/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/jobs/${id}`);
    return response.data?.data !== undefined ? response.data.data : response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch job details');
  }
});

// 3. Apply for job
export const applyForJob = createAsyncThunk('jobs/apply', async ({ jobId, applicationData }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/jobs/${jobId}/apply`, applicationData);
    return { jobId, ...(response.data?.data !== undefined ? response.data.data : response.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application');
  }
});

const initialState = {
  jobsList: [],
  selectedJob: null,
  searchQuery: '',
  activeCategory: 'All',
  locationFilter: 'All',
  loading: false,
  error: null,
};

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload;
    },
    setLocationFilter: (state, action) => {
      state.locationFilter = action.payload;
    },
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchAllJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobsList = action.payload;
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single
      .addCase(fetchJobById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSearchQuery, setActiveCategory, setLocationFilter, clearSelectedJob } = jobsSlice.actions;
export default jobsSlice.reducer;
