document.getElementById('signupForm').addEventListener('submit', function(e) {
  e.preventDefault(); // stop form from submitting

  // grab form fields
  const username         = document.getElementById('username');
  const email            = document.getElementById('email');
  const password         = document.getElementById('password');
  const confirmPassword  = document.getElementById('confirmPassword');

  // grab error containers
  const usernameError    = document.getElementById('usernameError');
  const emailError       = document.getElementById('emailError');
  const passwordError    = document.getElementById('passwordError');
  const confirmError     = document.getElementById('confirmPasswordError');
  const successMessage   = document.getElementById('successMessage');

  // reset errors
  [usernameError, emailError, passwordError, confirmError].forEach(el => el.textContent = '');
  successMessage.textContent = '';

  let isValid = true;

  // Username: at least 3 characters, alphanumeric
  if (username.value.trim().length < 3) {
    usernameError.textContent = 'Username must be at least 3 characters.';
    isValid = false;
  } else if (!/^[a-zA-Z0-9]+$/.test(username.value)) {
    usernameError.textContent = 'Username may contain only letters and numbers.';
    isValid = false;
  }

  // Email: simple regex check
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    emailError.textContent = 'Please enter a valid email address.';
    isValid = false;
  }

  // Password: min 8 chars, must include uppercase, lowercase, number
  const pwd = password.value;
  if (pwd.length < 8) {
    passwordError.textContent = 'Password must be at least 8 characters.';
    isValid = false;
  } else if (!/[A-Z]/.test(pwd) || !/[a-z]/.test(pwd) || !/[0-9]/.test(pwd)) {
    passwordError.textContent = 'Password must include uppercase, lowercase, and a number.';
    isValid = false;
  }

  // Confirm Password: must match
  if (confirmPassword.value !== pwd) {
    confirmError.textContent = 'Passwords do not match.';
    isValid = false;
  }

  // If everything is valid, send registration to backend
  if (isValid) {
    fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: username.value.trim(),
        email: email.value.trim(),
        password: pwd
      })
    })
      .then(res => res.json().then(data => ({ status: res.status, body: data })))
      .then(({ status, body }) => {
        if (status >= 400) throw new Error(body.message || 'Registration failed');
        // Save token and user info so each user gets their own dashboard instance
        if (body.token) {
          localStorage.setItem('userToken', body.token);
        }
        if (body.user) {
          localStorage.setItem('userInfo', JSON.stringify(body.user));
        }
        window.location.href = 'dashboard.html';
      })
      .catch(err => {
        successMessage.textContent = err.message;
        successMessage.style.color = 'red';
      });
  }
});