
const welcomeEmail = (name) => {
  return `
  <div
    style="
      max-width:600px;
      margin:auto;
      border:1px solid #ddd;
      border-radius:10px;
      overflow:hidden;
      font-family:Arial,sans-serif;
      background:#ffffff;
    "
  >

    <!-- Header -->
    <div
      style="
      padding: 24px 20px;
      font-size: 34px;
      font-weight: 700;
      line-height: 1.2;
      "
    >
      <h1
        style="
          color:white;
          margin:0;
          font-size:34px;
        "
      >
        Ultra Smart Abacus
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:30px; color:#333;">

      <h2>Hello ${name}, 👋</h2>

      <p>
        Welcome to <b>Ultra Smart Abacus Management System</b>.
      </p>

      <p>
        Your account has been created successfully.
      </p>

      <p>
        You can now login and start using the system.
      </p>

      <br>

      <a
        href="http://localhost:3000/auth/login"
        style="
          background:#2563eb;
          color:white;
          padding:12px 25px;
          text-decoration:none;
          border-radius:6px;
          display:inline-block;
        "
      >
        Login Now
      </a>

      <br><br>

      <hr>

      <p>
        Regards,<br>
        <b>Ultra Smart Abacus Team</b>
      </p>

    </div>

  </div>
  `;
};

export default welcomeEmail;