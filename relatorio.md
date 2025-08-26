<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 5 créditos restantes para usar o sistema de feedback AI.

# Feedback para lucasgfoli:

Nota final: **27.5/100**

# Feedback para lucasgfoli 🚀

Olá, Lucas! Primeiramente, parabéns por toda a dedicação que você colocou nesse projeto! 🎉 Você conseguiu implementar várias funcionalidades importantes, como a estruturação das rotas, controllers e repositórios, além de garantir a autenticação via JWT e o uso de bcrypt para hashing de senhas. Também é ótimo ver que você aplicou o middleware de autenticação nas rotas protegidas e documentou os endpoints no **INSTRUCTIONS.md**. Isso mostra que você está caminhando para um nível profissional no desenvolvimento de APIs seguras com Node.js e PostgreSQL.

---

## 🎯 Pontos Positivos e Conquistas Bônus

- Seu projeto está bem organizado, seguindo a arquitetura MVC com pastas separadas para controllers, repositories, middlewares, routes e utils.
- O middleware de autenticação está implementado e aplicado corretamente nas rotas sensíveis (`/agentes` e `/casos`).
- O uso do bcryptjs para hashing da senha e jwt para geração de tokens está correto.
- Você implementou o logout com blacklist de tokens, o que é um ótimo passo para segurança.
- Os endpoints básicos para agentes e casos funcionam com validações e tratamento de erros.
- Você passou nos testes básicos de criação, login, logout e deleção de usuários, além de proteção das rotas com JWT.
- Implementou o endpoint `/usuarios/me` (apesar de não termos o código aqui, ele foi testado e passou).
- Documentou os endpoints e o fluxo de autenticação no `INSTRUCTIONS.md`.

---

## ⚠️ Análise dos Testes que Falharam e Causas Raiz

### 1. Falhas nas validações de criação de usuários (diversos erros 400)

Testes que falharam incluem:

- Criar usuário com nome vazio ou nulo
- Criar usuário com email vazio ou nulo
- Criar usuário com senha vazia, curta, sem números, sem caracteres especiais, sem letras maiúsculas/minúsculas
- Criar usuário com campo extra ou faltante
- Criar usuário com email já em uso

**Causa raiz provável:**

No seu `authController.js`, o método `signUp` tem validações para nome, email e senha, e verifica campos extras:

```js
const allowedFields = ['nome', 'email', 'senha']
const receivedFields = Object.keys(req.body)
const extraFields = receivedFields.filter(field => !allowedFields.includes(field))

if ( extraFields.length > 0)
    return res.status(400).json({message: `Campos extras não permitidos: ${extraFields.join(', ')}`})

if (!nome || typeof nome !== 'string' || nome.trim() === '')
    return res.status(400).json({ message: 'O nome é obrigatório e não deve ser uma string vazia' })

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

if (!email || !emailRegex.test(email))
    return res.status(400).json({ message: 'Email inválido ou ausente' })

if (!senha || !validarSenha(senha))
    return res.status(400).json({ message: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' })
```

À primeira vista, as validações parecem corretas. Porém, os testes falham em casos de senha inválida (sem número, sem caractere especial, etc). Isso indica que o problema está provavelmente na função `validarSenha` (que está em `utils/validarSenha.js`), que você não enviou para revisão. 

**Possível motivo:**  
- A função `validarSenha` pode não estar cobrindo todos os requisitos corretamente (mínimo 8 caracteres, pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial).
- Ou a função pode estar retornando `true` mesmo para senhas inválidas, fazendo com que o fluxo aceite senhas que deveriam ser rejeitadas.

**Sugestão:**  
Revise a implementação da função `validarSenha` para garantir que ela faça a validação completa e rigorosa conforme o requisito. Um exemplo de regex que pode ser usado:

```js
function validarSenha(senha) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
  return regex.test(senha)
}
```

Essa regex garante:

- Pelo menos uma letra minúscula
- Pelo menos uma letra maiúscula
- Pelo menos um dígito
- Pelo menos um caractere especial (não alfanumérico)
- Mínimo 8 caracteres

---

### 2. Falha no retorno do token JWT no login — chave do objeto com nome errado

No seu `authController.js` no método `login`, você gera o token e retorna:

```js
res.status(200).json({ access_token: token })
```

Porém, no enunciado do desafio e no `INSTRUCTIONS.md`, o token deve ser retornado com a chave **`acess_token`** (com "c" só):

```json
{
  "acess_token": "<token JWT aqui>"
}
```

Esse detalhe de nomenclatura é importante porque os testes esperam exatamente essa chave. A diferença entre `access_token` e `acess_token` (que parece ser um pequeno erro de digitação no requisito) está causando falha em alguns testes.

