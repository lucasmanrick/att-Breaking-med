let userData;

document.getElementById('sendForm').addEventListener('submit', (e) => {
  e.preventDefault();
})

document.getElementById('submitButton').addEventListener('click', async (e) => {
  console.log('clicou')
  const login = document.getElementById('login').value
  const senha = document.getElementById('senha').value

  console.log(login)
  console.log(senha)
  console.log(typeof(login), typeof(senha))

  fetch('/login', {
    method:'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login: login,
      senha: senha
    })
  })
    .then(response => response.json())
    .then(data => {
      console.log(data)
      userData = data
      window.location('/home')
    })
    .catch(error => {
      // Lidar com o erro
      console.error('Erro:', error);
    });
})
