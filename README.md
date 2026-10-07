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

## Tema e filtros
- Tema **claro / automático / escuro** no cabeçalho; "automático" segue o sistema e a escolha fica salva no navegador (`src/theme.tsx`, `public/theme-init.js`). As cores são variáveis CSS em `src/styles/main.scss`.
- A lista de candidatos tem busca por nome/vaga, filtro por status e ordenação por nota.

## Requisitos, gráficos e backup
- **Requisitos por vaga:** no currículo do candidato, defina as tecnologias exigidas para aquela vaga. A nota passa a ser a média da aderência a elas (requisito ausente = 0) e o resumo lista o que falta. Decisões humanas (pré-selecionar/recusar) nunca são sobrescritas pela reanálise.
- **Gráficos (Recharts):** candidatos por status e distribuição das notas, carregados sob demanda.
- **Backup:** exportar/importar JSON (com validação) e restaurar a demonstração. O arquivo contém e-mails e currículos.

## Mapa de talentos e animações
- **Mapa de talentos (Konva / canvas 2D):** cada candidato é uma bolha — eixo X = nota, eixo Y = nº de habilidades fortes (≥ 70%), cor = status, tamanho = quantidade de habilidades. Arraste, use a roda para zoom, duplo clique centraliza, clique abre o currículo. As cores vêm das variáveis CSS e acompanham o tema. Por ser canvas, a lista de candidatos é a alternativa acessível.
- **Animações (Framer Motion):** entrada/saída na lista, troca de candidato e barras de habilidades. Respeita "reduzir movimento" do sistema.

## Outras melhorias
- **Exportar CSV** da lista filtrada (com proteção contra injeção de fórmula em planilhas).
- **Anotações** privadas por candidato (entram no backup JSON).
- **Comparar candidatos** com gráfico radar de habilidades.
- **Teclado:** setas ↑/↓ navegam na lista e `/` foca a busca.
- **Testes:** `npm test` (Vitest) cobre análise, requisitos, backup, CSV e regras de status.

## Deploy na Vercel
Importe o repositório; o framework Vite é detectado. Não há variáveis de ambiente. O `vercel.json` já define cabeçalhos de segurança e uma CSP que só permite conexão com o próprio site e `api.groq.com`.

## Atenção
- Os dados ficam só no navegador de quem usa (não sincronizam entre dispositivos e se perdem se o armazenamento do site for limpo).
- Antes de usar currículos reais: LGPD (consentimento e retenção).
