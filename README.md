<div align="center">

  <img src="frontend/public/unilink-logo.png" alt="Logo do UniLink" width="180">

  # UniLink

  ### A rede social acadêmica feita para aproximar pessoas, cursos e comunidades universitárias

  <p>
    Conecte-se com colegas, compartilhe experiências, encontre comunidades e acompanhe
    o que acontece no seu ambiente acadêmico em um só lugar.
  </p>

  <p>
    <img src="https://img.shields.io/badge/status-em%20desenvolvimento-F7C948?style=for-the-badge" alt="Status: Finalizado">
    <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java 21">
    <img src="https://img.shields.io/badge/Spring%20Boot-3.5.6-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" alt="Spring Boot 3.5.6">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React 19">
    <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB">
  </p>

</div>

<br>

> **UniLink** é um projeto de conclusão de curso criado para oferecer um espaço digital
> acadêmico, colaborativo e organizado, com foco na interação entre estudantes e na
> descoberta de oportunidades dentro da universidade.

## Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração e execução](#-configuração-e-execução)
- [Variáveis de ambiente](#-variáveis-de-ambiente)
- [Testes e qualidade](#-testes-e-qualidade)
- [Estrutura de pastas](#-estrutura-de-pastas)
- [Rotas principais](#-rotas-principais)
- [Solução de problemas](#-solução-de-problemas)

## ✨ Sobre o projeto

O UniLink funciona como uma rede social voltada para a vida universitária. A aplicação
combina um feed de publicações com recursos de relacionamento, comunidades e informações
acadêmicas, permitindo que cada pessoa personalize sua experiência de acordo com sua
instituição, campus e curso.

Além da experiência social, o projeto contempla autenticação segura, perfis públicos,
controles de privacidade e recursos de moderação. O frontend e o backend são mantidos
separados e se comunicam por uma API REST versionada.

## 🚀 Funcionalidades

- **Cadastro, login e sessão segura** com autenticação stateless por JWT.
- **Onboarding acadêmico** com seleção de instituição, campus, curso e período.
- **Feed social** para criar, editar, excluir, curtir, comentar e repostar publicações.
- **Privacidade de publicações**, incluindo conteúdo público e restrito a seguidores.
- **Perfis de usuário** com avatar, capa, informações acadêmicas e publicações.
- **Seguidores e solicitações** para contas privadas, com aprovação e rejeição.
- **Comunidades** por interesse, com entrada, saída, gerenciamento de membros e solicitações.
- **Eventos acadêmicos** para divulgação de atividades e encontros.
- **Busca e sugestões de pessoas**, além de notificações de atividade.
- **Salvos no navegador** para consultar publicações importantes posteriormente.
- **Modo escuro** e preferências de conta.
- **Moderação** com bloqueio de usuários, palavras bloqueadas e denúncias de conteúdo.
- **Health checks** independentes para a API e para a conexão com o MongoDB.

## 🧰 Tecnologias

### Frontend

| Tecnologia | Uso |
| --- | --- |
| React 19 | Construção da interface e componentes |
| Vite | Servidor de desenvolvimento e build de produção |
| React Router | Navegação entre páginas |
| Tailwind CSS 4 | Estilização responsiva |
| Lucide React | Ícones da interface |
| React Day Picker | Seleção e exibição de datas |
| ESLint | Padronização e análise estática |

### Backend

| Tecnologia | Uso |
| --- | --- |
| Java 21 | Linguagem da API |
| Spring Boot 3.5.6 | Base da aplicação web |
| Spring Web | API REST |
| Spring Data MongoDB | Persistência e acesso ao banco |
| Spring Security | Autorização e proteção dos endpoints |
| JJWT 0.12.6 | Geração e validação de tokens JWT |
| Bean Validation | Validação dos dados recebidos |
| Maven | Gerenciamento de dependências e build |
| JUnit / Spring Boot Test | Testes automatizados |

## 🏗️ Arquitetura

```text
┌──────────────────────┐       HTTP/JSON        ┌──────────────────────┐
│      Frontend        │  ───────────────────▶  │       Backend        │
│   React + Vite       │  ◀───────────────────  │ Spring Boot + JWT    │
│   Aplicação web      │     REST /api/v1      │    API REST + JWT     │
└──────────────────────┘                       └──────────┬───────────┘
                                                          │
                                                          │ Spring Data
                                                          ▼
                                                 ┌──────────────────────┐
                                                 │       MongoDB         │
                                                 │       unilink         │
                                                 └──────────────────────┘
```

O navegador mantém o token de autenticação e os dados básicos da sessão em
`localStorage`. Os dados persistentes da aplicação, como usuários, publicações,
comunidades e eventos, ficam no MongoDB.

## ✅ Pré-requisitos

Instale os seguintes componentes antes de iniciar:

- **Git**
- **Node.js 20 ou superior** e npm
- **Java JDK 21**
- **Maven 3.9 ou superior**
- **MongoDB 6 ou superior**, localmente ou em uma instância acessível pela aplicação

Verifique as versões instaladas:

```bash
git --version
node --version
npm --version
java --version
mvn --version
mongosh --version
```

> O projeto não possui `docker-compose.yml` no momento. Portanto, o MongoDB deve ser
> iniciado separadamente antes do backend, caso você use uma instalação local.

## ▶️ Configuração e execução

### 1. Clone o repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd UniLink
```

### 2. Inicie o MongoDB

Use uma instância local ou informe uma URI do MongoDB Atlas na variável `MONGODB_URI`.
Com uma instalação local padrão, o backend já utiliza:

```text
mongodb://localhost:27017/unilink
```

### 3. Inicie o backend

Abra um terminal na pasta do backend:

```bash
cd backend
mvn spring-boot:run
```

A API ficará disponível em `http://localhost:8080`.

Para gerar o `.jar` e executar a aplicação compilada:

```bash
mvn clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### 4. Inicie o frontend

Em outro terminal, a partir da raiz do projeto:

```bash
cd frontend
npm install
npm run dev
```

Abra no navegador o endereço exibido pelo Vite, normalmente
`http://localhost:5173`.

O frontend já aponta, por padrão, para `http://localhost:8080`. Se a API estiver
em outro endereço, defina `VITE_API_URL` antes de iniciar:

**PowerShell (Windows):**

```powershell
$env:VITE_API_URL="http://localhost:8080"
npm run dev
```

**Linux/macOS:**

```bash
VITE_API_URL=http://localhost:8080 npm run dev
```

### 5. Fluxo recomendado para testar

1. Acesse `/register` e crie uma conta.
2. Conclua o onboarding acadêmico.
3. Publique uma mensagem no feed.
4. Crie ou entre em uma comunidade.
5. Cadastre um evento e teste as configurações de privacidade.

## 🔐 Variáveis de ambiente

Todas as variáveis abaixo são opcionais para execução local, pois existem valores
 padrão. Em ambientes reais, substitua os valores de desenvolvimento e nunca
 compartilhe segredos no repositório.

### Backend

| Variável | Padrão local | Descrição |
| --- | --- | --- |
| `SERVER_PORT` | `8080` | Porta da API |
| `FRONTEND_URL` | `http://localhost:5173` | Origem permitida pelo CORS |
| `MONGODB_URI` | `mongodb://localhost:27017/unilink` | URI de conexão com o MongoDB |
| `JWT_SECRET` | `unilink-local-development-secret-key-change-me` | Chave usada para assinar os tokens |
| `JWT_EXPIRATION_MS` | `86400000` | Tempo de expiração do JWT em milissegundos |

### Frontend

| Variável | Padrão local | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | URL base do backend |

Exemplo de execução do backend com variáveis personalizadas:

**PowerShell (Windows):**

```powershell
$env:MONGODB_URI="mongodb://localhost:27017/unilink"
$env:JWT_SECRET="troque-por-uma-chave-longa-e-segura"
$env:FRONTEND_URL="http://localhost:5173"
mvn spring-boot:run
```

**Linux/macOS:**

```bash
MONGODB_URI=mongodb://localhost:27017/unilink \
JWT_SECRET=troque-por-uma-chave-longa-e-segura \
FRONTEND_URL=http://localhost:5173 \
mvn spring-boot:run
```

## 🧪 Testes e qualidade

### Backend

Execute os testes automatizados a partir de `backend`:

```bash
mvn test
```

### Frontend

Execute o lint e o build de produção a partir de `frontend`:

```bash
npm run lint
npm run build
```

Para visualizar o build localmente:

```bash
npm run preview
```

## 📁 Estrutura de pastas

```text
UniLink/
├── backend/
│   ├── src/main/java/br/com/unilink/backend/
│   │   ├── config/          # CORS, segurança e tratamento de erros
│   │   ├── controller/      # Endpoints REST
│   │   ├── dto/             # Objetos de entrada e saída da API
│   │   ├── model/           # Documentos e entidades
│   │   ├── repository/      # Repositórios MongoDB
│   │   ├── security/        # JWT e autenticação
│   │   └── service/         # Regras de negócio
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── public/              # Arquivos públicos e imagens
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── hooks/           # Hooks customizados
│   │   ├── pages/           # Telas da aplicação
│   │   └── utils/            # API client e utilitários
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 🔗 Rotas principais

A API utiliza o prefixo `/api/v1`:

| Grupo | Exemplos |
| --- | --- |
| Saúde | `GET /api/v1/health` · `GET /api/v1/health/mongodb` |
| Autenticação | `POST /api/v1/auth/register` · `POST /api/v1/auth/login` |
| Publicações | `GET/POST /api/v1/posts` · likes · comentários · reposts |
| Usuários | perfis, busca, seguidores, bloqueios e denúncias |
| Comunidades | catálogo, criação, membros e solicitações |
| Eventos | listagem, criação, edição e exclusão |
| Catálogo acadêmico | instituições, campi, cursos e períodos |
| Notificações | listagem e marcação como lida |
| Configurações | conta, senha, preferências e palavras bloqueadas |

Os endpoints protegidos exigem o cabeçalho:

```http
Authorization: Bearer <seu-token-jwt>
```

Para uma verificação rápida após iniciar o backend:

```text
http://localhost:8080/api/v1/health
http://localhost:8080/api/v1/health/mongodb
```

## 🛠️ Solução de problemas

| Problema | O que verificar |
| --- | --- |
| Frontend informa que não conecta ao backend | Confirme se o backend está rodando na porta 8080 e se `VITE_API_URL` está correto. |
| Erro ao iniciar o backend relacionado ao MongoDB | Inicie o MongoDB ou configure uma URI válida em `MONGODB_URI`. |
| Erro de CORS | Ajuste `FRONTEND_URL` para a origem exata usada pelo Vite. |
| Porta já está em uso | Altere `SERVER_PORT` no backend ou encerre o processo que ocupa a porta. |
| Dependências do frontend ausentes | Execute `npm install` dentro da pasta `frontend`. |
| Token ou sessão inválida | Faça logout, limpe os dados do site e entre novamente. |

## 🤝 Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para sua alteração: `git checkout -b feature/minha-melhoria`.
3. Faça as mudanças e execute os testes, o lint e o build.
4. Envie um pull request explicando o que foi alterado.

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos. Caso uma licença de uso,
distribuição ou contribuição seja definida posteriormente, este documento deverá
ser atualizado para refletir seus termos.

<div align="center">

  <br>
  <strong>UniLink</strong> · conectando a comunidade acadêmica

</div>
