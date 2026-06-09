#### Estapas do Projeto

#### Arquitetura

Foi escolhido a arquitetura modular (Modular Architecture), ao meu ver depois de estudar sobre, se torna mais facil escalar para algo maior caso necesário.

##### Estrutura
```
pps/api/
├── src/
│   ├── modules/
│   │   ├── users/
│   │   │   ├── user.types.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   └── user.routes.ts
│   │   │
│   │   ├── auth/
│   │   │   ├── auth.types.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   └── auth.routes.ts
│   │   │
│   │   └── news/
│   │       ├── news.types.ts
│   │       ├── news.repository.ts
│   │       ├── news.service.ts
│   │       ├── news.controller.ts
│   │       └── news.routes.ts
│   │
│   ├── shared/
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   └── types/
│   │       └── global.types.ts
│   │
│   ├── database/
│   │   ├── knex.ts
│   │   └── migrations/
│   │
│   └── server.ts
│
├── knexfile.ts
├── tsconfig.json
├── package.json
└── .env
```

##### Instalação de Dependências

```
cd app/api
npm init -y
npm install fastify dotenv cors knex pg express
npm install jsonwebtoken bcrypt uuid
npm install zod

npm install -D typescript tsx tsup @types/node
npm install -D @types/jsonwebtoken @types/bcrypt
npm install -D @types/express @types/cors

```

#### Banco de dados

1. Criar projeto no Supabase

2. Acesse [supabase.com](https://supabase.com), crie um projeto e anote:
   * `SUPABASE_URL`
   * `SUPABASE_ANON_KEY`
   * `SUPABASE_SERVICE_ROLE_KEY` (para o backend — nunca expor no frontend)
   * `DATABASE_URL` (connection string direta ao PostgreSQL, em Settings → Database)

3. Criar .env

4. Criar database/knex.ts

5. Criar src/test.ts -> npm tsx src/test.ts / incluido alguns script package.json

6. Configurar tsconfig.json

7. Criar server.ts

8. Criar knexfile.ts

9. Executar raiz app/api -> npx knex migrate:make create\_users --knexfile knexfile.ts

10. Editar arquivo em migrations user -> tabela users

11. Criar migration refresh\_tokens -> npx knex migrate:make create\_refresh\_tokens --knexfile knexfile.ts

12. Editar arquivo em migrations tokens

13. Script package.json
    "migrate": "knex migrate:latest --knexfile knexfile.ts",   -> executa os up criando no bd subapase as tabelas
    "rollback": "knex migrate:rollback --knexfile knexfile.ts"  -> dropa ultima up executados

14. npm run migrate

####

##### Fluxo

***

##### Criação arquitetura

***

##### Criação arquitetura

***

