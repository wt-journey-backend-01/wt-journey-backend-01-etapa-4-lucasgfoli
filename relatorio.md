<sup>Esse é um feedback gerado por IA, ele pode conter erros.</sup>

Você tem 6 créditos restantes para usar o sistema de feedback AI.

# Feedback para lucasgfoli:

Nota final: **27.5/100**

Olá, lucasgfoli! 🚀 Que legal ver você avançando nesse desafio complexo de API REST com Node.js, Express e PostgreSQL! Parabéns pelo empenho e pela organização do seu projeto, que já está bem estruturado e com várias funcionalidades importantes implementadas. 🎉

---

### 🎉 Pontos Fortes e Conquistas Bônus

- Sua API já está protegendo rotas sensíveis com middleware JWT, o que é essencial para segurança.
- Você implementou o registro, login e logout com bcrypt e JWT, seguindo boas práticas.
- A estrutura do projeto está muito próxima do esperado, com controllers, repositories, middlewares e rotas separadas.
- Os testes de autenticação e proteção de rotas passaram, o que mostra que a base da segurança está funcionando.
- Você implementou filtros e ordenações nos endpoints de casos e agentes, e já tem documentação Swagger para os endpoints principais.
- Bônus: você já tem um endpoint `/api/usuarios/me` (vi no projeto) e a exclusão de usuários, que são funcionalidades extras que agregam muito.

Isso já é um baita avanço! 👏

---

### 🚩 Testes que Falharam e Onde Precisamos Dar um Upgrade

Vamos analisar os testes que falharam, que são principalmente relacionados à criação de usuários e validação da senha, além de alguns testes de filtragem e detalhes das rotas extras.

---

### 1. **Falhas nos testes de criação de usuário (registro):**

- Testes que falharam:  
  - Usuário com nome vazio ou nulo → erro 400 esperado  
  - Usuário com email vazio, nulo ou inválido → erro 400 esperado  
  - Senha inválida: curta, sem números, sem caractere especial, sem letras maiúsculas/minúsculas → erro 400 esperado  
  - Campo extra enviado → erro 400 esperado  
  - Campo obrigatório faltando → erro 400 esperado  
  - Email já em uso → erro 400 esperado

**Análise da causa raiz:**

No seu `authController.js`, a função `signUp` tem uma validação robusta que verifica campos obrigatórios, campos extras, formato do email e senha. Isso é ótimo! Porém, o problema está no formato da resposta quando a validação falha.

Por exemplo, você retorna erros assim:

```js
return res.status(400).json({ errors: { email: 'Usuário já existe' } })
```

Mas os testes do projeto esperam que o corpo de erro seja exatamente assim, com a chave `errors` contendo os campos e mensagens. Isso você fez corretamente.

No entanto, o que pode estar causando falha é que você está permitindo que campos com valor `null` ou strings vazias passem na validação de campos obrigatórios? Vamos ver um trecho:

```js
if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({ errors: { nome: 'O nome é obrigatório e não pode ser vazio' } })
}
```

Esse trecho está correto e cobre nome vazio e nulo.

Para email:

```js
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
if (!email || typeof email !== 'string' || !emailRegex.test(email))
    return res.status(400).json({ errors: { email: 'Email inválido ou ausente' } })
```

Também parece correto.

Para senha:

```js
if (!senha || !validarSenha(senha))
    return res.status(400).json({ errors: { senha: 'Senha inválida. Deve conter no mínimo 8 caracteres, com letras maiúsculas, minúsculas, números e caracteres especiais.' } })
```

A função `validarSenha` usa regex que exige esses critérios.

Então, aparentemente, a validação está correta.

**Mas um ponto importante:**

Você está validando se há campos extras com:

```js
const allowedFields = ['nome', 'email', 'senha']
const receivedFields = Object.keys(req.body)
const extraFields = receivedFields.filter(field => !allowedFields.includes(field))
if (extraFields.length > 0) {
    const errors = {}
    extraFields.forEach(field => {
        errors[field] = `${field} não é permitido`
    })
    return res.status(400).json({ errors })
}
```

