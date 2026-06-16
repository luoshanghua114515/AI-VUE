const THINK_PREFIX = 'Agent思考:'
const RESULT_PREFIX = 'Agent结果:'

export function createSseConnection(url, options = {}) {
  const {
    chatId = '',
    method = 'GET',
    body = null,
    onThink = () => {},
    onResult = () => {},
    onError = () => {},
    onOpen = () => {},
    onComplete = () => {}
  } = options

  const token = localStorage.getItem('token')

  const controller = new AbortController()

  const headers = {
    'authorization': token || '',
    'chatId': chatId
  }
  if (body) {
    headers['Content-Type'] = 'text/plain;charset=UTF-8'
  }

  fetch(url, {
    method,
    headers,
    body,
    signal: controller.signal
  }).then(async response => {
    if (!response.ok) {
      onError(new Error(`HTTP ${response.status}`))
      onComplete()
      return
    }

    onOpen()

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed.startsWith('data:')) continue

        const data = trimmed.substring(5).trim()
        if (data === '[DONE]') {
          onComplete()
          return
        }

        if (data.startsWith(THINK_PREFIX)) {
          onThink(data.substring(THINK_PREFIX.length))
        } else if (data.startsWith(RESULT_PREFIX)) {
          onResult(data.substring(RESULT_PREFIX.length))
        }
      }
    }
    onComplete()
  }).catch(err => {
    if (err.name !== 'AbortError') {
      onError(err)
    }
    onComplete()
  })

  return {
    abort() {
      controller.abort()
    }
  }
}