**Solução:**

Altere a linha para:

```js
res.status(200).json({ acess_token: token })
```

Assim, você garante que o teste reconheça o token retornado.

---

### 3. Falha no código de status e mensagens ao tentar criar usuário com campos faltantes

O teste espera erro 400 quando campos obrigatórios estão ausentes, mas seu código pode estar retornando status ou mensagens diferentes em alguns casos.

Por exemplo, no `signUp` você tem:

```js
if (!nome || typeof nome !== 'string' || nome.trim() === '')
    return res.status(400).json({ message: 'O nome é obrigatório e não deve ser uma string vazia' })
```

Isso está correto, mas o teste também espera erro 400 para campos nulos (ex: `nome: null`), o que é coberto por essa validação, então aqui está ok.

**Possível ponto de atenção:**  
- Se o objeto enviado tiver campos extras, você já trata isso.
- Se faltar algum campo (ex: não enviar `senha`), seu código não tem validação explícita para verificar se o campo está presente, apenas se ele é falsy. Isso pode ser suficiente, mas vale garantir que o corpo da requisição contenha os 3 campos obrigatórios.

---

### 4. Falha na exclusão de usuário — endpoint não presente?

O desafio pede a criação do endpoint `DELETE /users/:id` para exclusão de usuários, mas no seu código `authRoutes.js` e `server.js` não há essa rota registrada.

No seu `authRoutes.js`:

```js
router.post('/register', authController.signUp)
router.post('/login', authController.login)
```

Não há rota para `DELETE /users/:id`.

Isso pode estar causando falha no teste que verifica a exclusão correta de usuários.

**Solução:**

- Crie um novo arquivo de rotas para usuários (`usersRoutes.js`) ou adicione a rota de exclusão no `authRoutes.js`.
- Implemente o controller para deletar usuário, usando o `usuariosRepository.deleteById(id)`.
- Registre a rota no `server.js` para que funcione:

```js
const usersRoutes = require('./routes/usersRoutes.js')
app.use('/users', usersRoutes)
```

---

### 5. Falha no endpoint `/usuarios/me` (bonus)

Você passou no teste bonus do endpoint `/usuarios/me`, mas não enviou o código relacionado a ele para revisão. Certifique-se de que esse endpoint está protegido pelo middleware e retorna os dados do usuário autenticado corretamente.

---

### 6. Falha nos testes bônus de filtragem e ordenação

Os testes bônus que falharam estão relacionados a:

- Filtragem de casos por status, agente, keywords, ordenação
- Filtragem de agentes por data de incorporação com ordenação
- Mensagens de erro customizadas para argumentos inválidos

No seu código `casosController.js`, você está fazendo filtros na memória, após buscar todos os casos do banco:

```js
let casos = await casosRepository.findAll()

if (search) {
    const termo = search.toLowerCase()
    casos = casos.filter(caso =>
        caso.titulo.toLowerCase().includes(termo) ||
        caso.descricao.toLowerCase().includes(termo)
    )
}
// ...
```

O problema é que essa abordagem não é eficiente e pode não funcionar corretamente para paginação ou grandes volumes de dados.

**Causa raiz:**  
Os filtros e ordenações devem ser feitos diretamente na query do banco, usando os métodos do Knex, para que a filtragem seja feita no banco e não na memória.

**Exemplo de melhoria:**

No `casosRepository.js`, crie uma função que receba os filtros como parâmetros e construa a query:

```js
async function findFiltered({ status, agente_id, search, orderBy, order }) {
  const query = knex('casos')

  if (status) query.where('status', status)
  if (agente_id) query.where('agente_id', agente_id)
  if (search) {
    query.where(function() {
      this.where('titulo', 'ilike', `%${search}%`).orWhere('descricao', 'ilike', `%${search}%`)
    })
  }
  if (orderBy && ['titulo', 'status', 'agente_id'].includes(orderBy)) {
    query.orderBy(orderBy, order === 'desc' ? 'desc' : 'asc')
  }

  return await query.select('*')
}
```

E no controller, use essa função para buscar os casos já filtrados e ordenados.

---

### 7. Falha na validação do campo `agente_id` no filtro de casos

No seu `casosController.js`, no filtro por `agente_id`, você faz:

```js
if (agente_id) {
    const agenteExistente = await agentesRepository.findById(agente_id)
    if (!agenteExistente)
        return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." })

    casos = casos.filter(caso => caso.agente_id === agente_id)
}
```

O problema aqui é que `agente_id` vem como string (do query string), e `caso.agente_id` é número. A comparação `===` entre string e número sempre será falsa, causando filtro incorreto.

**Solução:**

Converta `agente_id` para número antes da comparação:

