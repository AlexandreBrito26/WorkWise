// Aplica o tema salvo antes da página pintar (evita o "piscar" claro->escuro). Arquivo externo por causa da CSP.
try {
  var m = localStorage.getItem('ww_theme')
  if (m === 'light' || m === 'dark') document.documentElement.setAttribute('data-theme', m)
} catch (e) {}
