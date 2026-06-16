<template>
  <el-drawer
    v-model="visible"
    direction="rtl"
    size="320px"
    title="历史会话"
    :with-header="true"
  >
    <div class="history-list">
      <div
        v-for="id in chatStore.historyList"
        :key="id"
        class="history-item"
        :class="{ active: id === chatStore.chatId }"
        @click="switchChat(id)"
      >
        <div class="history-item-info">
          <el-icon :size="16"><ChatDotRound /></el-icon>
          <span class="history-item-title">{{ id }}</span>
        </div>
        <el-button
          text
          type="danger"
          :icon="Delete"
          size="small"
          @click.stop="removeChat(id)"
        />
      </div>
      <el-empty v-if="chatStore.historyList.length === 0" description="暂无历史会话" />
    </div>
  </el-drawer>
</template>

<script setup>
import { ChatDotRound, Delete } from '@element-plus/icons-vue'
import { useChatStore } from '@/stores/chat'

const chatStore = useChatStore()

const visible = defineModel('visible', { type: Boolean, default: false })

async function switchChat(id) {
  chatStore.setChatId(id)
  await chatStore.loadHistoryMessages(id)
  visible.value = false
}

async function removeChat(id) {
  await chatStore.deleteHistory(id)
}
</script>

<style scoped>
.history-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.history-item:hover {
  background: var(--bg-hover);
}
.history-item.active {
  background: var(--bg-card);
  border: 1px solid var(--accent);
}
.history-item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}
.history-item-title {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
