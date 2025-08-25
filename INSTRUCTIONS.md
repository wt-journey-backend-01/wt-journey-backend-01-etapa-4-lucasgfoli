# INSTRUCTIONS

## Subir o banco com Docker

1. Certifique-se de ter o Docker instalado e rodando na sua máquina.
2. No terminal, dentro da pasta do projeto, execute o comando para subir o container do banco de dados:
```bash 
docker-compose up -d
```
Esse comando vai iniciar o container em segundo plano.

3. Executar Migrations
4. Certifique-se que o container do banco está rodando.

No terminal, execute o comando para rodar as migrations usando o Knex:
```bash
npx knex migrate:latest
```

5. Esse comando criará as tabelas no banco.
6. Rodar Seeds
7. Após as migrations terem sido executadas, rode o comando para popular o banco com dados iniciais:

```bash
npx knex seed:run
```

Isso vai inserir os dados de exemplo nas tabelas.

8. Observações: 
Se quiser parar os containers Docker, use:

```bash
docker-compose down
```

Certifique-se de que o arquivo knexfile.js está configurado corretamente para o ambiente de desenvolvimento.

## Autenticação

### Registro de usuário

- **Endpoint:** `POST /auth/register`
- **Corpo da requisição:**
  ```json
  {
    "nome": "Seu Nome",
    "email": "email@example.com",
    "senha": "SenhaSegura123!"
  }
  ```
- **Retorno:** usuário criado com status `201`

### Login

- **Endpoint:** `POST /auth/login`
- **Corpo da requisição:**
  ```json
  {
    "email": "email@example.com",
    "senha": "SenhaSegura123!"
  }
  ```
- **Retorno:**
  ```json
  {
    "acess_token": "<token JWT aqui>"
  }
  ```

### Uso do token JWT

Enviar o token no header `Authorization` em todas as requisições protegidas:
```
Authorization: Bearer <token>
```
O token expira após um tempo configurado para segurança.
