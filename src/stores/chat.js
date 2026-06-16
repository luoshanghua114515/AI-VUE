import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getHistoryListApi, getHistoryMessagesApi, deleteHistoryApi } from '@/api/chat'

export const useChatStore = defineStore('chat', () => {
  const messages = ref([])
  const chatId = ref(generateChatId())
  const historyList = ref([])
  const isStreaming = ref(false)

  function generateChatId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 6)
  }

  function addMessage(msg) {
    messages.value.push(msg)
  }

  function updateLastMessage(text) {
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant') {
      last.content += text
    }
  }

  function updateLastThink(text) {
    const last = messages.value[messages.value.length - 1]
    if (last && last.role === 'assistant') {
      last.thinking += text
    }
  }

  function clearMessages() {
    messages.value = []
  }

  function newChat() {
    chatId.value = generateChatId()
    clearMessages()
  }

  function setChatId(id) {
    chatId.value = id
  }

  async function loadHistoryList() {
    try {
      const res = await getHistoryListApi()
      historyList.value = res.data || []
    } catch {
      historyList.value = []
    }
  }

  async function loadHistoryMessages(id) {
    try {
      const res = await getHistoryMessagesApi(id)
      const historyMessages = (res.data || []).map(item => {
        const colonIdx = item.indexOf(':')
        const type = item.substring(0, colonIdx)
        const text = item.substring(colonIdx + 1)
        return {
          role: type === 'user' ? 'user' : 'assistant',
          content: text
        }
      })
      messages.value = historyMessages
    } catch {
      messages.value = []
    }
  }

  async function deleteHistory(id) {
    await deleteHistoryApi(id)
    await loadHistoryList()
  }

  return {
    messages, chatId, historyList, isStreaming,
    addMessage, updateLastMessage, updateLastThink, clearMessages, newChat,
    setChatId, loadHistoryList, loadHistoryMessages, deleteHistory
  }
})
