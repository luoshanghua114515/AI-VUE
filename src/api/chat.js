import request from './request'

export function uploadFileApi(chatId, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post(`/upload/pdf/${chatId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function getHistoryListApi() {
  return request.get('/chat/history')
}

export function getHistoryMessagesApi(chatId) {
  return request.get(`/chat/history/${chatId}`)
}

export function deleteHistoryApi(chatId) {
  return request.delete(`/chat/history/remove/${chatId}`)
}

export function getChatSseUrl() {
  return '/ai/chat'
}
