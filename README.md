# WorkWise

> **Inteligência em RH para sua equipe.**
> Automação de processos seletivos e análise técnica de currículos.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Sass](https://img.shields.io/badge/SASS-CC6699?logo=sass&logoColor=white)
![Java](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3-6DB33F?logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Groq](https://img.shields.io/badge/IA-Groq-F55036)

O WorkWise ajuda times de RH a triar candidatos mais rápido. Recrutadores cadastram candidatos (por PDF ou texto), a IA faz a triagem técnica e gera nota, resumo e compatibilidade por habilidade, e **a decisão final continua sendo humana**.

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Estrutura do repositório](#estrutura-do-repositório)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [API](#api)
- [Como a triagem funciona](#como-a-triagem-funciona)
- [Segurança e privacidade](#segurança-e-privacidade)
- [Deploy](#deploy)
- [Identidade visual](#identidade-visual)
- [Roadmap de desenvolvimento](#roadmap-de-desenvolvimento)
- [Limitações conhecidas e próximos passos](#limitações-conhecidas-e-próximos-passos)
- [Licença](#licença)

---

## Funcionalidades

- **Cadastro de candidatos** por upload de PDF (extração de texto no servidor) ou texto colado
- **Triagem técnica com IA (Groq):** nota de 0 a 100, resumo em PT e EN e compatibilidade por habilidade
- **Visualizador de currículos** com resumo técnico, habilidades e linha do tempo de experiência
- **Painel de métricas:** total de candidatos, nota média, pré-selecionados e dias até o feedback
- **Assistente virtual** para tirar dúvidas sobre o candidato selecionado
- **Decisão humana:** pré-selecionar, recusar ou devolver para análise
- **Automação agendada (Cron):** análise de currículos novos e envio de feedback
- **Interface bilíngue (PT/EN)** para recrutamento internacional
- **Login com JWT** e proteção contra tentativas repetidas de senha
- **Exclusão definitiva** dos dados de um candidato (direito de eliminação da LGPD)

## Stack

| Camada | Tecnologias |
|---|---|
| Front-end | React, TypeScript, Vite, SASS |
| Back-end | Java 21, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security (OAuth2 Resource Server / JWT), Bean Validation |
| Banco de dados | PostgreSQL em produção, H2 em desenvolvimento |
| IA | API do Groq (compatível com OpenAI), chamada somente pelo back-end |
| PDF | Apache PDFBox |
| Hospedagem | Vercel (front-end) e Render (API + Postgres) |

## Arquitetura

```
┌────────────────────┐   HTTPS + Bearer JWT   ┌──────────────────────┐        ┌────────────┐
│  Front-end (React) │ ─────────────────────▶ │  API Spring Boot     │ ─────▶ │ PostgreSQL │
│  Vercel            │                        │  Render              │        └────────────┘
└────────────────────┘                        │                      │        ┌────────────┐
                                              │  Jobs (@Scheduled) ──┼──────▶ │  Groq API  │
                                              └──────────────────────┘        └────────────┘
```

A chave do Groq nunca chega ao navegador: toda chamada de IA passa pelo back-end.

## Estrutura do repositório

```
workwise/
├── frontend/                 # React + Vite + SASS
│   ├── src/
│   │   ├── api.ts            # chamadas à API, token e tratamento de 401
│   │   ├── types.ts          # contrato (espelha os DTOs do Spring)
│   │   ├── i18n.tsx          # toggle e dicionários PT/EN
│   │   ├── App.tsx
│   │   ├── components/       # Header, Login, Metrics, CandidateList,
│   │   │                     # NewCandidateForm, CvViewer, Assistant
│   │   └── styles/           # variáveis e estilos em SASS
│   ├── vercel.json
│   └── .env.example
├── backend/                  # Spring Boot
│   ├── src/main/java/com/workwise/
│   │   ├── config/           # segurança, CORS, propriedades, seeders
│   │   ├── domain/           # entidades e repositórios
│   │   ├── service/          # triagem, Groq, assistente, auth, PDF
│   │   └── web/              # controllers e DTOs
│   ├── src/main/resources/   # application.yml e application-prod.yml
│   └── Dockerfile
├── render.yaml               # Blueprint do Render (API + banco)
└── README.md
```

## Como rodar localmente

### Pré-requisitos

- Node.js 18+
- Java 21 e Maven 3.9+
- (Opcional) chave da API do Groq: [console.groq.com](https://console.groq.com)

### 1. Back-end

```bash
cd backend

export JWT_SECRET="$(openssl rand -base64 48)"   # obrigatório (mínimo 32 caracteres)
export ADMIN_EMAIL=voce@empresa.com               # cria o primeiro usuário
export ADMIN_PASSWORD='uma-senha-com-12-ou-mais'
export GROQ_API_KEY=gsk_...                       # opcional

mvn spring-boot:run
```

A API sobe em `http://localhost:8080` com o banco H2 em arquivo e **4 candidatos de demonstração**. Sem `GROQ_API_KEY`, a triagem usa uma regra simples (média das habilidades) em vez da IA.

> A API **não inicia** sem `JWT_SECRET`. É proposital: melhor falhar do que subir sem proteção.

### 2. Front-end

```bash
cd frontend
npm install
npm run dev
```

Abra `http://localhost:5173` e entre com `ADMIN_EMAIL` e `ADMIN_PASSWORD`. Em desenvolvimento, o Vite repassa `/api` para `http://localhost:8080`, então não há problema de CORS.

### Teste rápido pela API

```bash
# login
TOKEN=$(curl -s -X POST localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"voce@empresa.com","password":"uma-senha-com-12-ou-mais"}' | jq -r .token)

# cadastrar candidato
curl -X POST localhost:8080/api/candidates \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"name":"Teste","email":"t@example.com","role":"Front-end Developer","resumeText":"5 anos com React, TypeScript e testes com Jest."}'

# rodar a triagem agora
curl -X POST localhost:8080/api/jobs/analysis -H "Authorization: Bearer $TOKEN"
```

## Variáveis de ambiente

### Back-end

| Variável | Obrigatória | Descrição |
|---|---|---|
| `JWT_SECRET` | Sim | Segredo para assinar tokens (mínimo 32 caracteres) |
| `ADMIN_EMAIL` | Na 1ª execução | E-mail do primeiro usuário (só cria se não houver usuários) |
| `ADMIN_PASSWORD` | Na 1ª execução | Senha do primeiro usuário (mínimo 12 caracteres) |
| `GROQ_API_KEY` | Não | Ativa a triagem e o assistente com IA |
| `GROQ_MODEL` | Não | Modelo do Groq (padrão `llama-3.3-70b-versatile`; confira os ativos em [console.groq.com/docs/models](https://console.groq.com/docs/models)) |
| `CORS_ORIGIN` | Em produção | URL exata do front-end (ex.: `https://workwise.vercel.app`) |
| `DATABASE_URL` | Em produção | `postgres://usuario:senha@host:porta/banco` |

Outras opções ficam em `application.yml`: horários dos jobs (`workwise.analysis.cron` e `workwise.feedback.cron`), validade do token, requisitos da vaga e `auto-reject`.

### Front-end

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL pública da API, sem barra no final (só necessária fora do ambiente de desenvolvimento) |

## API

Todas as rotas `/api/**` exigem `Authorization: Bearer <token>`, exceto o login e o health check.

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/api/health` | Health check (público) |
| `POST` | `/api/auth/login` | `{"email","password"}` → `{"token","expiresIn"}` |
| `GET` | `/api/candidates` | Lista candidatos |
| `POST` | `/api/candidates` | Cadastra com texto do currículo |
| `POST` | `/api/candidates/upload` | Cadastra com PDF (`multipart`: `name`, `email`, `role`, `file`) |
| `GET` | `/api/candidates/{id}` | Detalhe de um candidato |
| `PATCH` | `/api/candidates/{id}/status` | Decisão humana: `{"status":"shortlist"}` |
| `DELETE` | `/api/candidates/{id}` | Exclusão definitiva |
| `GET` | `/api/metrics` | Métricas do painel |
| `POST` | `/api/assistant` | `{"message","candidateId"}` → `{"reply"}` |
| `POST` | `/api/jobs/analysis` | Dispara a triagem agora |
| `POST` | `/api/jobs/feedback` | Dispara o envio de feedback agora |

Status possíveis: `new`, `review`, `shortlist`, `rejected`.

## Como a triagem funciona

1. O candidato entra como **Novo** (`new`).
2. A cada hora cheia (ou ao clicar em **Analisar agora**), o job pega os candidatos novos e envia ao Groq a vaga, os requisitos e o texto do currículo.
3. A IA devolve um JSON com nota (0 a 100), resumo em PT/EN e compatibilidade por habilidade.
4. Regra de status:
   - nota **80 ou mais** → **Pré-selecionado**
   - abaixo disso → **Em análise**
   - **recusar é sempre decisão humana** (a menos que `auto-reject` seja ligado, o que não é recomendado)
5. Se o Groq falhar (chave inválida, limite de uso, rede), o candidato continua como **Novo** e é tentado de novo no próximo ciclo. Nenhuma nota é inventada.
6. Aos 30 minutos de cada hora, o job de feedback processa quem já tem decisão e ainda não foi notificado (por enquanto, apenas registra no log).

O assistente recebe o contexto do candidato **sem nome e e-mail**.

## Segurança e privacidade

- Senhas com BCrypt; tokens JWT (HS256) com validade de 8 horas
- Bloqueio de 15 minutos após 5 tentativas de login incorretas; resposta idêntica para e-mail inexistente e senha errada
- API stateless, CORS restrito à origem do front-end e headers de segurança no front
- Chave do Groq apenas no servidor
- Prompt que trata o currículo como dado não confiável (mitiga prompt injection) e ignora características pessoais na avaliação
- Upload de PDF validado pelo conteúdo real, com limites de 5 MB, 15 páginas e 20 mil caracteres; **o arquivo não é armazenado**, só o texto extraído
- Exclusão definitiva de candidato pela interface e pela API

> **Antes de usar com dados reais:** currículos são dados pessoais. Obtenha consentimento dos candidatos, defina uma política de retenção, mantenha uma pessoa na decisão final e avalie a LGPD com apoio jurídico.

## Deploy

O front-end vai para a **Vercel** e o back-end, que é Java, vai para o **Render** (a Vercel não executa Spring Boot).

1. **GitHub:** suba o repositório completo.
2. **Render (primeiro):** *New → Blueprint*, escolha o repositório (ele lê o `render.yaml`) e preencha `ADMIN_EMAIL`, `ADMIN_PASSWORD` e, se quiser, `GROQ_API_KEY`. Anote a URL e teste `GET /api/health`.
3. **Vercel:** importe o repositório com *Root Directory* = `frontend` e defina `VITE_API_URL` com a URL do Render.
4. **CORS:** no Render, defina `CORS_ORIGIN` com a URL exata da Vercel.

Observações:

- Planos gratuitos podem "dormir" por inatividade, e os jobs agendados só rodam com o serviço ativo.
- Em produção o perfil `prod` é usado automaticamente (Docker), e os candidatos de demonstração não são criados.
- Confira os limites atuais dos planos antes de depender deles.

## Identidade visual

| Uso | Cor | Hex |
|---|---|---|
| Primária (azul marinho profundo) | ![#1A237E](https://placehold.co/16x16/1A237E/1A237E.png) | `#1A237E` |
| Secundária (ciano profissional) | ![#00BCD4](https://placehold.co/16x16/00BCD4/00BCD4.png) | `#00BCD4` |
| Destaque (verde sucesso) | ![#8BC34A](https://placehold.co/16x16/8BC34A/8BC34A.png) | `#8BC34A` |
| Fundo (light mode) | ![#E5E5E5](https://placehold.co/16x16/E5E5E5/E5E5E5.png) | `#E5E5E5` |

O ciano e o verde são usados em barras, selos e destaques, não como cor de texto sobre o fundo claro, por causa do contraste.

## Roadmap de desenvolvimento

- [x] **Fase 1 · Front-end:** interfaces do assistente virtual, toggle PT/EN, visualizador de currículos e métricas (React + SASS)
- [x] **Fase 2 · Back-end:** regras de negócio com Java e Spring Boot e Cron para análise e feedback
- [x] **Fase 3 · Integração com IA:** triagem inteligente e análise técnica com a API do Groq
- [x] **Fase 4 · Integração:** front conectado à API (cadastro, status, análise sob demanda e assistente)
- [x] **Fase 5 · Segurança e PDF:** login com JWT, upload de PDF e exclusão de dados
- [x] **Fase 6 · Deploy:** Vercel + Render + PostgreSQL

## Limitações conhecidas e próximos passos

- [ ] Testes automatizados (unitários e de integração)
- [ ] Migrações de banco com Flyway (hoje o esquema é atualizado pelo Hibernate)
- [ ] Várias vagas (`JobPosting`) com requisitos próprios; hoje há um único conjunto de requisitos
- [ ] Envio real de e-mail de feedback (hoje só registra em log)
- [ ] Múltiplos usuários, perfis de acesso, troca de senha e tela de cadastro
- [ ] Token em cookie `httpOnly` e bloqueio de login distribuído (hoje em memória, vale para uma instância)
- [ ] OCR para currículos digitalizados
- [ ] Paginação e busca na lista de candidatos
- [ ] Política automática de retenção de dados

## Licença

Defina a licença do projeto (por exemplo, MIT) e adicione um arquivo `LICENSE` na raiz.
