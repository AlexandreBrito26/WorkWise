import { getAssistantContext } from './store'

const URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile' // confira os modelos ativos em console.groq.com/docs/models
const KEY = 'ww_groq_key'

const SYSTEM = `Você é o assistente de RH do WorkWise. Responda no mesmo idioma da pergunta, de forma objetiva.
Use apenas o contexto fornecido; se a informação não estiver lá, diga que não sabe.
Você apoia a decisão da pessoa recrutadora e nunca decide contratar ou recusar alguém.`

/** 'no-key' = sem chave cadastrada; 'failed' = Groq recusou a chave, atingiu o limite ou está fora do ar. */
export class AssistantError extends Error {
  kind: 'no-key' | 'failed'
  constructor(kind: 'no-key' | 'failed') {
    super(kind)
    this.kind = kind
  }
}

// Sem back-end não há como esconder uma chave: ela é da própria pessoa usuária, fica só nesta aba
// (sessionStorage) e é enviada apenas ao Groq. Nunca coloque uma chave sua no código ou em VITE_*.
export function getGroqKey(): string {
  try { return sessionStorage.getItem(KEY) ?? '' } catch { return '' }
}

export function setGroqKey(key: string) {
  try { key ? sessionStorage.setItem(KEY, key) : sessionStorage.removeItem(KEY) } catch { /* ignora */ }
}

export async function askAssistant(message: string, candidateId?: string): Promise<string> {
  const key = getGroqKey()
  if (!key) throw new AssistantError('no-key')

  let user = message
  const context = candidateId ? getAssistantContext(candidateId) : null
  if (context) user = `Contexto do candidato (sem dados pessoais):\n${context}\n\nPergunta: ${message}`

  try {
    const res = await fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: user }],
      }),
    })
    if (!res.ok) throw new Error(String(res.status))
    const data = await res.json()
    const text: string = data?.choices?.[0]?.message?.content ?? ''
    if (!text.trim()) throw new Error('empty')
    return text
  } catch {
    throw new AssistantError('failed')
  }
}
