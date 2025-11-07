function showRegister() {
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
}
function showLogin() {
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
}

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    username: form.username.value,
    password: form.password.value
  };

  const response = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    alert(result.message || result.msg || 'Erro no login');
    return;
  }

  // NO TEU BACKEND O CAMPO É "token"
  const token = result.token;
  if (!token) {
    alert('Token não recebido do servidor.');
    return;
  }

  localStorage.setItem('token', token);

  // redireciona para a página home (sem proteção JWT na rota /home)
  window.location.href = '/home';
});

// REGISTRO
document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;

  if (form.password.value !== form.confirm_password.value) {
    alert('As senhas não coincidem!');
    return;
  }

  const data = {
    username: form.username.value,
    password: form.password.value
  };

  const response = await fetch('/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();
  if (!response.ok) {
    alert(result.message || 'Erro no registo');
    return;
  }

  alert('Registo efetuado com sucesso! Faz login agora.');
  showLogin();
});
