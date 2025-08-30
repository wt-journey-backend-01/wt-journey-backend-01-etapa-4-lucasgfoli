<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para lucasgfoli:

Nota final: **27.5/100**

Olá, lucasgfoli! 🚀 Antes de mais nada, parabéns pelo esforço em construir uma API REST completa, segura e documentada! É um desafio grande, e você já avançou bastante, especialmente porque muitos testes importantes passaram, como a criação e login de usuários, proteção das rotas com JWT e manipulação correta dos agentes e casos. 🎉

Também quero destacar que você implementou corretamente o logout e a exclusão de usuários, além de garantir que as rotas de agentes e casos estão protegidas pelo middleware de autenticação. Isso é fundamental para a segurança da aplicação! Além disso, o uso do Knex para consultas e a organização do código em controllers, repositories e middlewares estão muito bem estruturados.

---

### 🚩 Agora vamos analisar juntos os pontos que precisam de atenção para destravar sua nota e fazer sua aplicação brilhar ainda mais! 💡

---

## 1. Problemas nos testes de validação do cadastro de usuários (erros 400)

Os testes que falharam indicam que o sistema não está validando corretamente os dados enviados no endpoint de registro (`POST /auth/register`). Vamos entender o que está acontecendo.

### O que os testes esperam?

- Retornar erro 400 se o nome for vazio ou nulo
- Retornar erro 400 se o email for vazio, nulo ou formato inválido
- Retornar erro 400 se a senha for inválida (curta demais, sem números, sem caracteres especiais, sem letras maiúsculas/minúsculas)
- Retornar erro 400 se algum campo extra for enviado
- Retornar erro 400 se algum campo obrigatório estiver faltando
- Retornar erro 400 se o email já estiver em uso

### O que seu código faz?

No seu `authController.js`, você tem uma validação inicial que checa campos faltantes e extras:

```js
const allowedFields = ['nome', 'email', 'senha']
const receivedFields = Object.keys(req.body)
const extraFields = receivedFields.filter(field => !allowedFields.includes(field))
const missingFields = allowedFields.filter(field => !receivedFields.includes(field))

if (missingFields.length > 0)
    return res.status(400).json({ message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` })

if (extraFields.length > 0)
    return res.status(400).json({ message: `Campos extras não permitidos: ${extraFields.join(', ')}` })
```

Além disso, você valida nome, email e senha separadamente, com mensagens específicas.

### Por que os testes estão falhando?

O problema principal está na forma como você está validando o nome e o email quando eles são vazios ou nulos. Por exemplo, você verifica:

```js
if (!nome || typeof nome !== 'string' || nome.trim() === '')
    return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })
```

Até aqui, parece correto. Mas os testes falhando indicam que talvez o campo `nome` não esteja chegando como esperado, ou que a validação não está cobrindo todos os casos.

Outro ponto que pode estar causando falha é o formato da resposta JSON. Os testes esperam erro 400 com mensagens específicas, e seu código às vezes retorna `{ message: ... }` e outras vezes `{ errors: { campo: mensagem } }`. Essa inconsistência pode causar falha nos testes.

Por exemplo, para campos faltantes e extras, você retorna:

```js
return res.status(400).json({ message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}` })
```

Mas para erros de validação específicos, você retorna:

```js
return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })
```

**Sugestão:** Padronize o formato da resposta de erros para usar sempre `{ errors: { campo: mensagem } }`. Isso deixa o API mais consistente e atende melhor os testes.

### Exemplo de ajuste para padronizar erros:

```js
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

Além disso, verifique se o middleware `express.json()` está ativo antes das rotas para garantir que o corpo da requisição seja parseado corretamente. No seu `server.js`, está correto:

```js
app.use(express.json())
```

### Sobre a validação da senha

Sua função `validarSenha` está ótima:

```js
function validarSenha(senha) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
    return regex.test(senha)
}
```

Mas os testes falham para senhas que não cumprem os requisitos. Isso indica que, talvez, você não esteja sempre retornando erro 400 com a mensagem correta para todos os casos de senha inválida.

**Dica:** Garanta que toda senha que não passar na validação retorne:

```js
return res.status(400).json({ errors: { senha: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' } })
```

---

## 2. Inconsistência no nome do campo do token JWT na resposta do login

No arquivo `authController.js`, no método `login`, você retorna o token assim:

```js
res.status(200).json({ acess_token: token })
```

Porém, no arquivo `INSTRUCTIONS.md`, o exemplo mostra o campo como `access_token` (com dois "c"):

```json
{
  "access_token": "<token JWT aqui>"
}
```

Essa diferença pode estar fazendo o teste falhar, porque o teste espera exatamente `access_token` e não `acess_token`.

### Correção:

No seu controller, altere para:

```js
res.status(200).json({ access_token: token })
```

---

## 3. Estrutura de Diretórios e Arquivos

A estrutura do seu projeto está muito próxima do esperado, mas notei que seu arquivo `usuariosRepository.js` está com indentação estranha e algumas funções estão com espaçamento diferente. Isso não causa erro funcional, mas vale manter o padrão para facilitar manutenção.

Também vi que você tem um arquivo `userRoutes.js` e `userController.js` (pela estrutura listada), mas no seu `server.js` você importa `userRoutes` e usa:

```js
app.use('/api/users', userRoutes)
```

Porém, no enunciado, essa rota não está mencionada como obrigatória. O correto seria criar a rota `/usuarios/me` para retornar dados do usuário autenticado (bônus). Se você implementou, ótimo! Se não, recomendo criar essa rota para ganhar pontos extras.

Além disso, no seu `server.js` tem um comentário:

```js
// app.use('') Criar a rota de perfil do usuario
```

Sugiro implementar essa rota, usando o middleware de autenticação para garantir que só o usuário logado acesse seus dados.

---

## 4. Middleware de Autenticação e Tokens Revogados

Seu middleware `authMiddleware.js` usa uma variável `revokedTokens` importada do `authController`:

```js
const { revokedTokens } = require('../controllers/authController')
```

Mas no código do `authController.js` que você enviou, não existe essa variável `revokedTokens` declarada ou exportada.

Isso pode causar erro em tempo de execução quando o middleware tentar acessar essa variável.

### Sugestão:

- Declare `revokedTokens` como um array no `authController.js`:

```js
const revokedTokens = []
module.exports = {
    login,
    signUp,
    logout,
    revokedTokens
}
```

- No método `logout`, adicione o token atual à lista para invalidá-lo:

```js
const logout = (req, res) => {
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(' ')[1]
        revokedTokens.push(token)
    }
    res.status(200).json({ message: 'Logout realizado com sucesso.' })
}
```

Isso garante que tokens inválidos sejam rejeitados pelo middleware.

---

## 5. Documentação (INSTRUCTIONS.md)

Notei que no seu arquivo `INSTRUCTIONS.md`, o exemplo de retorno do login está com o campo `acess_token` (sem o segundo "c"):

```json
{
  "acess_token": "<token JWT aqui>"
}
```

Como expliquei antes, isso deve ser corrigido para `access_token` para ficar consistente com o padrão e os testes.

Além disso, o arquivo poderia ser enriquecido com exemplos de uso do token no header `Authorization` e o fluxo de autenticação esperado, para facilitar o uso da API.

---

## 6. Outros pontos menores

- No seu `knexfile.js`, está tudo correto, mas certifique-se de que as variáveis de ambiente `POSTGRES_USER`, `POSTGRES_PASSWORD` e `POSTGRES_DB` estejam definidas no `.env` e no `docker-compose.yml`.

- Você tem duas dependências para bcrypt: `"bcrypt"` e `"bcryptjs"`. Isso não é necessário; escolha uma (recomendo `bcryptjs` para facilidade de instalação) e remova a outra para evitar conflitos.

- No seu `authController.js`, o uso de `bcryptjs` está correto, mas garanta que o número de salt rounds (`SALT_ROUNDS`) esteja definido no `.env`, ou use um valor padrão, como você fez.

---

## 📚 Recursos que recomendo para você:

- Para entender melhor autenticação e JWT, veja este vídeo, feito pelos meus criadores, que explica muito bem os conceitos básicos e fundamentais da cibersegurança: https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para entender o uso prático de JWT, recomendo este vídeo: https://www.youtube.com/watch?v=keS0JWOypIU

- Para aprofundar no uso de bcrypt e segurança de senhas: https://www.youtube.com/watch?v=L04Ln97AwoY

- Para garantir que sua estrutura de projeto esteja organizada e escalável, veja este vídeo sobre arquitetura MVC em Node.js: https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

---

## 🎯 Resumo rápido dos pontos para focar:

- Padronize as respostas de erro no endpoint de cadastro para sempre usar `{ errors: { campo: mensagem } }`.
- Corrija o nome do campo do token JWT retornado no login para `access_token`.
- Implemente a variável `revokedTokens` no `authController.js` e a lógica para invalidar tokens no logout.
- Revise e implemente a rota `/usuarios/me` para retornar dados do usuário autenticado (bônus importante).
- Remova dependências duplicadas do bcrypt para evitar conflitos.
- Verifique se o `.env` está configurado corretamente com as variáveis necessárias para JWT e banco.
- Ajuste o arquivo `INSTRUCTIONS.md` para refletir o nome correto do campo do token e exemplos claros de uso do token no header Authorization.

---

Você está no caminho certo, lucasgfoli! Com esses ajustes, sua API vai ficar muito mais robusta, segura e alinhada com as expectativas do desafio. Continue assim, estudando e aprimorando! 💪✨

Se precisar, volte aqui para tirar dúvidas e vamos juntos até o sucesso total! 🚀

Um abraço de Code Buddy! 🤖❤️

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>