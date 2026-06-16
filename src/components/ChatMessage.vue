<template>
  <div class="message-wrapper" :class="[role, { streaming }]">
    <div class="avatar">
      <img
        v-if="avatarUrl && !avatarError"
        :src="avatarUrl"
        class="avatar-img"
        @error="avatarError = true"
        :alt="role"
      />
      <el-icon v-else-if="role === 'user'" :size="18"><UserFilled /></el-icon>
      <el-icon v-else :size="18"><MagicStick /></el-icon>
    </div>
    <div class="message-content">
      <!-- 思考过程 -->
      <div v-if="thinking" class="think-block">
        <div class="think-header" @click="thinkExpanded = !thinkExpanded">
          <el-icon :size="14" class="think-icon"><CaretRight /></el-icon>
          <span class="think-label">AI 思考过程</span>
          <span class="think-toggle">{{ thinkExpanded ? '收起' : '展开' }}</span>
        </div>
        <div v-show="thinkExpanded" class="think-body" v-html="renderedThink"></div>
      </div>
      <!-- 正式回复 -->
      <div v-if="content" class="bubble" :class="{ 'has-thinking': thinking }" v-html="renderedContent"></div>
      <div v-else-if="streaming && !content" class="bubble thinking-placeholder">
        <span class="loading-dots">思考中</span>
      </div>
      <FileBubble
        v-if="file"
        :file-name="file.name"
        :file-size="file.size"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UserFilled, MagicStick, CaretRight } from '@element-plus/icons-vue'
import FileBubble from './FileBubble.vue'

const props = defineProps({
  role: { type: String, required: true },
  content: { type: String, default: '' },
  thinking: { type: String, default: '' },
  streaming: { type: Boolean, default: false },
  file: { type: Object, default: null },
  avatarUrl: { type: String, default: '' }
})

const thinkExpanded = ref(false)
const avatarError = ref(false)

const renderedContent = computed(() => {
  return props.content
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
})

const renderedThink = computed(() => {
  return props.thinking
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
})
</script>

<style scoped>
.message-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  max-width: 85%;
}
.message-wrapper.user {
  margin-left: auto;
  flex-direction: row-reverse;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.message-wrapper.user .avatar {
  background: var(--accent);
  color: #1e1e2e;
}
.message-wrapper.assistant .avatar {
  background: var(--bg-hover);
  color: var(--accent);
}
.avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.message-content {
  display: flex;
  flex-direction: column;
}
.bubble {
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.6;
  word-break: break-word;
  background: var(--bg-message-user);
  color: var(--text-primary);
}
.message-wrapper.user .bubble {
  background: var(--bg-message-user);
  border-bottom-right-radius: 4px;
}
.message-wrapper.assistant .bubble {
  background: var(--bg-message-ai);
  border-bottom-left-radius: 4px;
  border: 1px solid var(--border-color);
}
.message-wrapper.streaming .bubble::after {
  content: '▋';
  animation: blink 1s infinite;
  color: var(--accent);
}
@keyframes blink {
  50% { opacity: 0; }
}

/* 思考过程 */
.think-block {
  margin-bottom: 8px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  background: var(--bg-secondary);
}
.think-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: var(--text-muted);
  transition: background 0.2s;
}
.think-header:hover {
  background: var(--bg-hover);
}
.think-icon {
  transition: transform 0.2s;
  flex-shrink: 0;
}
.think-label {
  flex: 1;
}
.think-toggle {
  font-size: 12px;
  color: var(--accent);
}
.think-body {
  padding: 8px 12px 12px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  border-top: 1px solid var(--border-color);
  white-space: pre-wrap;
  word-break: break-word;
}

/* 有思考过程的回复气泡 */
.bubble.has-thinking {
  border-top-left-radius: 4px;
}

/* 思考中占位 */
.thinking-placeholder {
  background: var(--bg-message-ai) !important;
  border: 1px solid var(--border-color);
  border-bottom-left-radius: 4px;
  min-width: 100px;
}
.loading-dots::after {
  content: '';
  animation: dots 1.5s infinite;
}
@keyframes dots {
  0%   { content: ''; }
  25%  { content: '.'; }
  50%  { content: '..'; }
  75%  { content: '...'; }
}
</style>