Isso está ótimo!

**Onde pode estar o problema?**

- Talvez o teste esteja enviando o campo `senha` como `null` e seu código está aceitando porque `!senha` em JS considera `null` como falso, e deve entrar na validação. Então isso deve funcionar.

- Mas, olhando no `usuariosRepository.js`, o método `insertUser` está assim:

```js
async function insertUser(usuario) {
    const [inserted] = await knex('usuarios').insert(usuario).returning('id')
    return findUserById(inserted.id) 
}
```

Aqui há um problema: `inserted` é o valor retornado pelo `.returning('id')`, que normalmente é um número ou objeto com a propriedade `id`. Você acessa `inserted.id`, mas se `inserted` for um número, `inserted.id` será `undefined`, e `findUserById(undefined)` vai falhar.

Isso pode estar causando erros silenciosos na criação do usuário.

**Solução:**

Altere para:

```js
async function insertUser(usuario) {
    const [inserted] = await knex('usuarios').insert(usuario).returning('id')
    const id = typeof inserted === 'object' ? inserted.id : inserted
    return findUserById(id)
}
```

Assim você garante que o `id` é corretamente obtido.

---

### 2. **Falha na exclusão de rota duplicada no server.js**

No seu `server.js`, você tem:

```js
app.use('/api/usuarios', userRoutes)
app.use('/api/usuariosz', userRoutes)
```

A segunda rota `/api/usuariosz` parece um erro de digitação. Isso pode causar confusão em rotas e testes.

**Recomendo remover a linha:**

```js
app.use('/api/usuariosz', userRoutes)
```

---

### 3. **Middleware de autenticação e logout**

No seu `authController.js`, você tem um array `revokedTokens` para controlar tokens inválidos no logout:

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

E no middleware:

```js
if (revokedTokens.includes(token))
    return res.status(401).json({ message: 'Token inválido' })
```

Isso funciona para invalidar tokens, mas o array `revokedTokens` está apenas na memória da aplicação e será perdido se o servidor reiniciar. Para um sistema real, isso não é recomendado, mas para o desafio está ok.

**No entanto, note que o teste espera que o logout de um token já inválido retorne erro 400, mas seu logout sempre retorna 200, mesmo se o token estiver inválido.**

Seria interessante validar se o token já está revogado e, nesse caso, retornar 400.

---

### 4. **Testes de filtragem e busca nos casos e agentes**

Você tem vários testes bônus que falharam relacionados a filtros e buscas, por exemplo:

- Filtragem por status de caso  
- Busca de agente responsável pelo caso  
- Filtragem por data de incorporação com sorting

No seu `casosController.js`, o método `getAllCasos` implementa filtragem manualmente em memória:

```js
let casos = await casosRepository.findAll();

if (search) {
    // filtro manual
    casos = casos.filter(...)
}
...
```

Mas no `casosRepository.js` você tem um método `findFiltered` que já faz isso usando query Knex com `where` e `orderBy`.

Você não está usando esse método no controller! Isso faz com que a filtragem não seja feita no banco, mas sim na aplicação, o que pode causar problemas de performance e erros em testes que esperam a filtragem correta.

**Solução recomendada:**

No controller, use `findFiltered` passando os parâmetros do query:

```js
const casos = await casosRepository.findFiltered({ status, agente_id, search, orderBy, order });
```

E aí faça apenas o enriquecimento dos casos com o agente, se necessário.

---

### 5. **Repositório de usuários: indentação e consistência**

No seu `usuariosRepository.js`, a indentação está um pouco confusa no começo, não afeta a execução, mas para manter o padrão, organize assim:

```js
const knex = require('../db/db')

async function findByEmail(email) {
    return await knex('usuarios').where({ email }).first()
}

async function findUserById(id) {
    return await knex('usuarios').where({ id }).first()
}

async function insertUser(usuario) {
    const [inserted] = await knex('usuarios').insert(usuario).returning('id')
    const id = typeof inserted === 'object' ? inserted.id : inserted
    return findUserById(id)
}

// ... restante
```

