function showForm(formType) {
    const buttons = document.getElementById('main-buttons');
    buttons.classList.add('hidden');
    // Garante que os botões fiquem escondidos antes da animação
    setTimeout(() => {
        buttons.style.display = 'none';
        document.getElementById(formType + '-form').classList.add('active');
    }, 500);
}

// ===== Fecha os Forms =====
function hideForm() {
    const activeForm = document.querySelector('.form-container.active');
    if (activeForm) {
        activeForm.classList.add('closing');
        setTimeout(() => {
            activeForm.classList.remove('active', 'closing');
            // Faz os botões voltarem a aparecer
            const buttons = document.getElementById('main-buttons');
            buttons.style.display = 'flex';
            // Força o reflow para ativar animação de fadeIn
            void buttons.offsetWidth;
            buttons.classList.remove('hidden');
        }, 600);
    }
}

function switchForm(formType) {
    const currentForm = document.querySelector('.form-container.active');
    if (currentForm) {
        currentForm.classList.add('slide-out-left');
        setTimeout(() => {
            currentForm.classList.remove('active', 'slide-out-left');
            const newForm = document.getElementById(formType + '-form');
            newForm.classList.add('slide-in-right');
            setTimeout(() => {
                newForm.classList.add('active');
                newForm.classList.remove('slide-in-right');
            }, 10);
        }, 500);
    }
}





// ===== Mostra Forms =====
function showRegister() {
    document.getElementById('main-buttons').classList.add('hidden');
    setTimeout(() => {
        const form = document.getElementById('register-form');
        form.classList.remove('hidden');
        form.classList.add('active');
    }, 400);
}

function showLogin() {
    document.getElementById('main-buttons').classList.add('hidden');
    setTimeout(() => {
        const form = document.getElementById('login-form');
        form.classList.remove('hidden');
        form.classList.add('active');
    }, 400);
}




// ===== LOGIN =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = { username: form.username.value, password: form.password.value };

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

    const token = result.token;
    if (!token) {
        alert('Token não recebido do servidor.');
        return;
    }

    localStorage.setItem('token', token);
    window.location.href = '/home';
});

// ===== REGISTRO =====
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;

    if (form.password.value !== form.confirm_password.value) {
        alert('As senhas não coincidem!');
        return;
    }

    const data = { username: form.username.value, password: form.password.value };

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
    hideForm();
    showLogin();
});
