// const welcomeEmail = (name) => {
//   return `
//     <div style="
//       max-width:600px;
//       margin:auto;
//       font-family:Arial,sans-serif;
//       border:1px solid #e5e7eb;
//       border-radius:10px;
//       overflow:hidden;
//     ">

//       <div style="
//         background:#2563eb;
//         color:white;
//         padding:20px;
//         text-align:center;
//       ">
//         <h2>Ultra Smart Abacus</h2>
//       </div>

//       <div style="padding:30px;">

//         <h3>Hello ${name}, 👋</h3>

//         <p>
//           Welcome to <b>Ultra Smart Abacus Management System</b>.
//         </p>

//         <p>
//           Your account has been created successfully.
//         </p>

//         <p>
//           You can now log in and start using the system.
//         </p>

//         <br>

//         <p>
//           Thank you for joining us.
//         </p>

//         <hr>

//         <p style="color:gray;font-size:14px;">
//           Regards,<br>
//           Ultra Smart Abacus Team
//         </p>

//       </div>

//     </div>
//   `;
// };

// export default welcomeEmail;


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
        background:#2563eb;
        padding:25px;
        text-align:center;
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