import { createContext, useContext, useState, type ReactNode } from 'react'

export type Lang = 'pt' | 'en'

const dict = {
  pt: {
    tagline: 'Inteligência em RH para sua equipe',
    candidates: 'Candidatos',
    resume: 'Currículo',
    experience: 'Experiência',
    skills: 'Habilidades',
    match: 'Compatibilidade',
    summary: 'Resumo técnico',
    assistant: 'Assistente',
    placeholder: 'Pergunte sobre o candidato selecionado…',
    send: 'Enviar',
    greeting: 'Olá! Posso resumir currículos, comparar candidatos e sugerir próximos passos.',
    thinking: 'Pensando…',
    aiOff: 'A IA está desativada: cadastre sua chave do Groq acima do chat.',
    aiFail: 'Não consegui falar com a IA agora. Confira a chave do Groq e tente novamente.',
    keyAdd: 'Ativar IA (chave do Groq)',
    keySaved: 'IA ativada (chave do Groq)',
    keyLabel: 'Chave da API do Groq',
    keyHint: 'Fica só nesta aba do navegador e é enviada apenas ao Groq. Sem chave, o resto do app funciona normalmente.',
    genericError: 'Algo deu errado. Tente novamente.',
    mTotal: 'Candidatos',
    mAvg: 'Nota média',
    mShort: 'Pré-selecionados',
    mDays: 'Dias até feedback',
    status: { new: 'Novo', review: 'Em análise', shortlist: 'Pré-selecionado', rejected: 'Recusado' },
    empty: 'Selecione um candidato para ver o currículo.',
    pending: 'Aguardando análise. Use "Analisar agora".',
    shortlistAction: 'Pré-selecionar',
    rejectAction: 'Recusar',
    reviewAction: 'Voltar para análise',
    analyzeNow: 'Analisar agora',
    analyzing: 'Analisando…',
    newCandidate: 'Novo candidato',
    fName: 'Nome',
    fEmail: 'E-mail',
    fRole: 'Vaga',
    fResume: 'Texto do currículo',
    create: 'Cadastrar',
    creating: 'Cadastrando…',
    loading: 'Carregando…',
    noCandidates: 'Nenhum candidato ainda.',
    fPdf: 'Currículo em PDF (até 5 MB)',
    orPaste: 'ou cole o texto abaixo',
    pdfError: 'Não consegui ler esse PDF. Ele precisa ter texto selecionável, sem senha e até 15 páginas.',
    pdfTooBig: 'O arquivo passa de 5 MB.',
    deleteAction: 'Excluir candidato',
    confirmDelete: 'Excluir definitivamente os dados deste candidato? Esta ação não pode ser desfeita.',
  },
  en: {
    tagline: 'HR intelligence for your team',
    candidates: 'Candidates',
    resume: 'Resume',
    experience: 'Experience',
    skills: 'Skills',
    match: 'Match',
    summary: 'Technical summary',
    assistant: 'Assistant',
    placeholder: 'Ask about the selected candidate…',
    send: 'Send',
    greeting: 'Hi! I can summarize resumes, compare candidates and suggest next steps.',
    thinking: 'Thinking…',
    aiOff: 'AI is off: add your Groq key above the chat.',
    aiFail: 'I could not reach the AI right now. Check your Groq key and try again.',
    keyAdd: 'Enable AI (Groq key)',
    keySaved: 'AI enabled (Groq key)',
    keyLabel: 'Groq API key',
    keyHint: 'Kept only in this browser tab and sent only to Groq. Without a key, the rest of the app works normally.',
    genericError: 'Something went wrong. Please try again.',
    mTotal: 'Candidates',
    mAvg: 'Average score',
    mShort: 'Shortlisted',
    mDays: 'Days to feedback',
    status: { new: 'New', review: 'In review', shortlist: 'Shortlisted', rejected: 'Rejected' },
    empty: 'Select a candidate to view the resume.',
    pending: 'Waiting for analysis. Use "Analyze now".',
    shortlistAction: 'Shortlist',
    rejectAction: 'Reject',
    reviewAction: 'Back to review',
    analyzeNow: 'Analyze now',
    analyzing: 'Analyzing…',
    newCandidate: 'New candidate',
    fName: 'Name',
    fEmail: 'E-mail',
    fRole: 'Role',
    fResume: 'Resume text',
    create: 'Add',
    creating: 'Adding…',
    loading: 'Loading…',
    noCandidates: 'No candidates yet.',
    fPdf: 'Resume as PDF (up to 5 MB)',
    orPaste: 'or paste the text below',
    pdfError: 'I could not read this PDF. It needs selectable text, no password, and up to 15 pages.',
    pdfTooBig: 'The file is larger than 5 MB.',
    deleteAction: 'Delete candidate',
    confirmDelete: 'Permanently delete this candidate\'s data? This cannot be undone.',
  },
} as const

export type Dict = (typeof dict)['pt']

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict }
const I18nContext = createContext<Ctx | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('pt')
  return <I18nContext.Provider value={{ lang, setLang, t: dict[lang] as Dict }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
