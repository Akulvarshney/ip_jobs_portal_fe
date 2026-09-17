import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// 1. Organisation Profile
export const fetchOrganisationProfile = createAsyncThunk('employer/fetchOrganisation', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/employer/organisation');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch organisation profile');
  }
});

export const updateOrganisationProfile = createAsyncThunk('employer/updateOrganisation', async (data, { rejectWithValue }) => {
  try {
    const res = await api.put('/api/employer/organisation', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update organisation profile');
  }
});

// 2. Manage Jobs
export const fetchEmployerJobs = createAsyncThunk('employer/fetchJobs', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/jobs/employer');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch employer jobs');
  }
});

export const createJob = createAsyncThunk('employer/createJob', async (jobData, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/jobs', jobData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to post job');
  }
});

export const updateJob = createAsyncThunk('employer/updateJob', async ({ id, jobData }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/jobs/${id}`, jobData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update job');
  }
});

export const deleteJob = createAsyncThunk('employer/deleteJob', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/jobs/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to delete job');
  }
});

// 3. Manage Applications
export const fetchEmployerApplications = createAsyncThunk('employer/fetchApplications', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/applications/employer', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch applications');
  }
});

export const fetchJobApplicants = createAsyncThunk('employer/fetchJobApplicants', async (jobId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/applications/job/${jobId}`);
    return { jobId, applications: res.data?.data !== undefined ? res.data.data : res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch job applicants');
  }
});

export const updateApplicationStatus = createAsyncThunk('employer/updateApplicationStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/applications/${id}/status`, { status });
    return { id, status, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update status');
  }
});

export const scheduleInterview = createAsyncThunk('employer/scheduleInterview', async ({ id, interviewData }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/applications/${id}/schedule-interview`, interviewData);
    return { id, interview: res.data?.data !== undefined ? res.data.data : res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to schedule interview');
  }
});

export const inviteCandidate = createAsyncThunk('employer/inviteCandidate', async (appId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/applications/${appId}/invite`);
    return { appId, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to send invite');
  }
});

const initialState = {
  organisation: null,
  jobs: [],
  applications: [],
  dashboardStats: null,
  loading: false,
  error: null,
};

export const employerSlice = createSlice({
  name: 'employer',
  initialState,
  reducers: {
    clearEmployerState: (state) => {
      state.organisation = null;
      state.jobs = [];
      state.applications = [];
      state.dashboardStats = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Organisation
      .addCase(fetchOrganisationProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrganisationProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.organisation = action.payload;
      })
      .addCase(fetchOrganisationProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateOrganisationProfile.fulfilled, (state, action) => {
        state.organisation = { ...state.organisation, ...action.payload };
      })
      // Jobs
      .addCase(fetchEmployerJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployerJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchEmployerJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createJob.fulfilled, (state, action) => {
        state.jobs.unshift(action.payload);
      })
      .addCase(updateJob.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(j => j.id === action.payload.id);
        if (index !== -1) {
          state.jobs[index] = action.payload;
        }
      })
      .addCase(deleteJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter(j => j.id !== action.payload);
      })
      // Applications
      .addCase(fetchEmployerApplications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchEmployerApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = action.payload;
      })
      .addCase(fetchEmployerApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const app = state.applications.find(a => a.id === action.payload.id);
        if (app) {
          app.status = action.payload.status;
        }
      });
  },
});

export const { clearEmployerState } = employerSlice.actions;
export default employerSlice.reducer;
