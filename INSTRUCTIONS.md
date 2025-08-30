# INSTRUCTIONS

## Subir o banco com Docker

1. Certifique-se de ter o Docker instalado e rodando na sua máquina.
2. No terminal, dentro da pasta do projeto, execute o comando para subir o container do banco de dados:

```bash
docker-compose up -d
```

O comando inicia o container em segundo plano.

3. Executar Migrations
   Certifique-se que o container do banco está rodando.
   No terminal, execute o comando para rodar as migrations usando o Knex:

```bash
npx knex migrate:latest
```

Isso criará as tabelas no banco.

4. Rodar Seeds
   Após as migrations terem sido executadas, rode o comando para popular o banco com dados iniciais:

```bash
npx knex seed:run
```

Isso vai inserir os dados de exemplo nas tabelas.

5. Parar containers Docker (opcional)

```bash
docker-compose down
```

Certifique-se de que o arquivo `knexfile.js` está configurado corretamente para o ambiente de desenvolvimento.

---

## Autenticação

### Registro de usuário

* **Endpoint:** `POST /api/auth/register`
* **Corpo da requisição:**

```json
{
  "nome": "Seu Nome",
  "email": "email@example.com",
  "senha": "SenhaSegura123!"
}
```

* **Retorno:**

  * **Status:** `201`
  * **Exemplo:**

```json
{
  "message": "Usuario criado com sucesso",
  "usuario": {
    "id": 1,
    "nome": "Seu Nome",
    "email": "email@example.com"
  }
}
```

### Login

* **Endpoint:** `POST /api/auth/login`
* **Corpo da requisição:**

```json
{
  "email": "email@example.com",
  "senha": "SenhaSegura123!"
}
```

* **Retorno:**

  * **Status:** `200`
  * **Exemplo:**

```json
{
  "access_token": "<token JWT aqui>"
}
```

### Uso do token JWT

Enviar o token no header `Authorization` em todas as requisições protegidas:

```
Authorization: Bearer <token>
```

O token expira após o tempo configurado para segurança.

---

## Testes de validação (Registro de usuário)

Para testar via Postman, verifique os seguintes casos:

1. Nome vazio ou nulo → deve retornar `400` com mensagem de erro.
2. Email vazio, nulo ou formato inválido → deve retornar `400`.
3. Senha inválida (curta, sem números, sem caracteres especiais, sem maiúsculas/minúsculas) → deve retornar `400`.
4. Campos extras enviados → deve retornar `400`.
5. Campos obrigatórios faltando → deve retornar `400`.
6. Email já em uso → deve retornar `400`.

Use o endpoint `POST /api/auth/register` para realizar essas requisições de teste.
