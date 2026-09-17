import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// 1. Dashboard Stats
export const fetchCandidateStats = createAsyncThunk('candidate/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/candidate/stats');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch candidate stats');
  }
});

// 2. Profile Details
export const fetchCandidateProfile = createAsyncThunk('candidate/fetchProfile', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/candidate/profile');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch candidate profile');
  }
});

export const updateCandidateProfile = createAsyncThunk('candidate/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const res = await api.put('/api/candidate/profile', profileData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update profile');
  }
});

// 3. Education
export const addEducation = createAsyncThunk('candidate/addEducation', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/candidate/education', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to add education');
  }
});

export const deleteEducation = createAsyncThunk('candidate/deleteEducation', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/candidate/education/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to delete education');
  }
});

// 4. Experience
export const addExperience = createAsyncThunk('candidate/addExperience', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/candidate/experience', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to add experience');
  }
});

export const deleteExperience = createAsyncThunk('candidate/deleteExperience', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/candidate/experience/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to delete experience');
  }
});

// 5. Skills
export const addSkill = createAsyncThunk('candidate/addSkill', async (skillName, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/candidate/skills', { skillName });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to add skill');
  }
});

export const removeSkill = createAsyncThunk('candidate/removeSkill', async (skillId, { rejectWithValue }) => {
  try {
    await api.delete(`/api/candidate/skills/${skillId}`);
    return skillId;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to remove skill');
  }
});

// 6. Certifications
export const addCertification = createAsyncThunk('candidate/addCertification', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/candidate/certifications', data);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to add certification');
  }
});

export const deleteCertification = createAsyncThunk('candidate/deleteCertification', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/candidate/certifications/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to delete certification');
  }
});

// 7. Applications
export const fetchCandidateApplications = createAsyncThunk('candidate/fetchApplications', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/candidate/applications');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch applications');
  }
});

export const applyToJob = createAsyncThunk('candidate/applyToJob', async ({ jobId, coverNote }, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/candidate/apply', { jobId, coverNote });
    return { jobId, ...(res.data?.data !== undefined ? res.data.data : res.data) };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to submit application');
  }
});

// 8. Saved Jobs
export const fetchSavedJobs = createAsyncThunk('candidate/fetchSavedJobs', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/candidate/saved-jobs');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch saved jobs');
  }
});

export const toggleSaveJob = createAsyncThunk('candidate/toggleSaveJob', async (jobId, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/candidate/saved-jobs/${jobId}`);
    return { jobId, ...res.data };
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to toggle saved job');
  }
});

// 9. Interviews
export const fetchCandidateInterviews = createAsyncThunk('candidate/fetchInterviews', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/candidate/interviews');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch interviews');
  }
});

// 10. Settings
export const fetchCandidateSettings = createAsyncThunk('candidate/fetchSettings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/candidate/settings');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch settings');
  }
});

export const updateCandidateSettings = createAsyncThunk('candidate/updateSettings', async (settingsData, { rejectWithValue }) => {
  try {
    const res = await api.put('/api/candidate/settings', settingsData);
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || err.response?.data?.message || 'Failed to update settings');
  }
});

// 11. Resume
export const updateResume = createAsyncThunk('candidate/updateResume', async ({ resumeUrl }, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/candidate/resume', { resumeUrl });
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update resume');
  }
});

export const deleteResume = createAsyncThunk('candidate/deleteResume', async (_, { rejectWithValue }) => {
  try {
    const res = await api.delete('/api/candidate/resume');
    return res.data?.data !== undefined ? res.data.data : res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete resume');
  }
});

const initialState = {
  stats: null,
  profile: null,
  applications: [],
  savedJobs: [],
  interviews: [],
  settings: null,
  loading: false,
  error: null,
};

export const candidateSlice = createSlice({
  name: 'candidate',
  initialState,
  reducers: {
    clearCandidateState: (state) => {
      state.stats = null;
      state.profile = null;
      state.applications = [];
      state.savedJobs = [];
      state.interviews = [];
      state.settings = null;
      state.loading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchCandidateStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      // Profile
      .addCase(fetchCandidateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCandidateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchCandidateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCandidateProfile.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      // Education
      .addCase(addEducation.fulfilled, (state, action) => {
        if (state.profile && state.profile.educations) {
          state.profile.educations.push(action.payload);
        }
      })
      .addCase(deleteEducation.fulfilled, (state, action) => {
        if (state.profile && state.profile.educations) {
          state.profile.educations = state.profile.educations.filter(e => e.id !== action.payload);
        }
      })
      // Experience
      .addCase(addExperience.fulfilled, (state, action) => {
        if (state.profile && state.profile.experiences) {
          state.profile.experiences.push(action.payload);
        }
      })
      .addCase(deleteExperience.fulfilled, (state, action) => {
        if (state.profile && state.profile.experiences) {
          state.profile.experiences = state.profile.experiences.filter(e => e.id !== action.payload);
        }
      })
      // Skills
      .addCase(addSkill.fulfilled, (state, action) => {
        if (state.profile && state.profile.skills) {
          state.profile.skills.push(action.payload);
        }
      })
      .addCase(removeSkill.fulfilled, (state, action) => {
        if (state.profile && state.profile.skills) {
          state.profile.skills = state.profile.skills.filter(s => s.skillId !== action.payload && s.id !== action.payload);
        }
      })
      // Certifications
      .addCase(addCertification.fulfilled, (state, action) => {
        if (state.profile && state.profile.certifications) {
          state.profile.certifications.push(action.payload);
        }
      })
      .addCase(deleteCertification.fulfilled, (state, action) => {
        if (state.profile && state.profile.certifications) {
          state.profile.certifications = state.profile.certifications.filter(c => c.id !== action.payload);
        }
      })
      // Resume
      .addCase(updateResume.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.resumeUrl = action.payload?.resumeUrl || action.payload;
        }
      })
      .addCase(deleteResume.fulfilled, (state) => {
        if (state.profile) {
          state.profile.resumeUrl = null;
        }
      })
      // Applications
      .addCase(fetchCandidateApplications.fulfilled, (state, action) => {
        state.applications = action.payload;
      })
      // Saved Jobs
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.savedJobs = action.payload;
      })
      .addCase(toggleSaveJob.fulfilled, (state, action) => {
        const { jobId, saved } = action.payload;
        if (!saved) {
          state.savedJobs = state.savedJobs.filter(item => (item.jobId || item.job?.id || item.id) !== jobId);
        }
      })
      // Interviews
      .addCase(fetchCandidateInterviews.fulfilled, (state, action) => {
        state.interviews = action.payload;
      })
      // Settings
      .addCase(fetchCandidateSettings.fulfilled, (state, action) => {
        state.settings = action.payload?.data || action.payload;
      })
      .addCase(updateCandidateSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
      });
  },
});

export const { clearCandidateState } = candidateSlice.actions;
export default candidateSlice.reducer;
