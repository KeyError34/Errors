const form = document.querySelector('.loginForm');
const userName = document.querySelector('.name');
const password = document.querySelector('.password');
const message = document.querySelector('.message');
const url = 'http://localhost:3333';
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const valueName = userName.value;
  const valuePass = password.value;
  const response = await fetch(`${url}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username: valueName, password: valuePass }),
  });
  if (response.status === 200) {
    const data = await response.json();
    localStorage.setItem('authToken', data.token);
    message.innerHTML = 'Login successful!';
  } else {
    message.innerHTML = 'Login failed. Unauthorized!';
  }
});
