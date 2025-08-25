<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 9 créditos restantes para usar o sistema de feedback AI.

# Feedback para lucasgfoli:

Nota final: **14.0/100**

Olá, lucasgfoli! 👋🚀

Primeiramente, parabéns pelo esforço e por já ter avançado bastante nesse desafio complexo de segurança, autenticação e autorização com Node.js, Express e PostgreSQL! 🎉 Você conseguiu implementar funcionalidades importantes como o cadastro de usuários, login com JWT e até a criação das tabelas no banco. Além disso, vi que você já tem endpoints para agentes e casos funcionando com boas validações, o que é excelente!

---

## O que você já mandou muito bem! 👏

- **Cadastro e listagem de usuários:** Seu `authController.js` já tem a função `createUser` que valida senha e cria o usuário no banco, e o `getAllUsers` que lista os usuários.  
- **Organização de controllers e repositories:** Você está usando a arquitetura MVC, separando bem as responsabilidades, isso é fundamental para um projeto escalável.  
- **Migrations e seeds:** As migrations para criar as tabelas `usuarios`, `agentes` e `casos` estão presentes e bem estruturadas, assim como os seeds para popular agentes e casos.  
- **Validação de dados:** Nos controllers de agentes e casos, você fez validações detalhadas para garantir que os dados enviados são válidos, isso é ótimo para manter a integridade.  
- **Alguns testes de segurança e autenticação passaram:** Você conseguiu implementar o login com JWT e o logout, e a criação do usuário retorna o status correto 201 com os dados do usuário.

---

## Pontos que precisam da sua atenção para avançar ainda mais 🚨

### 1. Estrutura dos diretórios e nomes dos arquivos

Eu percebi que você tem alguns arquivos e rotas com nomes diferentes do que o desafio exige, por exemplo:

- No seu projeto, o arquivo de rotas dos agentes está nomeado como `agentesRouter.js`, mas o esperado é `agentesRoutes.js` (com "Routes" no plural). O mesmo vale para `casosRouter.js` que deveria ser `casosRoutes.js`.

- Além disso, o middleware de autenticação `authMiddleware.js` não está presente no seu repositório, mas é obrigatório para proteger as rotas.

Essa diferença pode causar problemas na hora de importar e usar os arquivos, e também não segue o padrão esperado, o que pode gerar erros na integração dos módulos.

**Correção sugerida:**

Renomeie os arquivos para os nomes corretos, por exemplo:

```bash
routes/agentesRouter.js   --> routes/agentesRoutes.js
routes/casosRouter.js     --> routes/casosRoutes.js
```

E crie o middleware `middlewares/authMiddleware.js` para validar o JWT e proteger as rotas:

```js
// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' })

  const token = authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Token mal formatado' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' })
  }
}

module.exports = authMiddleware
```

Depois, aplique esse middleware nas rotas de agentes e casos para garantir a proteção.

---

### 2. Falha na validação dos campos no cadastro de usuários

No seu `authController.js`, você faz uma validação básica para verificar se `nome`, `email` e `senha` existem, mas não está validando se esses campos são strings não vazias, nem se há campos extras no corpo da requisição.

Por exemplo, o código atual:

```js
if( !nome || !email || !senha)
    return res.status(400).json({message: 'Todos os campos são obrigatórios!'})
```

Isso não impede que o usuário envie um `nome` vazio (`""`) ou um campo extra como `idade`, que não deveria estar ali.

Além disso, você não está validando se o email já está em uso antes de criar o usuário, o que pode gerar duplicidade e erro no banco.

**Correção sugerida:**

- Valide se `nome`, `email` e `senha` são strings não vazias.
- Valide se não há campos extras no corpo da requisição.
- Verifique se o email já existe no banco antes de criar o usuário.

Exemplo para validação mais rigorosa:

```js
async function createUser(req, res) {
  try {
    const { nome, email, senha, ...extraFields } = req.body

    if (Object.keys(extraFields).length > 0) {
      return res.status(400).json({ message: 'Campos extras não são permitidos.' })
    }

    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      return res.status(400).json({ message: 'Nome é obrigatório e deve ser uma string não vazia.' })
    }

    if (!email || typeof email !== 'string' || email.trim() === '') {
      return res.status(400).json({ message: 'Email é obrigatório e deve ser uma string não vazia.' })
    }

    if (!senha || typeof senha !== 'string' || senha.trim() === '') {
      return res.status(400).json({ message: 'Senha é obrigatória e deve ser uma string não vazia.' })
    }

    if (!validarSenha(senha)) {
      return res.status(400).json({message: 'A senha deve conter no mínimo 8 caracteres, uma letra maiúscula e uma minúscula, um número e um caractere especial.'})
    }

    // Verificar se email já existe
    const usuarioExistente = await usuariosRepository.findByEmail(email)
    if (usuarioExistente) {
      return res.status(400).json({ message: 'Email já está em uso.' })
    }

    // Hash da senha deve ser feito aqui antes de salvar
    const bcrypt = require('bcrypt')
    const senhaHash = await bcrypt.hash(senha, 10)

    const newUser = { nome, email, senha: senhaHash }
    const userCreated = await usuariosRepository.create(newUser)

    return res.status(201).json(userCreated)

  } catch (error) {
    handlerError(res, error)
  }
}
```

E no `usuariosRepository.js`, crie a função `findByEmail` para buscar usuário por email:

```js
async function findByEmail(email) {
  return await knex('usuarios').where({ email }).first()
}
```

---

### 3. Erros no repositório de usuários (`usuariosRepository.js`)

Eu encontrei alguns problemas importantes que podem estar causando falhas:

- Na função `create`, você usa `caso` em vez de `usuario` ao inserir:

```js
async function create(usuario) {
  const [newId] = await knex('usuarios').insert(caso).returning('id')
  return findById(newId)
}
```

Aqui o parâmetro é `usuario`, mas está usando `caso`, que não existe no contexto. Isso vai gerar erro na hora de inserir.

- Na função `deleteById`, você verifica `if (!caso)` em vez de `if (!usuario)`:

```js
async function deleteById(id) {
  const usuario = await findById(id)

  if(!caso) return null

  await knex('usuarios').where({ id }).del()
  return true
}
```

O correto é verificar se o `usuario` existe, não `caso`.

**Correção sugerida:**

```js
async function create(usuario) {
  const [newId] = await knex('usuarios').insert(usuario).returning('id')
  return findById(newId)
}

async function deleteById(id) {
  const usuario = await findById(id)

  if (!usuario) return null

  await knex('usuarios').where({ id }).del()
  return true
}
```

Esses pequenos erros de nomenclatura quebram a funcionalidade do CRUD de usuários.

---

### 4. Rotas de autenticação (`authRoutes.js`) mal configuradas

No seu arquivo `routes/authRoutes.js`, você fez o seguinte:

```js
router.get('/', authController.getAllUsers)
router.get('/:id', authController)
router.post('/', authController)
router.put('/:id', authController)
router.patch('/:id', authController)
router.delete('/:id', authController)
```

Aqui, você está passando diretamente o objeto `authController` em várias rotas, sem indicar qual função do controller será chamada. Isso vai causar erros porque o Express espera uma função middleware, e não um objeto.

Além disso, as rotas de autenticação devem seguir o que foi pedido no desafio, como:

- `POST /auth/register` para criar usuário
- `POST /auth/login` para login
- `POST /auth/logout` para logout
- `DELETE /users/:id` para deletar usuário

**Correção sugerida:**

Configure as rotas assim:

```js
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')

router.post('/register', authController.createUser)
router.post('/login', authController.loginUser) // você precisa implementar essa função
router.post('/logout', authController.logoutUser) // você precisa implementar essa função
router.delete('/users/:id', authController.deleteUser) // você precisa implementar essa função

module.exports = router
```

Note que você precisa implementar as funções `loginUser`, `logoutUser` e `deleteUser` no `authController.js` para completar a autenticação.

---

### 5. Falta de hashing da senha no cadastro de usuário

No seu `authController.js`, ao criar o usuário, você está armazenando a senha diretamente, sem aplicar o hash com bcrypt, o que é um problema grave de segurança.

O correto é **sempre** hashear a senha antes de salvar no banco.

**Exemplo de como fazer:**

```js
const bcrypt = require('bcrypt')

async function createUser(req, res) {
  // ... validações ...

  const senhaHash = await bcrypt.hash(senha, 10) // 10 rounds de salt

  const newUser = { nome, email, senha: senhaHash }
  const userCreated = await usuariosRepository.create(newUser)

  // ... resposta ...
}
```

