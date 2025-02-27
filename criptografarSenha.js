const bcrypt = require('bcryptjs');

// Senha em texto plano
const senha = 'Objetivo47!'

// Número de rounds para gerar o salt
const saltRounds = 10;

// Criptografa a senha de forma síncrona
const senhaCriptografada = bcrypt.hashSync(senha, saltRounds);

// Exibe a senha criptografada no terminal
console.log('Senha criptografada:', senhaCriptografada);