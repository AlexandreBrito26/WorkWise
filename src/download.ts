/** Baixa um texto como arquivo, sem enviar nada a servidor. */
export function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

export const today = () => new Date().toISOString().slice(0, 10)
