const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
  const converter = new showdown.Converter()
  return converter.makeHtml(text)
}

const getCorrectAsk = (game, question) => {
  const askLOL = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}
    
    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, builds e dicas
    
    ## Regras
    - Se você não sabe a resposta, responda com "Não sei" e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo"
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual

    ## Resposta
    - Economize na resposta, seja direto e responda com no máximo 500 caracteres.
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    - Use bullet points para os itens, builds e estratégias

    ## Exemplo de resposta
    pergunta do usuário: Melhor build yone mid
    resposta: A build mais atual é: \n\n **Itens:**\n\n coloque os itens aqui.\n\n**Runas**\n\nexemplo de runas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `

  const askValorant = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}
    
    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, mapas e dicas
    
    ## Regras
    - Se você não sabe a resposta, responda com "Não sei" e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo"
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual
    - Sempre se baseie nos mapas que estão disponíveis no path atual

    ## Resposta
    - Economize na resposta, seja direto e responda com no máximo 500 caracteres.
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    - Use bullet points para as armas, mapas e estratégias

    ## Exemplo de resposta
    pergunta do usuário: Como jogar de sage na icebox
    resposta: O jeito de jogar na icebox com a sage é: \n\n **Estratégia:**\n\n coloque a estratégia aqui.\n\n**Armas**\n\nexemplo de armas\n\n

    ---
    Aqui está a pergunta do usuário: ${question}
  `

  const askCS = `
    ## Especialidade
    Você é um especialista assistente de meta para o jogo ${game}
    
    ## Tarefa
    Você deve responder as perguntas do usuário com base no seu conhecimento do jogo, estratégias, mapas e dicas
    
    ## Regras
    - Se você não sabe a resposta, responda com "Não sei" e não tente inventar uma resposta.
    - Se a pergunta não está relacionada ao jogo, responda com "Essa pergunta não está relacionada ao jogo"
    - Considere a data atual ${new Date().toLocaleDateString()}
    - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
    - Nunca responda itens que você não tenha certeza de que existe no patch atual
    - Sempre se baseie nos mapas que estão disponíveis no path atual

    ## Resposta
    - Economize na resposta, seja direto e responda com no máximo 500 caracteres.
    - Responda em markdown
    - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o usuário está querendo.
    - Use bullet points para as armas, mapas e estratégias

    ## Exemplo de resposta
    pergunta do usuário: Como jogar de tr (terrorist) na mirage
    resposta: O jeito de jogar na mirage como TR: \n\n **Estratégia:**\n\n coloque a estratégia aqui.\n\n**Armas**\n\nexemplo de armas\n\n**Granadas**

    ---
    Aqui está a pergunta do usuário: ${question}
  `

  if (game == 'lol') return askLOL
  if (game == 'valorant') return askValorant
  if (game == 'cs') return askCS
}

const askToAI = async (question, game, apiKey) => {
  const model = 'gemini-2.5-flash'
  const baseURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const ask = getCorrectAsk(game, question)

  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: ask,
        },
      ],
    },
  ]

  const tools = [
    {
      google_search: {},
    },
  ]

  const response = await fetch(baseURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ contents, tools }),
  })

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

const submitForm = async (event) => {
  event.preventDefault()

  const apiKey = apiKeyInput.value
  const game = gameSelect.value
  const question = questionInput.value

  if (!apiKey || !game || !question) {
    alert('Por favor, preencha todos os campos.')
    return
  }

  askButton.disabled = true
  askButton.textContent = 'Perguntando...'
  askButton.classList.add('loading')

  try {
    const text = await askToAI(question, game, apiKey)
    aiResponse.querySelector('.response-content').innerHTML =
      markdownToHTML(text)
    aiResponse.classList.remove('hidden')
  } catch (error) {
    console.log('Erro:', error)
  } finally {
    askButton.disabled = false
    askButton.textContent = 'Perguntar'
    askButton.classList.remove('loading')
  }
}

form.addEventListener('submit', submitForm)
