function enterAsGuest() {
  localStorage.setItem('userMode', 'guest');
  localStorage.removeItem('email'); 
  localStorage.removeItem('password'); 
  window.location.href = 'dashboard.html';
}

function showAuthModal() {
  const authForm = document.getElementById('authForm');
  const email = localStorage.getItem('email');

  // Dynamically create and add the H2 header
  const welcomeHeader = document.createElement('h2');
  welcomeHeader.innerText = email ? `Welcome Back, ${email.split('@')[0]}!` : 'Sign In / Register';
  welcomeHeader.style.color = 'var(--accent-color)';
  welcomeHeader.style.marginBottom = '20px';
  welcomeHeader.style.fontSize = '2rem';
  
  // Remove existing header if present to avoid duplicates
  if (authForm.querySelector('h2')) {
    authForm.querySelector('h2').remove();
  }
  
  // Insert the new header before the prompt paragraph
  authForm.prepend(welcomeHeader);
  
  document.getElementById('authModalBg').style.display = 'flex';
  document.getElementById('emailInput').focus(); 
}

function closeAuthModal() {
  document.getElementById('authModalBg').style.display = 'none';
  document.getElementById('emailInput').value = '';
  document.getElementById('passwordInput').value = '';
}

function validateInputs() {
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();
    
    if (!email || !password) {
        alert("Please enter both an email address and a password.");
        return null;
    }
    if (!email.includes('@')) {
        alert("Please enter a valid email address.");
        return null;
    }
    if (password.length < 4) {
        alert("Password must be at least 4 characters long.");
        return null;
    }
    
    return { email, password };
}


function signIn() {
  const inputs = validateInputs();
  if (!inputs) return;
  
  // Simulation: Check credentials against what was previously stored
  const storedEmail = localStorage.getItem('email');
  const storedPassword = localStorage.getItem('password');

  if (storedEmail === inputs.email && storedPassword === inputs.password) {
     // Successful login
  } else if (storedEmail && storedEmail !== inputs.email) {
     alert("Error: Email not found. Please register.");
     return;
  } else if (storedPassword && storedPassword !== inputs.password) {
     alert("Error: Incorrect password.");
     return;
  }
  
  localStorage.setItem('userMode', 'logged-in');
  localStorage.setItem('email', inputs.email);
  localStorage.setItem('password', inputs.password); 
  
  closeAuthModal();
  window.location.href = 'dashboard.html';
}

function register() {
  const inputs = validateInputs();
  if (!inputs) return;
  
  alert(`Registration successful for ${inputs.email}! Proceeding to dashboard.`);
  
  // Simulate successful registration and immediate login
  localStorage.setItem('userMode', 'logged-in');
  localStorage.setItem('email', inputs.email);
  localStorage.setItem('password', inputs.password); 

  closeAuthModal();
  window.location.href = 'dashboard.html';
}

// Close modal on ESC key
window.addEventListener('keydown', e => {
  if (e.key === "Escape" && document.getElementById('authModalBg').style.display === 'flex') {
    closeAuthModal();
  }
});