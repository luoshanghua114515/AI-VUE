<template>
  <div class="chat-container">
    <!-- Header -->
    <header class="chat-header">
      <div class="header-left">
        <h2 class="header-title">AI Chat</h2>
      </div>
      <div class="header-right">
        <el-button text :icon="Plus" @click="handleNewChat" class="header-btn">
          新对话
        </el-button>
        <el-button text :icon="Clock" @click="drawerVisible = true" class="header-btn" />
        <el-dropdown trigger="click" @command="handleDropdown">
          <el-button text :icon="User" class="header-btn" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon> 退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- Messages -->
    <div ref="messageContainerRef" class="messages-container">
      <div v-if="chatStore.messages.length === 0" class="welcome">
        <el-icon :size="48" color="var(--accent)"><ChatLineSquare /></el-icon>
        <h3>有什么我可以帮助你的？</h3>
        <p class="welcome-hint">发送消息开始对话，支持上传 PDF 文件进行分析</p>
      </div>
      <ChatMessage
        v-for="(msg, idx) in chatStore.messages"
        :key="idx"
        :role="msg.role"
        :content="msg.content"
        :thinking="msg.thinking"
        :streaming="msg.streaming"
        :file="msg.file"
        :avatar-url="msg.role === 'user' ? '/avatars/user.jpg' : '/avatars/ai.jpg'"
      />
    </div>

    <!-- Input -->
    <ChatInput
      :disabled="chatStore.isStreaming"
      @send="handleSend"
      @upload="handleUpload"
    />

    <!-- History Drawer -->
    <HistoryDrawer v-model:visible="drawerVisible" />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Clock, User, ChatLineSquare, SwitchButton } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { useChatStore } from '@/stores/chat'
import { uploadFileApi } from '@/api/chat'
import { createSseConnection } from '@/components/SseParser'
import ChatMessage from '@/components/ChatMessage.vue'
import ChatInput from '@/components/ChatInput.vue'
import HistoryDrawer from '@/components/HistoryDrawer.vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const chatStore = useChatStore()

const messageContainerRef = ref(null)
const drawerVisible = ref(false)
let sseConnection = null

onMounted(async () => {
  await chatStore.loadHistoryList()
})

function scrollToBottom() {
  nextTick(() => {
    const el = messageContainerRef.value
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  })
}

async function handleSend({ text, file }) {
  if (!text && !file) return

  const userMsg = { role: 'user', content: text }
  if (file) {
    userMsg.file = { name: file.name, size: formatFileSize(file.size) }
  }
  chatStore.addMessage(userMsg)
  scrollToBottom()

  const assistantMsg = { role: 'assistant', content: '', thinking: '', streaming: true }
  chatStore.addMessage(assistantMsg)
  chatStore.isStreaming = true
  scrollToBottom()

  const encodedMsg = encodeURIComponent(text)
  const url = `/ai/chat/${encodedMsg}`

  sseConnection = createSseConnection(url, {
    chatId: chatStore.chatId,
    onThink(data) {
      chatStore.updateLastThink(data)
      scrollToBottom()
    },
    onResult(data) {
      chatStore.updateLastMessage(data)
      scrollToBottom()
    },
    onError(err) {
      ElMessage.error('连接出错: ' + err.message)
    },
    onComplete() {
      chatStore.isStreaming = false
      const msgs = chatStore.messages
      if (msgs.length > 0) {
        msgs[msgs.length - 1].streaming = false
      }
      sseConnection = null
      chatStore.loadHistoryList()
    }
  })
}

async function handleUpload(file) {
  try {
    const res = await uploadFileApi(chatStore.chatId, file)
    if (res.data.status === 1) {
      ElMessage.success('文件上传成功')
    } else {
      ElMessage.error(res.data.msg || '上传失败')
    }
  } catch {
    ElMessage.error('上传失败，请重试')
  }
}

function handleNewChat() {
  if (sseConnection) {
    sseConnection.abort()
  }
  chatStore.newChat()
}

function handleDropdown(command) {
  if (command === 'logout') {
    userStore.logout()
    router.push('/login')
  }
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  flex-shrink: 0;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.header-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}
.header-btn {
  color: var(--text-secondary);
}
.header-btn:hover {
  color: var(--accent);
}
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
}
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 12px;
  color: var(--text-secondary);
}
.welcome h3 {
  margin: 0;
  font-size: 20px;
  color: var(--text-primary);
}
.welcome-hint {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}
</style>
