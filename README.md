# WorkWise

Triagem de currículos com assistente virtual — **100% front-end** (React + TypeScript + Vite + SASS). Sem back-end, sem banco e sem login: tudo roda no navegador.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/ (pronto para a Vercel)
```

## Como funciona agora

| Antes (back-end) | Agora (navegador) |
|---|---|
| Postgres/H2 | `localStorage` (dados de demonstração na primeira visita) |
| Login com JWT | Removido: não há o que proteger sem servidor |
| Análise agendada (cron) | Botão **Analisar agora** (`src/analysis.ts`) |
| PDFBox | `pdfjs-dist`, carregado só quando alguém envia um PDF |
| Groq via servidor | Opcional: cada pessoa informa a própria chave no painel do assistente |
| Envio de feedback (simulado) | Registrado ao decidir; nenhum e-mail é enviado |

- A análise sem IA usa palavras-chave do currículo (catálogo em `src/analysis.ts`). Candidatos de demonstração usam a média das habilidades, como antes.
- A recusa continua sendo decisão humana: nota baixa vai para "Em análise".
- A chave do Groq fica em `sessionStorage` (some ao fechar a aba) e só é enviada ao Groq. **Nunca** coloque uma chave sua em código ou em variável `VITE_*`: tudo isso vai para o navegador de quem acessar.

## Deploy na Vercel
Importe o repositório; o framework Vite é detectado. Não há variáveis de ambiente. O `vercel.json` já define cabeçalhos de segurança e uma CSP que só permite conexão com o próprio site e `api.groq.com`.

## Atenção
- Os dados ficam só no navegador de quem usa (não sincronizam entre dispositivos e se perdem se o armazenamento do site for limpo).
- Antes de usar currículos reais: LGPD (consentimento e retenção).
