// Welcome page authentication functionality

document.addEventListener('DOMContentLoaded', function() {
  // Tab switching functionality
  const tabButtons = document.querySelectorAll('.tab-btn');
  const loginContainer = document.getElementById('login-form-container');
  const signupContainer = document.getElementById('signup-form-container');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.getAttribute('data-tab');
      
      // Update active tab
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      
      // Show/hide forms
      if (tab === 'login') {
        loginContainer.classList.remove('hidden');
        signupContainer.classList.add('hidden');
      } else {
        loginContainer.classList.add('hidden');
        signupContainer.classList.remove('hidden');
      }
    });
  });

  // Login form handling
  const loginForm = document.getElementById('login-form');
  const loginBtn = document.getElementById('login-btn');
  const loginLoader = document.getElementById('login-loader');
  const loginErrorMsg = document.getElementById('login-error-msg');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    // Reset UI states
    loginErrorMsg.textContent = '';
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    loginBtn.textContent = 'Logging in...';
    loginLoader.style.display = 'block';

    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For now, just simulate success
      loginBtn.textContent = 'Success!';
      loginBtn.classList.remove('loading');
      loginBtn.classList.add('success');
      
      setTimeout(() => {
        // Replace with actual dashboard redirect
        alert('Login successful! Redirecting to dashboard...');
        // window.location.href = 'dashboard.html';
      }, 800);

    } catch (error) {
      loginErrorMsg.textContent = error.message || 'Login failed. Please try again.';
      loginBtn.disabled = false;
      loginBtn.classList.remove('loading', 'success');
      loginBtn.textContent = 'Log In';
    } finally {
      loginLoader.style.display = 'none';
    }
  });

  // Signup form handling
  const signupForm = document.getElementById('signup-form');
  const signupBtn = document.getElementById('signup-btn');
  const signupLoader = document.getElementById('signup-loader');
  const signupErrorMsg = document.getElementById('signup-error-msg');
  const signupSuccessMsg = document.getElementById('signup-success-msg');

  // Error elements
  const usernameError = document.getElementById('usernameError');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const confirmPasswordError = document.getElementById('confirmPasswordError');

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const username = document.getElementById('signup-username').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const role = document.getElementById('role').value;

    // Reset error messages
    [usernameError, emailError, passwordError, confirmPasswordError].forEach(el => {
      if (el) el.textContent = '';
    });
    signupErrorMsg.textContent = '';
    signupSuccessMsg.textContent = '';

    let isValid = true;

    // Validation
    if (username.length < 3) {
      usernameError.textContent = 'Username must be at least 3 characters.';
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s]+$/.test(username)) {
      usernameError.textContent = 'Username may contain only letters, numbers, and spaces.';
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      emailError.textContent = 'Please enter a valid email address.';
      isValid = false;
    }

    if (password.length < 8) {
      passwordError.textContent = 'Password must be at least 8 characters.';
      isValid = false;
    } else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      passwordError.textContent = 'Password must include uppercase, lowercase, and a number.';
      isValid = false;
    }

    if (confirmPassword !== password) {
      confirmPasswordError.textContent = 'Passwords do not match.';
      isValid = false;
    }

    if (!role) {
      signupErrorMsg.textContent = 'Please select your role.';
      isValid = false;
    }

    if (!isValid) return;

    // Show loading state
    signupBtn.disabled = true;
    signupBtn.classList.add('loading');
    signupBtn.textContent = 'Creating Account...';
    signupLoader.style.display = 'block';

    try {
      // Simulate API call - replace with actual backend call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate success
      signupBtn.textContent = 'Account Created!';
      signupBtn.classList.remove('loading');
      signupBtn.classList.add('success');
      signupSuccessMsg.textContent = 'Account created successfully! You can now log in.';
      
      // Reset form
      signupForm.reset();
      
      // Switch to login tab after delay
      setTimeout(() => {
        document.querySelector('[data-tab="login"]').click();
        signupBtn.disabled = false;
        signupBtn.classList.remove('success');
        signupBtn.textContent = 'Create Account';
        signupSuccessMsg.textContent = '';
      }, 2000);

    } catch (error) {
      signupErrorMsg.textContent = error.message || 'Registration failed. Please try again.';
      signupBtn.disabled = false;
      signupBtn.classList.remove('loading', 'success');
      signupBtn.textContent = 'Create Account';
    } finally {
      signupLoader.style.display = 'none';
    }
  });

  // Real-time validation for signup form
  const signupUsername = document.getElementById('signup-username');
  const signupEmail = document.getElementById('signup-email');
  const signupPassword = document.getElementById('signup-password');
  const signupConfirmPassword = document.getElementById('signup-confirm-password');

  if (signupUsername) {
    signupUsername.addEventListener('blur', () => {
      const value = signupUsername.value.trim();
      if (value && value.length < 3) {
        usernameError.textContent = 'Username must be at least 3 characters.';
      } else if (value && !/^[a-zA-Z0-9\s]+$/.test(value)) {
        usernameError.textContent = 'Username may contain only letters, numbers, and spaces.';
      } else {
        usernameError.textContent = '';
      }
    });
  }

  if (signupEmail) {
    signupEmail.addEventListener('blur', () => {
      const value = signupEmail.value.trim();
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailPattern.test(value)) {
        emailError.textContent = 'Please enter a valid email address.';
      } else {
        emailError.textContent = '';
      }
    });
  }

  if (signupPassword) {
    signupPassword.addEventListener('blur', () => {
      const value = signupPassword.value;
      if (value && value.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters.';
      } else if (value && (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value))) {
        passwordError.textContent = 'Password must include uppercase, lowercase, and a number.';
      } else {
        passwordError.textContent = '';
      }
    });
  }

  if (signupConfirmPassword) {
    signupConfirmPassword.addEventListener('blur', () => {
      const password = signupPassword.value;
      const confirmPassword = signupConfirmPassword.value;
      if (confirmPassword && confirmPassword !== password) {
        confirmPasswordError.textContent = 'Passwords do not match.';
      } else {
        confirmPasswordError.textContent = '';
      }
    });
  }
});