---

### 6. Falta do middleware de autenticação nas rotas de agentes e casos

Vi que no seu `server.js` você está importando as rotas de agentes e casos, mas não está aplicando nenhum middleware para proteger essas rotas com JWT.

Para garantir segurança, você precisa importar e usar seu `authMiddleware` nas rotas que exigem autenticação:

```js
const authMiddleware = require('./middlewares/authMiddleware')
app.use('/agentes', authMiddleware, agentesRoutes)
app.use('/casos', authMiddleware, casosRoutes)
```

Assim, qualquer requisição para `/agentes` ou `/casos` precisará de um token JWT válido no header `Authorization`.

---

### 7. Documentação incompleta no INSTRUCTIONS.md

Seu arquivo `INSTRUCTIONS.md` está bem focado na parte de banco e docker, mas não mostra como registrar usuários, fazer login, enviar token JWT no header e o fluxo esperado de autenticação.

A documentação é essencial para que outras pessoas consigam usar sua API corretamente.

**Sugestão:**

Inclua seções como:

```md
## Autenticação

### Registro de usuário

- Endpoint: `POST /auth/register`
- Corpo da requisição:
  ```json
  {
    "nome": "Seu Nome",
    "email": "email@example.com",
    "senha": "SenhaSegura123!"
  }
  ```
- Retorno: usuário criado com status 201

### Login

- Endpoint: `POST /auth/login`
- Corpo da requisição:
  ```json
  {
    "email": "email@example.com",
    "senha": "SenhaSegura123!"
  }
  ```
- Retorno:
  ```json
  {
    "acess_token": "<token JWT aqui>"
  }
  ```

### Uso do token JWT

- Enviar o token no header `Authorization` em todas as requisições protegidas:

```
Authorization: Bearer <token>
```

- O token expira após um tempo configurado para segurança.

```

---

## Recursos que recomendo para você aprofundar e resolver esses pontos:

- Para entender melhor como fazer hashing de senha e autenticação JWT, veja este vídeo, feito pelos meus criadores, que explica muito bem os conceitos básicos de segurança:  
🔗 https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para trabalhar especificamente com JWT na prática, recomendo este vídeo que mostra passo a passo:  
🔗 https://www.youtube.com/watch?v=keS0JWOypIU

- Para entender como usar bcrypt e JWT juntos, este vídeo é excelente:  
🔗 https://www.youtube.com/watch?v=L04Ln97AwoY

- Para organizar seu projeto e entender melhor a arquitetura MVC em Node.js, veja este vídeo:  
🔗 https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

- Se precisar reforçar a configuração do banco com Docker e Knex, estes vídeos são muito úteis:  
🔗 https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s  
🔗 https://www.youtube.com/watch?v=dXWy_aGCW1E  
🔗 https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s

---

## Resumo rápido para você focar:

- ⚠️ Renomear arquivos de rotas para seguir o padrão `agentesRoutes.js` e `casosRoutes.js`.  
- ⚠️ Criar e aplicar o middleware de autenticação JWT (`authMiddleware.js`) nas rotas protegidas.  
- ⚠️ Corrigir o arquivo `usuariosRepository.js`, principalmente o erro de variável errada no método `create` e `deleteById`.  
- ⚠️ Melhorar a validação no cadastro de usuário para impedir campos vazios, nulos e extras.  
- ⚠️ Adicionar verificação de email duplicado antes de criar usuário.  
- ⚠️ Aplicar hashing da senha com bcrypt antes de salvar no banco.  
- ⚠️ Corrigir as rotas de autenticação para usar os métodos corretos do controller e criar os métodos faltantes (`loginUser`, `logoutUser`, `deleteUser`).  
- ⚠️ Documentar no `INSTRUCTIONS.md` o fluxo completo de autenticação e uso do token JWT.

---

Você já está no caminho certo, lucasgfoli! 🚀 Com esses ajustes, seu projeto vai ficar muito mais seguro, robusto e alinhado com as boas práticas profissionais. Continue firme, revisando cada ponto com calma, e não hesite em buscar os vídeos recomendados para clarear as dúvidas.

Se precisar, estarei aqui para ajudar! 💪🌟

Um grande abraço e sucesso no seu código! 👨‍💻👩‍💻✨

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>