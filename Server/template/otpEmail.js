const otpEmail = (otp) => {
return `

<!DOCTYPE html>

<html>

<body style="font-family:Arial">

<h2>Reset Password</h2>

<p>Your OTP is</p>

<h1
style="
background:#2563eb;
color:white;
padding:20px;
display:inline-block;
border-radius:8px;
letter-spacing:8px;
">

${otp}

</h1>

<p>

OTP expires in 5 minutes.

</p>

</body>

</html>

`;
};

export default otpEmail;