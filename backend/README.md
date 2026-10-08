# Backend UniLink

API inicial da aplicação, feita com Java 21 e Spring Boot. O projeto usa Maven e já inclui validação de dados, integração com MongoDB, uma rota para verificar se a API está ativa e CORS para permitir chamadas do frontend Vite.

## Requisitos

- JDK 21
- Maven 3.9 ou superior
- MongoDB Community Server em execução localmente (porta padrão `27017`)
- MongoDB Compass (opcional, para visualizar o banco)

## MongoDB local e Compass

Instale o MongoDB Community Server para Windows pelo site oficial do MongoDB. Durante a instalação, mantenha habilitada a opção de instalar o MongoDB como um serviço do Windows. O Compass pode ser instalado pelo próprio instalador do servidor ou separadamente.

No MongoDB Compass, conecte-se usando:

```text
mongodb://localhost:27017
```

O banco `unilink` será criado automaticamente quando a aplicação gravar o primeiro documento. Para usar outro endereço, defina a variável de ambiente `MONGODB_URI`.

## Executar

Na pasta `backend`, execute:

```bash
mvn spring-boot:run
```

A API inicia em `http://localhost:8080`. Para conferir se está ativa, acesse `GET http://localhost:8080/api/v1/health`; a resposta será:

```json
{
  "status": "UP",
  "application": "UniLink"
}
```

Para verificar especificamente a conexão com o MongoDB, acesse `GET http://localhost:8080/api/v1/health/mongodb`. A rota retorna `UP` quando o banco responde ao comando `ping` e HTTP 503 com `DOWN` quando não está disponível.

## Testes

```bash
mvn test
```

## Configuração

- `SERVER_PORT`: porta da API (padrão: `8080`).
- `FRONTEND_URL`: origem permitida pelo CORS (padrão: `http://localhost:5173`).
- `MONGODB_URI`: endereço do MongoDB (padrão: `mongodb://localhost:27017/unilink`).

A API configura a conexão com MongoDB via Spring Data MongoDB. As coleções e os documentos da aplicação serão criados conforme as funcionalidades e entidades forem implementadas.

## Comunidades e conexões

Em toda inicialização, a aplicação garante a existência de cinco comunidades padrão (`Engenharia de Computação`, `Vida Universitária UTFPR`, `Moradia e Repúblicas`, `Compra, venda e troca` e `Grupo de Estudos`) e insere perfis/publicações fictícias claramente identificados para sugestões e exemplos. A carga é idempotente e não remove dados existentes. As comunidades também são verificadas após novos cadastros.

O relacionamento entre pessoas é armazenado separadamente na coleção `user_follows`; comunidades não são contas e não entram nas listas de seguidores/seguindo. O feed pessoal mostra publicações próprias e de pessoas seguidas. Publicações públicas das comunidades são consultadas separadamente em `/api/v1/communities/posts`.

As comunidades podem ser listadas em `GET /api/v1/communities`. As rotas autenticadas de conexões são `GET /api/v1/users/me/followers`, `GET /api/v1/users/me/following`, `POST /api/v1/users/me/following/{userId}` e `DELETE /api/v1/users/me/following/{userId}`.

Os perfis fictícios usam nomes iniciados por `Pessoa Fake` e aparecem como sugestões ao pesquisar pessoas. Eles não são contas para login. Se dados de demonstração da versão anterior já foram gravados no MongoDB, eles permanecem lá; a aplicação não apaga dados automaticamente.

No onboarding, o catálogo de cursos da UTFPR para o campus Campo Mourão é fornecido pela aplicação. Para universidades/campi sem catálogo configurado, o curso pode ser digitado manualmente, em vez de sugerir texto preenchido por outro usuário.

## Organização do código

O backend segue separação em camadas: `controller` recebe as requisições HTTP; `service` concentra as regras de negócio; `repository` acessa o MongoDB; `model` representa os documentos persistidos; `dto` define os dados de entrada e saída da API; `security` contém os componentes JWT; e `config` reúne as configurações transversais.

## Cadastro e autenticação

- `POST /api/v1/auth/register`: recebe `name`, `username`, `email` e `password`. O username deve ser único e ter de 3 a 30 caracteres; o e-mail deve ter formato válido; a senha deve ter pelo menos 8 caracteres. Senhas são armazenadas com BCrypt.
- `POST /api/v1/auth/login`: recebe `email` e `password`. Em caso de sucesso, retorna um JWT e os dados públicos do usuário.
- Username e e-mail duplicados retornam HTTP 409; dados inválidos retornam HTTP 400 com uma mensagem no campo `message`.
- No primeiro acesso, a interface solicita instituição, campus, curso e período. O perfil é persistido por `PATCH /api/v1/users/me/onboarding`, protegido por JWT.
- `GET /api/v1/users/me` retorna os dados do usuário autenticado, incluindo as informações do onboarding.
- `GET /api/v1/catalog/institutions` sempre inclui universidades conhecidas, como UTFPR, USP, UNICAMP, UNESP, UFPR, UFRJ, UFMG, UFRGS e UFSC. Também complementa a lista com o diretório público Hipolabs (país Brasil), quando disponível; esse diretório não é oficial, pode conter dados incompletos e não garante cobertura total. A interface permite informar instituições ausentes; o domínio não é usado para bloquear cadastro.
- `GET /api/v1/catalog/campuses?institutionName=...` inclui os campi UTFPR; para outras instituições, retorna campi já informados por usuários. `GET /api/v1/catalog/courses?institutionName=...&campus=...` retorna cursos previamente informados para aquela instituição/campus. Quando ainda não há opções cadastradas, a interface aceita digitação manual. `GET /api/v1/catalog/periods` fornece os períodos de 1 a 12.

O JWT dura 24 horas por padrão. Configure `JWT_SECRET` com uma chave segura (mínimo de 32 bytes) fora do desenvolvimento local e, opcionalmente, `JWT_EXPIRATION_MS` para alterar sua duração. O segredo padrão incluído nas propriedades serve apenas para desenvolvimento local.

No frontend, `VITE_API_URL` pode ser definido para apontar a aplicação React a outro endereço de API; o padrão é `http://localhost:8080`.
