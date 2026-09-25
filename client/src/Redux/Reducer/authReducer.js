import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api";

// ============================================================
// LOGIN
// ============================================================

export const loginUser = createAsyncThunk(
  "user/login",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", formData);

      const data = response.data;

      console.log("LOGIN RESPONSE:", data);

      // Save JWT
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("LOGIN TOKEN SAVED");
      }

      return data;
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// REGISTER
// ============================================================

export const Register = createAsyncThunk(
  "user/signup",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/signup",
        formData
      );

      const data = response.data;

      console.log("REGISTER RESPONSE:", data);

      // Save JWT
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("REGISTER TOKEN SAVED");
      }

      return data;
    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// GET USER
// ============================================================

export const getUser = createAsyncThunk(
  "user/get-user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/getuser");

      const data = response.data;

      console.log("GET USER RESPONSE:", data);

      return data;
    } catch (error) {
      console.error(
        "GET USER ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// GET ADMIN
// ============================================================

export const getadmin = createAsyncThunk(
  "user/adminget",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(
        "/admin/adminget"
      );

      const data = response.data;

      console.log("GET ADMIN RESPONSE:", data);

      return data;
    } catch (error) {
      console.error(
        "GET ADMIN ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// FORGOT PASSWORD
// ============================================================

export const ForgetPass = createAsyncThunk(
  "user/forget",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/forgotpassword",
        formData
      );

      const data = response.data;

      console.log(
        "FORGOT PASSWORD RESPONSE:",
        data
      );

      // If API returns a new JWT
      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );

        console.log(
          "FORGOT PASSWORD TOKEN SAVED"
        );
      }

      return data;
    } catch (error) {
      console.error(
        "FORGOT PASSWORD ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// SEND OTP
// ============================================================

export const SendOtp = createAsyncThunk(
  "user/sendotp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/sendotp",
        email
      );

      const data = response.data;

      return data;
    } catch (error) {
      console.error(
        "SEND OTP ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// UPDATE USER
// ============================================================

export const updateUser = createAsyncThunk(
  "user/update-user",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put(
        "/update-user",
        formData
      );

      const data = response.data;

      return data;
    } catch (error) {
      console.error(
        "UPDATE USER ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// LOGOUT
// ============================================================

export const Logout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/logout");

      const data = response.data;

      // Remove local JWT
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userToken");

      console.log("LOGOUT TOKEN REMOVED");

      return data;
    } catch (error) {
      // Remove local token even if backend logout fails
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userToken");

      console.error(
        "LOGOUT ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: "Something went wrong",
        }
      );
    }
  }
);

// ============================================================
// SUPPORT
// ============================================================

export const postSupport = createAsyncThunk(
  "support/postSupport",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post(
        "/support",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        "SUPPORT ERROR:",
        error.response?.data || error.message
      );

      return rejectWithValue(
        error.response?.data || {
          message: error.message,
        }
      );
    }
  }
);

// ============================================================
// INITIAL STATE
// ============================================================

const initialState = {
  user: null,
  userInfo: null,
  loading: false,
  error: null,
  singleadmin: null,
  useraddress: null,
  userDetail: null,
  admininfo: null,
  message: null,
  support: null,
};

// ============================================================
// SLICE
// ============================================================

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    clearUser: (state) => {
      state.user = null;
      state.userInfo = null;
      state.userDetail = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // ======================================================
      // LOGIN
      // ======================================================

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        loginUser.fulfilled,
        (state, action) => {
          state.loading = false;

          state.user =
            action.payload?.data || null;

          state.userInfo =
            action.payload?.data || null;

          state.message =
            action.payload?.message || null;

          console.log(
            "LOGIN USER:",
            state.userInfo
          );
        }
      )

      .addCase(
        loginUser.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ======================================================
      // REGISTER
      // ======================================================

      .addCase(Register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        Register.fulfilled,
        (state, action) => {
          state.loading = false;

          state.user =
            action.payload?.data || null;

          state.userInfo =
            action.payload?.data || null;

          state.message =
            action.payload?.message || null;

          console.log(
            "REGISTER USER:",
            state.userInfo
          );
        }
      )

      .addCase(
        Register.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ======================================================
      // GET USER
      // ======================================================

      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        getUser.fulfilled,
        (state, action) => {
          state.loading = false;

          state.userInfo =
            action.payload?.userInfo ||
            action.payload?.data ||
            null;

          state.user =
            action.payload?.userInfo ||
            action.payload?.data ||
            null;
        }
      )

      .addCase(
        getUser.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ======================================================
      // GET ADMIN
      // ======================================================

      .addCase(getadmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        getadmin.fulfilled,
        (state, action) => {
          state.loading = false;

          state.admininfo =
            action.payload?.data || null;
        }
      )

      .addCase(
        getadmin.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ======================================================
      // SUPPORT
      // ======================================================

      .addCase(postSupport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(
        postSupport.fulfilled,
        (state, action) => {
          state.loading = false;
          state.support = action.payload;
        }
      )

      .addCase(
        postSupport.rejected,
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      )

      // ======================================================
      // LOGOUT
      // ======================================================

      .addCase(
        Logout.fulfilled,
        (state) => {
          state.user = null;
          state.userInfo = null;
          state.userDetail = null;
          state.useraddress = null;
          state.message = null;
        }
      )

      .addCase(
        Logout.rejected,
        (state, action) => {
          state.user = null;
          state.userInfo = null;
          state.error = action.payload;
        }
      );
  },
});

// ============================================================
// EXPORT
// ============================================================

export const {
  clearError,
  clearUser,
} = userSlice.actions;

export default userSlice.reducer;
