const bcrypt = require('bcryptjs');

// Senha em texto plano
const senha = 'senha123';

// Número de rounds para gerar o salt
const saltRounds = 10;

// Criptografa a senha de forma síncrona
const senhaCriptografada = bcrypt.hashSync(senha, saltRounds);

// Exibe a senha criptografada no terminal
console.log('Senha criptografada:', senhaCriptografada);