```js
const agenteIdNum = Number(agente_id)
if (isNaN(agenteIdNum)) {
  return res.status(400).json({ message: "agente_id inválido" })
}
const agenteExistente = await agentesRepository.findById(agenteIdNum)
if (!agenteExistente)
  return res.status(404).json({ message: "Agente não encontrado com o agente_id fornecido." })

casos = casos.filter(caso => caso.agente_id === agenteIdNum)
```

---

### 8. Falha na validação do ID nas rotas de agentes e casos

Alguns testes falharam por tentar buscar ou deletar recursos com ID inválido (ex: string em vez de número).

No seu `agentesController.js`, você valida o ID em `getAgenteById`:

```js
if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: 'ID inválido.' })
}
```

Mas essa validação não está presente em todos os métodos que recebem ID (ex: delete, update, patch). O mesmo vale para `casosController.js`.

**Solução:**

Centralize a validação de ID em um middleware ou faça a validação em todos os métodos que usam `req.params.id`. Isso evita erros e garante respostas consistentes.

---

### 9. Falha no middleware de autenticação ao retornar status 500 para token inválido

No seu `authMiddleware.js`, ao verificar o token, se o JWT for inválido, você retorna status 500:

```js
catch (error) {
    console.error('Erro ao verificar o token:', error.message)

    return res.status(500).json({message: 'Problema no servidor. Tente novamente mais tarde'})
}
```

Porém, o correto é retornar **401 Unauthorized** quando o token é inválido ou expirado, para indicar que o acesso foi negado.

**Solução:**

Altere para:

```js
catch (error) {
    console.error('Erro ao verificar o token:', error.message)

    return res.status(401).json({message: 'Token inválido ou expirado'})
}
```

---

## 📁 Estrutura de Diretórios

Sua estrutura está muito próxima do esperado, mas notei que você tem uma pasta `routes/profileRoutes.js` e `controllers/profileController.js`, que não foi mencionada no enunciado. Isso não é um problema, desde que não conflite com as rotas obrigatórias.

Porém, **não encontrei uma rota para exclusão de usuários (`DELETE /users/:id`)**, que é requisito obrigatório.

Além disso, o arquivo `.env` não foi enviado, mas você está usando variáveis de ambiente corretamente, o que é ótimo!

---

## Recomendações de Aprendizado 📚

- Sobre validação de senha e segurança:  
  [Esse vídeo, feito pelos meus criadores, fala muito bem sobre autenticação, hashing e segurança com bcrypt e JWT](https://www.youtube.com/watch?v=Q4LQOfYwujk)

- Para entender melhor o uso do JWT e seu tratamento de erros:  
  [Vídeo prático sobre JWT e tratamento de tokens](https://www.youtube.com/watch?v=keS0JWOypIU)

- Para melhorar a filtragem e ordenação diretamente no banco com Knex:  
  [Guia detalhado do Knex Query Builder](https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s)

- Para estruturar seu projeto com boas práticas MVC em Node.js:  
  [Arquitetura MVC para projetos Node.js](https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s)

- Para configurar seu banco PostgreSQL com Docker e Knex:  
  [Configuração de banco PostgreSQL com Docker e Knex](https://www.youtube.com/watch?v=uEABDBQV-Ek&t=1s)

---

## Resumo dos Principais Pontos para Melhorar

- 🔍 **Revisar e corrigir a função de validação de senha (`validarSenha`) para garantir que todas as regras sejam aplicadas corretamente.**
- 🔑 **Corrigir a chave do token JWT retornado no login para `acess_token` conforme esperado pelos testes.**
- 🚫 **Implementar o endpoint obrigatório `DELETE /users/:id` para exclusão de usuários, com proteção via JWT.**
- 🔄 **Refatorar a filtragem e ordenação dos casos para serem feitas diretamente nas queries do banco usando Knex, não na memória.**
- 🔢 **Garantir que IDs recebidos via parâmetros sejam validados e convertidos para número para evitar erros em filtros e buscas.**
- ⚠️ **Alterar o middleware de autenticação para retornar status 401 ao invés de 500 quando o token JWT for inválido ou expirado.**
- 🛠️ **Adicionar validação consistente dos parâmetros `id` em todas as rotas que recebem esse parâmetro (PUT, PATCH, DELETE).**

---

Lucas, você está no caminho certo! 🚀 Corrigindo esses pontos, sua API ficará muito mais robusta, segura e alinhada com as melhores práticas do mercado. Continue focado e não hesite em buscar os recursos indicados para aprofundar seu conhecimento. Estou aqui para ajudar no que precisar! 👊

Bora codar e evoluir sempre! 💪✨

Abraços virtuais,  
Seu Code Buddy 🤖💙

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>