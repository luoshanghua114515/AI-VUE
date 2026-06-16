<template>
  <div class="chat-input-wrapper">
    <div class="input-container">
      <el-button
        class="upload-btn"
        :icon="Paperclip"
        circle
        @click="triggerUpload"
        :disabled="disabled"
      />
      <input
        ref="fileInputRef"
        type="file"
        accept=".pdf,application/pdf"
        style="display: none"
        @change="handleFileSelected"
      />
      <el-input
        v-model="messageText"
        type="textarea"
        :rows="1"
        placeholder="输入消息..."
        :disabled="disabled"
        @keydown.enter.prevent="handleSend"
        resize="none"
        class="chat-input-field"
      />
      <el-button
        type="primary"
        :icon="Promotion"
        circle
        @click="handleSend"
        :loading="disabled"
        :disabled="disabled"
      />
    </div>
    <div v-if="selectedFile" class="file-preview">
      <el-tag closable @close="clearFile" type="info">
        📄 {{ selectedFile.name }}
      </el-tag>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Paperclip, Promotion } from '@element-plus/icons-vue'

const emit = defineEmits(['send', 'upload'])
const props = defineProps({
  disabled: { type: Boolean, default: false }
})

const messageText = ref('')
const selectedFile = ref(null)
const fileInputRef = ref(null)

function triggerUpload() {
  fileInputRef.value?.click()
}

function handleFileSelected(e) {
  const file = e.target.files[0]
  if (file) {
    if (file.type !== 'application/pdf') {
      ElMessage.warning('仅支持 PDF 格式文件')
      return
    }
    selectedFile.value = file
    emit('upload', file)
  }
  e.target.value = ''
}

function clearFile() {
  selectedFile.value = null
}

function handleSend() {
  const text = messageText.value.trim()
  if (!text && !selectedFile.value) return
  emit('send', { text, file: selectedFile.value })
  messageText.value = ''
  selectedFile.value = null
}
</script>

<style scoped>
.chat-input-wrapper {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}
.input-container {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.upload-btn {
  flex-shrink: 0;
}
.chat-input-field {
  flex: 1;
}
.chat-input-field :deep(.el-textarea__inner) {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 12px !important;
  padding: 10px 14px !important;
  min-height: 40px !important;
  max-height: 120px !important;
  resize: none !important;
}
.chat-input-field :deep(.el-textarea__inner:focus) {
  border-color: var(--accent) !important;
}
.chat-input-field :deep(.el-textarea__inner::placeholder) {
  color: var(--text-muted);
}
.file-preview {
  margin-top: 8px;
}
</style>
