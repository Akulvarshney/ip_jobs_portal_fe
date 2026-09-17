import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// 1. Admin Dashboard Stats
export const fetchAdminDashboard = createAsyncThunk('admin/fetchDashboard', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/admin/dashboard');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch admin stats');
  }
});

// 2. Manage Users
export const fetchAdminUsers = createAsyncThunk('admin/fetchUsers', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/admin/users', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch users');
  }
});

export const updateAdminUserStatus = createAsyncThunk('admin/updateUserStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/admin/users/${id}/status`, { status });
    return { id, status, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update user status');
  }
});

// 3. Manage Employers
export const fetchAdminEmployers = createAsyncThunk('admin/fetchEmployers', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/admin/employers', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch employers');
  }
});

export const updateAdminEmployerStatus = createAsyncThunk('admin/updateEmployerStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/admin/employers/${id}/status`, { status });
    return { id, status, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update employer status');
  }
});

// 4. Manage Jobs
export const fetchAdminJobs = createAsyncThunk('admin/fetchJobs', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/admin/jobs', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch admin jobs');
  }
});

export const updateAdminJobStatus = createAsyncThunk('admin/updateJobStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/admin/jobs/${id}/status`, { status });
    return { id, status, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update job status');
  }
});

export const deleteAdminJob = createAsyncThunk('admin/deleteJob', async (id, { rejectWithValue }) => {
  try {
    const res = await api.delete(`/api/admin/jobs/${id}`);
    return { id, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete job');
  }
});

// 5. Manage Applications
export const fetchAdminApplications = createAsyncThunk('admin/fetchApplications', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/admin/applications', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch applications');
  }
});

export const updateAdminApplicationStatus = createAsyncThunk('admin/updateApplicationStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/admin/applications/${id}/status`, { status });
    return { id, status, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update application status');
  }
});

// 6. Reports
export const fetchAdminReports = createAsyncThunk('admin/fetchReports', async (params, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/admin/reports', { params });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch reports');
  }
});

export const updateAdminReportStatus = createAsyncThunk('admin/updateReportStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/admin/reports/${id}/status`, { status });
    return { id, status, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update report status');
  }
});

export const createAdminReport = createAsyncThunk('admin/createReport', async (reportData, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/admin/reports', reportData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to create report');
  }
});

const initialState = {
  dashboard: null,
  users: [],
  employers: [],
  jobs: [],
  applications: [],
  reports: [],
  loading: false,
  error: null,
};

export const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminState: (state) => {
      state.dashboard = null;
      state.users = [];
      state.employers = [];
      state.jobs = [];
      state.applications = [];
      state.reports = [];
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Dashboard
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.dashboard = action.payload;
      })
      // Users
      .addCase(fetchAdminUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAdminUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminUserStatus.fulfilled, (state, action) => {
        const user = state.users.find(u => u.id === action.payload.id);
        if (user) user.status = action.payload.status;
      })
      // Employers
      .addCase(fetchAdminEmployers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminEmployers.fulfilled, (state, action) => {
        state.loading = false;
        state.employers = action.payload;
      })
      .addCase(fetchAdminEmployers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminEmployerStatus.fulfilled, (state, action) => {
        const emp = state.employers.find(e => e.id === action.payload.id);
        if (emp) emp.status = action.payload.status;
      })
      // Jobs
      .addCase(fetchAdminJobs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchAdminJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAdminJobStatus.fulfilled, (state, action) => {
        const job = state.jobs.find(j => j.id === action.payload.id);
        if (job) job.status = action.payload.status;
      })
      // Applications
      .addCase(fetchAdminApplications.fulfilled, (state, action) => {
        state.applications = action.payload;
      })
      .addCase(updateAdminApplicationStatus.fulfilled, (state, action) => {
        const app = state.applications.find(a => a.id === action.payload.id);
        if (app) app.status = action.payload.status;
      })
      // Reports
      .addCase(fetchAdminReports.fulfilled, (state, action) => {
        state.reports = action.payload;
      })
      .addCase(updateAdminReportStatus.fulfilled, (state, action) => {
        const report = state.reports.find(r => r.id === action.payload.id);
        if (report) report.status = action.payload.status;
      })
      .addCase(createAdminReport.fulfilled, (state, action) => {
        state.reports.unshift(action.payload);
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
