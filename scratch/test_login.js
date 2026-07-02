const data = new URLSearchParams();
data.append('email', 'webnazar@gmail.com');
data.append('password', 'Admin@2025#');
data.append('redirect', 'false');

fetch('http://localhost:3000/api/auth/callback/credentials', {
  method: 'POST',
  body: data,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
})
  .then(res => res.json().then(j => ({ status: res.status, ok: res.ok, json: j })))
  .then(console.log)
  .catch(console.error);
