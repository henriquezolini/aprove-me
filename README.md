# 📘 Projeto Aprova-me

## Índice

1. [🔧 Clonando o Repositório](#-clonando-o-repositório)
2. [🚀 Backend - Guia de Execução](#-backend---guia-de-execução)
   - [🛠️ Requisitos](#️-requisitos)
   - [⚙️ Configuração do Projeto](#️-configuração-do-projeto)
   - [✅ Testes](#-testes)
   - [🔧 Comandos Úteis](#-comandos-úteis)
   - [📂 Estrutura do Projeto](#-estrutura-do-projeto)
   - [🔐 Autenticação](#-autenticação)
   - [📋 Endpoints Principais](#-endpoints-principais)
3. [🌐 Frontend - Guia Next.js](#-frontend---guia-nextjs)

---

## 🔧 Clonando o Repositório

```bash
git clone https://github.com/henriquezolini/aprove-me.git
cd aprove-me
```

---

## 🚀 Backend - Guia de Execução

### 🛠️ Requisitos

Certifique-se de ter instalado:

- Node.js (versão 20 ou superior)
- Yarn

---

### ⚙️ Configuração do Projeto

#### 1. Instalar Dependências

```bash
cd backend
yarn
```

#### 2. Variáveis de Ambiente

Crie um arquivo `.env` no diretório `backend/` com o seguinte conteúdo:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="JWT_SECRET"
NODE_ENV=development
PORT=3000
```

#### 3. Inicializar Banco de Dados

```bash
npx prisma generate
npx prisma migrate dev
```

#### 4. Rodar a Aplicação

- Para desenvolvimento (com hot reload):

```bash
yarn start:dev
```

- Para produção:

```bash
yarn build
yarn start:prod
```

---

### ✅ Testes

Para executar os testes:

```bash
yarn test         # Testes unitários
yarn test:cov     # Cobertura de testes
yarn test:e2e     # Testes end-to-end
```

---

### 🔧 Comandos Úteis

- Visualizar banco de dados com Prisma Studio:

```bash
npx prisma studio
```

- Resetar banco de dados:

```bash
npx prisma migrate reset
```

- Aplicar alterações no schema sem criar uma migration:

```bash
npx prisma db push
```

---

### 📂 Estrutura do Projeto

#### 📁 Domain

Contém as entidades e regras de negócio centrais.

- `entities/` - Entidades do domínio
- `repositories/` - Interfaces dos repositórios
- `interfaces/` - Interfaces do domínio

#### 📁 Application

Casos de uso e lógica de aplicação.

- `use-cases/` - Casos de uso
- `services/` - Serviços de aplicação
- `interfaces/` - Interfaces da camada

#### 📁 Infrastructure

Implementações concretas de infraestrutura.

- `database/` - Configuração do Prisma
- `repositories/` - Implementações reais
- `external/` - Integrações externas

#### 📁 Presentation

Controllers, DTOs e Guards.

- `controllers/` - Lógica dos endpoints
- `dtos/` - Data Transfer Objects
- `guards/` - Autenticação/autorização

#### 📁 Shared

Itens reutilizáveis no projeto.

- `config/` - Configurações globais
- `utils/` - Funções utilitárias
- `decorators/` - Decorators customizados

---

### 🔐 Autenticação

Para acessar rotas protegidas, obtenha um token JWT enviando:

**Requisição:**

```json
POST /integrations/auth
{
  "login": "aprovame",
  "password": "aprovame"
}
```

**Resposta:**

```json
{
  "access_token": "token.jwt.aqui",
  "expires_in": 2592000
}
```

---

### 📋 Endpoints Principais

| Método | Rota                       | Descrição           |
| ------ | -------------------------- | ------------------- |
| POST   | /integrations/auth         | Autenticação        |
| POST   | /integrations/payable      | Criar recebível     |
| GET    | /integrations/payable/:id  | Obter recebível     |
| PUT    | /integrations/payable/:id  | Atualizar recebível |
| DELETE | /integrations/payable/:id  | Remover recebível   |
| GET    | /integrations/assignor/:id | Obter cedente       |
| PUT    | /integrations/assignor/:id | Atualizar cedente   |
| DELETE | /integrations/assignor/:id | Remover cedente     |

---

## 🌐 Frontend - Guia Next.js

### 🛠️ Requisitos

- Node.js (versão recomendada: `>=20.x`)
- Yarn

---

### 📦 Instalação

```bash
cd frontend
yarn install
```

---

### ▶️ Rodando em Desenvolvimento

```bash
yarn dev
```

Acesse no navegador: [http://localhost:3000](http://localhost:3000)

---

### 🧪 Comandos Úteis

#### 🔍 Lint

```bash
yarn lint
```

#### 🧪 Testes

```bash
yarn test
```

#### 🏗️ Build de Produção

```bash
yarn build
```

#### 🚀 Rodar Produção Localmente

```bash
yarn start
```

---
