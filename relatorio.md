<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 8 créditos restantes para usar o sistema de feedback AI.

# Feedback para lucasgfoli:

Nota final: **27.5/100**

Olá, lucasgfoli! 🎉 Primeiro, parabéns pelo esforço e pela entrega do projeto! Você já implementou várias funcionalidades importantes, como autenticação com JWT, hash de senha com bcrypt, proteção de rotas com middleware, e a estrutura geral está bem organizada. Também é ótimo ver que os testes básicos de criação, login, logout e exclusão de usuário passaram, assim como a proteção das rotas de agentes e casos. Isso mostra que você entendeu bem os conceitos fundamentais de autenticação e segurança em APIs REST. 👏

---

### 🚀 Pontos Bônus que você conquistou:

- Implementação correta do logout com blacklist de tokens (`revokedTokens`).
- Proteção das rotas `/agentes` e `/casos` com middleware JWT.
- Uso consistente do Knex para queries.
- Validação de senha com regex no `authController`.
- Documentação inicial no `INSTRUCTIONS.md` explicando o fluxo de autenticação.
- Uso do dotenv para variáveis de ambiente, incluindo `JWT_SECRET` e `SALT_ROUNDS`.

---

### ⚠️ Agora, vamos analisar os testes que falharam e entender o que está acontecendo para que você possa corrigir e melhorar seu projeto, ok?

---

# Análise dos testes que falharam e causas raiz

### 1. Falhas em validação no cadastro de usuários (muitos erros 400)

Testes que falharam:

- Usuário com nome vazio/nulo
- Usuário com email vazio/nulo
- Usuário com senha inválida (curta, sem números, sem caractere especial, sem maiúscula, etc)
- Usuário com campo extra no payload
- Usuário com campo faltante
- Usuário com email já em uso

---

**Por que isso está acontecendo?**

No seu `authController.js`, você fez uma validação bem detalhada, mas a ordem e a lógica podem estar causando problemas:

```js
const allowedFields = ['nome', 'email', 'senha']
const receivedFields = Object.keys(req.body)
const extraFields = receivedFields.filter(field => !allowedFields.includes(field))
const missingFields = allowedFields.filter(field => !receivedFields.includes(field))

if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })
}

if (missingFields.length > 0) {
    const errors = {}
    missingFields.forEach(field => {
        errors[field] = `${field} é obrigatório`
    })
    return res.status(400).json({ errors })
}

if (extraFields.length > 0) {
    const errors = {}
    extraFields.forEach(field => {
        errors[field] = `${field} não é permitido`
    })
    return res.status(400).json({ errors })
}
```

- Você valida o `nome` antes de validar os campos faltantes. Isso pode fazer com que o teste que envia um nome nulo ou vazio seja interpretado de forma incorreta.
- A validação de campos faltantes ocorre **depois** da validação de `nome`, mas idealmente deveria ser a primeira, para garantir que todos os campos obrigatórios estejam presentes antes de validar seus valores.
- A validação de campos extras também vem depois, mas o teste espera que o erro de campo extra seja retornado corretamente.
- Além disso, a validação do `nome` está misturada com a validação de campos faltantes, o que pode causar confusão.

---

**Como melhorar?**

Sugiro reorganizar a validação para seguir esta ordem:

1. Verificar se todos os campos obrigatórios estão presentes (missingFields).
2. Verificar se existem campos extras (extraFields).
3. Validar o conteúdo de cada campo (nome, email, senha).

Exemplo de reestruturação:

```js
const allowedFields = ['nome', 'email', 'senha']
const receivedFields = Object.keys(req.body)
const missingFields = allowedFields.filter(field => !receivedFields.includes(field))
const extraFields = receivedFields.filter(field => !allowedFields.includes(field))

if (missingFields.length > 0) {
    const errors = {}
    missingFields.forEach(field => {
        errors[field] = `${field} é obrigatório`
    })
    return res.status(400).json({ errors })
}

if (extraFields.length > 0) {
    const errors = {}
    extraFields.forEach(field => {
        errors[field] = `${field} não é permitido`
    })
    return res.status(400).json({ errors })
}

if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!email || typeof email !== 'string' || !emailRegex.test(email))
    return res.status(400).json({ errors: { email: 'Email inválido ou ausente' } })

if (!senha || !validarSenha(senha))
    return res.status(400).json({ errors: { senha: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' } })
```

---

### 2. Retorno do token JWT no login com chave errada no JSON

No seu `authController.js`, no método `login`, você envia o token assim:

```js
res.status(200).json({ access_token: token })
```

