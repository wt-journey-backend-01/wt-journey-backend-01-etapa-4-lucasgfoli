<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 7 créditos restantes para usar o sistema de feedback AI.

# Feedback para lucasgfoli:

Nota final: **27.5/100**

Olá, lucasgfoli! Tudo bem? 😊

Primeiramente, parabéns pelo esforço e pelo que já conseguiu implementar! 🎉 Você conseguiu entregar várias funcionalidades importantes, como o cadastro, login, logout e exclusão de usuários, além da proteção das rotas de agentes e casos com JWT. Isso é um grande passo rumo a uma aplicação segura e profissional. Também vi que a estrutura do seu projeto está organizada, com controllers, repositories, middlewares e rotas bem divididos — isso é essencial para manter o código limpo e escalável. 👏

Além disso, você conseguiu fazer o logout invalidar o token, e o JWT que você gera tem a expiração configurada, o que é ótimo para segurança. Também aplicou o middleware de autenticação nas rotas sensíveis, garantindo que só usuários logados possam acessar agentes e casos, o que é fundamental.

---

### 🚨 Testes que Falharam e Análise Detalhada

Você teve uma série de falhas principalmente nos testes relacionados ao cadastro de usuários, que são essenciais para o funcionamento correto da autenticação. Vamos destrinchar os principais motivos e como corrigir:

---

#### 1. Usuário com campos inválidos ou faltantes no registro (nome, email, senha)

Os testes que falharam indicam que a API não está retornando erro 400 quando o nome, email ou senha estão vazios, nulos ou inválidos. Por exemplo:

- "USERS: Recebe erro 400 ao tentar criar um usuário com nome vazio"
- "USERS: Recebe erro 400 ao tentar criar um usuário com email vazio"
- "USERS: Recebe erro 400 ao tentar criar um usuário com senha curta demais"
- "USERS: Recebe erro 400 ao tentar criar um usuário com senha sem números"
- "USERS: Recebe erro 400 ao tentar criar um usuário com campo extra"
- "USERS: Recebe erro 400 ao tentar criar um usuário com campo faltante"

---

##### Por que isso está acontecendo?

No seu `authController.js`, você fez uma boa validação inicial para campos extras e faltantes, e também valida o formato do email e a senha com regex:

```js
const allowedFields = ['nome', 'email', 'senha']
const receivedFields = Object.keys(req.body)
const missingFields = allowedFields.filter(field => !receivedFields.includes(field))
const extraFields = receivedFields.filter(field => !allowedFields.includes(field))

if (missingFields.length > 0) {
    // retorna erro 400 com detalhes
}

if (extraFields.length > 0) {
    // retorna erro 400 com detalhes
}
```

E também:

```js
if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!email || typeof email !== 'string' || !emailRegex.test(email))
    return res.status(400).json({ errors: { email: 'Email inválido ou ausente' } })

if (!senha || !validarSenha(senha))
    return res.status(400).json({ errors: { senha: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' } })
```

**Porém, o problema está na função `validarSenha` e na forma como você trata os campos `null` ou `undefined`.**

- A função `validarSenha` está correta, mas você não está tratando casos onde `senha` é `null` explicitamente antes de chamar `validarSenha`. Se `senha` for `null`, o `validarSenha(null)` pode não se comportar como esperado.

- Além disso, o teste espera que, ao enviar um campo extra, o sistema retorne erro 400, mas você está verificando isso só depois de verificar campos faltantes. Se o corpo da requisição tiver campos extras e faltantes ao mesmo tempo, pode ser que seu código não esteja cobrindo todos os casos.

- Outro ponto importante é que o teste espera a chave do token no retorno do login ser `"access_token"`, mas no seu código está como `"acess_token"` (com "s" em vez de "ss"). Essa pequena diferença pode causar falha nos testes.

---

##### Como melhorar?

1. **Ajustar o nome da chave do token JWT no login** para `"access_token"` para seguir o padrão esperado:

```js
res.status(200).json({ access_token: token })
```

2. **Garantir que os campos `null` ou `undefined` sejam tratados antes das validações de tipo e regex.** Pode fazer assim:

```js
if (nome == null || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })
}

if (email == null || typeof email !== 'string' || !emailRegex.test(email)) {
    return res.status(400).json({ errors: { email: 'Email inválido ou ausente' } })
}

if (senha == null || typeof senha !== 'string' || !validarSenha(senha)) {
    return res.status(400).json({ errors: { senha: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' } })
}
```

3. **Separar a validação de campos extras e faltantes para garantir que ambos os erros sejam tratados, mesmo que ocorram juntos.**

4. **Adicionar testes manuais com Postman ou Insomnia** para enviar payloads com campos extras, faltantes, nulos e vazios para garantir que o servidor responda com status 400 e mensagens claras.

---

#### 2. Token JWT no login e logout

Você está usando o array `revokedTokens` para armazenar tokens inválidos no logout, o que é um método simples e funciona para sessões curtas. No entanto:

- Esse array é mantido em memória, então se o servidor reiniciar, os tokens "revogados" voltarão a ser válidos.

- Para um projeto real, o ideal é usar uma blacklist persistente (ex: banco de dados ou cache Redis).

Mas para o desafio, isso está ok.

---

#### 3. Estrutura de Diretórios

Sua estrutura está praticamente correta, mas notei que você tem um arquivo `userRoutes.js` e um controller `userController.js` que não estavam no escopo do desafio. Isso não é um erro, mas pode causar confusão ou pontos de manutenção desnecessários.

O importante é que os arquivos obrigatórios estejam presentes e corretamente nomeados:

- `routes/authRoutes.js`
- `controllers/authController.js`
- `repositories/usuariosRepository.js`
- `middlewares/authMiddleware.js`

Você tem todos esses, o que é ótimo!

---

#### 4. Testes Bônus que não passaram

Você não implementou o endpoint `/usuarios/me` para retornar os dados do usuário logado. Esse é um ótimo recurso para melhorar a experiência do usuário e é um bônus valioso.

---

### 👀 Pontos de atenção adicionais

- No seu arquivo `INSTRUCTIONS.md`, no exemplo de resposta do login, você colocou `"acess_token"` em vez de `"access_token"`. Essa inconsistência pode confundir quem consome a API e causar falhas nos testes automatizados.

- No seu `authController.js`, o logout não invalida o token de forma robusta, mas para o desafio está ok.

- No middleware de autenticação, você verifica se o token está na lista de revogados, o que é ótimo para segurança.

---

### 📚 Recursos que recomendo para você:

- Para entender melhor o uso e validação de JWT e bcrypt, recomendo fortemente este vídeo feito pelos meus criadores, que explica os fundamentos da autenticação:  
https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para compreender a manipulação e verificação de tokens JWT na prática, este vídeo é excelente:  
https://www.youtube.com/watch?v=keS0JWOypIU

- Se quiser revisar a organização do projeto com MVC e boas práticas, este vídeo é muito didático:  
https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

- Caso tenha dúvidas na configuração do banco com Docker e Knex, veja este tutorial:  
https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s

---

### 💡 Resumo rápido para você focar:

- Corrija o nome da chave do token JWT no login para `"access_token"`.
- Trate explicitamente casos de campos `null` ou `undefined` no cadastro de usuários.
- Garanta que os erros de campos extras e faltantes sejam tratados separadamente e retornem status 400 com mensagens claras.
- Teste manualmente os endpoints de registro com payloads inválidos (campos vazios, nulos, extras).
- Considere implementar o endpoint `/usuarios/me` para retornar dados do usuário autenticado (bônus).
- Mantenha seu `.env` com a variável `JWT_SECRET` e `SALT_ROUNDS` configuradas corretamente.
- Continue usando o middleware de autenticação para proteger as rotas sensíveis.

---

### 🌟 Para finalizar

Você está no caminho certo, lucasgfoli! Seu código já tem uma boa base para autenticação e segurança, e com esses ajustes vai ficar ainda mais robusto e alinhado com os requisitos. Não desanime com os testes falhados, pois eles são uma bússola que mostra exatamente onde melhorar. Continue praticando, testando e estudando os conceitos de segurança e boas práticas. Estou aqui torcendo pelo seu sucesso! 🚀

Se precisar de ajuda para entender algum ponto específico, só chamar! 😉

Um abraço e bons códigos! 👨‍💻👩‍💻

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>