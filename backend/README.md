# WorkWise API — Fase 5 (autenticação + upload de PDF)

Java 21 + Spring Boot 3.3 + JPA (H2 em arquivo para dev).

```bash
export JWT_SECRET="$(openssl rand -base64 48)"   # obrigatório; a API não sobe sem ele
export ADMIN_EMAIL=voce@empresa.com
export ADMIN_PASSWORD='uma-senha-longa-com-12+'  # cria o 1º usuário se a tabela estiver vazia
export GROQ_API_KEY=gsk_...                      # opcional; sem ela usa a análise por regras
mvn spring-boot:run
```

Todas as rotas `/api/**` exigem `Authorization: Bearer <token>`, exceto o login.

| Método | Rota | Descrição |
|---|---|---|
| POST | /api/auth/login | `{"email","password"}` → `{"token","expiresIn"}` (5 falhas/15 min bloqueiam o e-mail) |
| GET | /api/candidates | Lista |
| POST | /api/candidates | Cadastro com texto do currículo |
| POST | /api/candidates/upload | multipart: `name`, `email`, `role`, `file` (PDF até 5 MB, 15 páginas) |
| PATCH | /api/candidates/{id}/status | Decisão humana |
| DELETE | /api/candidates/{id} | Exclusão definitiva (LGPD) |
| GET | /api/metrics, POST /api/assistant, POST /api/jobs/* | Como antes |

O PDF não é armazenado: só o texto extraído vai para o banco.