Mas no seu `INSTRUCTIONS.md`, o exemplo do retorno do login é:

```json
{
  "acess_token": "<token JWT aqui>"
}
```

Note que o teste espera a chave `"acess_token"` (sem o segundo "c") e você está enviando `"access_token"` (com dois "c").

Isso causa falha no teste que verifica o formato do token retornado.

---

**Como corrigir?**

Alinhe o nome da chave para `"acess_token"` para que o teste passe:

```js
res.status(200).json({ acess_token: token })
```

---

### 3. Problemas no array `revokedTokens` usado para logout

Você está usando um array simples `revokedTokens` para armazenar tokens inválidos:

```js
const revokedTokens = []

const logout = (req, res) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        revokedTokens.push(token)
    }
    res.status(200).json({ message: 'Logout realizado com sucesso.' })
}
```

Embora funcione para o escopo de um processo em execução, isso não é persistente e pode causar problemas se o servidor reiniciar. Além disso, você não está validando se o token já foi revogado antes, o que pode gerar inconsistências.

---

**Sugestão:**

- Para projetos pequenos e testes, o array pode ser suficiente, mas para produção, o ideal é usar uma blacklist persistente (ex: Redis).
- Também garanta que o middleware verifique corretamente se o token está revogado (você já faz isso).
- Se quiser mais segurança, considere implementar refresh tokens e expiração automática.

---

### 4. Falha na validação dos campos extras e faltantes no cadastro

No seu `signUp`, você verifica campos extras e faltantes, mas o teste espera que o erro retorne um objeto `errors` com as chaves correspondentes a cada campo inválido. Certifique-se que seu JSON de erro está exatamente nesse formato, para que o teste reconheça.

---

### 5. Estrutura de diretórios e arquivos

Sua estrutura está praticamente correta e segue o esperado, parabéns! 👏

Só uma observação: você tem um arquivo `userRoutes.js` e uma pasta `controllers/userController.js`, que não estavam especificados no enunciado. Isso não é um erro, mas atenção para manter o padrão dos nomes no plural e consistência.

---

### 6. Outras observações

- No seu `authController.js`, o método `login` retorna `404` quando o usuário não é encontrado. O enunciado pede para retornar `400` quando o email já está em uso na criação, mas no login o que você fez está correto (404 para usuário não encontrado).
- No seu `INSTRUCTIONS.md`, o exemplo do token JWT tem a chave `"acess_token"`, mas no código está `"access_token"`. Alinhe para evitar confusão.
- Sua validação da senha está excelente com regex, parabéns! 🎯
- Seu middleware de autenticação está muito bom, tratando token mal formatado, token inválido e token expirado.

---

### 📚 Recursos recomendados para você:

- Para entender melhor a validação de campos e organização de erros:  
  https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s (Arquitetura MVC e boas práticas)

- Para aprofundar em autenticação JWT e bcrypt:  
  https://www.youtube.com/watch?v=Q4LQOfYwujk (Conceitos básicos de cibersegurança)  
  https://www.youtube.com/watch?v=keS0JWOypIU (JWT na prática)  
  https://www.youtube.com/watch?v=L04Ln97AwoY (JWT e bcrypt juntos)

- Para configurar corretamente o ambiente com Docker e Knex:  
  https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s (Docker + PostgreSQL + Node.js)  
  https://www.youtube.com/watch?v=dXWy_aGCW1E (Knex migrations)

---

# 📋 Resumo rápido dos principais pontos para focar:

- **Reorganizar a validação no cadastro de usuários** para verificar campos faltantes e extras antes de validar valores individuais.
- **Corrigir a chave do token JWT retornado no login** para `"acess_token"` conforme esperado.
- Garantir que o JSON de erros esteja no formato correto com o objeto `errors` e chaves específicas para cada campo.
- Rever o uso do array `revokedTokens` para logout, considerando persistência e segurança.
- Manter consistência na nomenclatura dos arquivos e rotas (ex: `userRoutes.js` vs `usuariosRoutes.js`).
- Conferir se o `.env` está corretamente configurado com `JWT_SECRET` e `SALT_ROUNDS`.
- Continuar usando o middleware para proteger rotas e validar tokens.

---

lucasgfoli, seu projeto está no caminho certo e com ajustes na validação e no retorno do token, você vai destravar muitos testes! 🚀 Continue assim, revisando cada detalhe com calma. Segurança é um tema delicado, e você já está mostrando domínio sobre ele.

Se precisar, volte nos vídeos que recomendei e tente aplicar as mudanças sugeridas. Estou aqui para te ajudar! 💪

Boa codificação e até a próxima! 👋😊

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>