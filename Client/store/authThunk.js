import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "./authSlice";

const users = [
  {
    email: "admin@abacus.com",
    password: "password",
    role: "ADMIN",
    name: "Admin User",
  },
  {
    email: "franchise@abacus.com",
    password: "password",
    role: "FRANCHISE",
    name: "Franchise Manager",
  },
  {
    email: "teacher@abacus.com",
    password: "password",
    role: "TEACHER",
    name: "Teacher",
  },
  {
    email: "student@abacus.com",
    password: "password",
    role: "STUDENT",
    name: "Student",
  },
];

export const loginUser = (email, password) => async (dispatch) => {
  dispatch(loginStart());

  try {
    const user = users.find(
      (u) =>
        u.email === email.trim().toLowerCase() &&
        u.password === password
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    dispatch(loginSuccess(user));

    return user;
  } catch (err) {
    dispatch(loginFailure(err.message));
    throw err;
  }
};