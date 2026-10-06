# WorkWise — Front-end (Fase 5: login + upload de PDF)

```bash
npm install
npm run dev        # http://localhost:5173 — /api é repassado para http://localhost:8080
```

Suba antes o back-end (`workwise-api`) com `JWT_SECRET`, `ADMIN_EMAIL` e `ADMIN_PASSWORD`.
O login usa o usuário criado por essas variáveis. Em produção, defina `VITE_API_URL` e `workwise.cors-origin`.

- Token JWT em `sessionStorage`; qualquer resposta 401 volta para a tela de login
- Cadastro por PDF (até 5 MB) ou texto colado; exclusão definitiva de candidato