---

### 6. **Estrutura de diretórios e arquivos**

Sua estrutura está muito próxima do esperado, mas note que no `project_structure.txt` aparece o arquivo `userController.js` e `userRoutes.js` que não foram enviados para análise. Isso é ok se você implementou exclusão de usuários e `/usuarios/me` nesse controller/rota.

Só fique atento para que o arquivo `authRoutes.js` esteja na pasta `routes/` e o `authController.js` em `controllers/`, assim como o middleware `authMiddleware.js` em `middlewares/`.

---

### Recomendações de aprendizado para você aprofundar:

- Para melhorar a parte de autenticação com JWT e bcrypt, recomendo fortemente este vídeo, feito pelos meus criadores, que fala muito bem sobre autenticação e segurança:  
https://www.youtube.com/watch?v=Q4LQOfYwujk

- Para entender melhor como usar JWT com Node.js e Express na prática, este vídeo é excelente:  
https://www.youtube.com/watch?v=keS0JWOypIU

- Para aprimorar o uso do Knex e fazer queries eficientes com filtros no banco, veja este guia detalhado do Knex Query Builder:  
https://www.youtube.com/watch?v=GLwHSs7t3Ns&t=4s

- Para organizar seu projeto com MVC e manter o código limpo e escalável:  
https://www.youtube.com/watch?v=bGN_xNc4A1k&t=3s

---

### Exemplos práticos para ajustes

**1. Corrigir `insertUser` no `usuariosRepository.js`:**

```js
async function insertUser(usuario) {
    const [inserted] = await knex('usuarios').insert(usuario).returning('id')
    const id = typeof inserted === 'object' ? inserted.id : inserted
    return findUserById(id)
}
```

**2. Usar filtragem no banco no `casosController.js`:**

```js
async function getAllCasos(req, res) {
    try {
        const { status, agente_id, search, orderBy, order } = req.query;

        // Usa o método do repositório que faz query no banco
        const casos = await casosRepository.findFiltered({ status, agente_id, search, orderBy, order });

        // Enriquecer com dados do agente se quiser
        const casosComAgente = await Promise.all(
            casos.map(async caso => ({
                ...caso,
                agente: await agentesRepository.findById(caso.agente_id)
            }))
        );

        res.status(200).json(casosComAgente);
    } catch (error) {
        handleError(res, 500, error.message)
    }
}
```

---

### Resumo rápido dos principais pontos para focar:

- Corrigir `insertUser` para acessar o `id` corretamente após insert no banco.  
- Remover rota duplicada `/api/usuariosz` do `server.js`.  
- No logout, validar se token já está revogado e retornar erro 400 se for o caso.  
- No controller de casos, usar método `findFiltered` para fazer filtros no banco, não em memória.  
- Ajustar indentação e organização dos arquivos para manter padrão.  
- Revisar testes de validação dos campos no registro para garantir que erros são retornados conforme esperado.  
- Continuar aprimorando a documentação e fluxos de autenticação no `INSTRUCTIONS.md`.

---

Você está no caminho certo, lucasgfoli! 💪 Com essas correções e ajustes, sua API vai ficar muito mais robusta, segura e alinhada com as melhores práticas. Continue firme, aprendendo e testando bastante. Se precisar, volte aos vídeos recomendados para reforçar conceitos, principalmente sobre autenticação e uso do Knex.

Qualquer dúvida, estou aqui para ajudar! 🚀✨

Boa codificação! 👨‍💻👩‍💻

---

Se quiser, posso te ajudar a montar os trechos corrigidos para facilitar a implementação! Quer?

> Caso queira tirar uma dúvida específica, entre em contato com o Chapter no nosso [discord](https://discord.gg/DryuHVnz).



---
<sup>Made By the Autograder Team.</sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Carvalho](https://github.com/ArthurCRodrigues)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Arthur Drumond](https://github.com/drumondpucminas)</sup></sup><br>&nbsp;&nbsp;&nbsp;&nbsp;<sup><sup>- [Gabriel Resende](https://github.com/gnvr29)</sup></sup>