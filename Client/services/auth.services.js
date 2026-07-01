const users = [
  { email: "admin@abacus.com", password: "password", role: "ADMIN", name: "Admin User" },
  { email: "franchise@abacus.com", password: "password", role: "FRANCHISE", name: "Franchise Manager" },
  { email: "teacher@abacus.com", password: "password", role: "TEACHER", name: "Teacher" },
  { email: "student@abacus.com", password: "password", role: "STUDENT", name: "Student" },
];

export async function login(email, password) {
  const normalizedEmail = (email || "").trim().toLowerCase();
  const profile = users.find(
    (user) => user.email === normalizedEmail && user.password === password
  );

  if (!profile) {
    throw new Error("Invalid credentials. Please try again.");
  }

  return profile;
}
