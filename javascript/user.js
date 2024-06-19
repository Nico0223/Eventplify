$(document).ready(function() {
  // User registration logic
  $('#signup_form').on('submit', function(event) {
    event.preventDefault();
    
    // Fetch input values
    const username = $('#signup_username').val();
    const password = $('#signup_password').val();
    const confirmPassword = $('#confirmpassword').val();
    const email = $('#signup_email').val();

    // Validate inputs
    if (!username || !password || !confirmPassword || !email) {
      alert('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    // If all validations pass, proceed with registration
    fetch('/api/users/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username, password }),
    })
      .then(response => {
        if (response.ok) {
          alert('Registration successful');
          window.location.href = '../public/login.html'; // Redirect to login.html on success
        } else {
          response.json().then(data => {
            alert(data.error);
          });
        }
      })
      .catch(error => {
        console.error('Error during registration:', error);
        alert('An error occurred during registration');
      });
  });

  // User login logic
  $('#login_form').on('submit', function (event) {
    event.preventDefault();
    const email = $('#email').val(); // Assuming your input id is 'email'
    const password = $('#password').val(); // Assuming your input id is 'password'
  
    // Validate inputs
    if (!email || !password) {
      alert('Email and password are required');
      return;
    }
  
    // Send a POST request to the server for login
    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    .then(response => {
      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Invalid email or password');
        }
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      alert('Login successful');
      window.location.href = '../public/home.html'; // Redirect to home.html on successful login
    })
    .catch(error => {
      console.error('Error during login:', error.message);
      alert(error.message); // Alert the user with the error message
    });
  });

});
