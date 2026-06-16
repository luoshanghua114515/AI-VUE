<template>
  <div class="file-bubble">
    <div class="file-icon">
      <el-icon :size="24"><Document /></el-icon>
    </div>
    <div class="file-info">
      <div class="file-name">{{ fileName }}</div>
      <div class="file-size">{{ fileSize }}</div>
    </div>
    <el-icon class="file-status" :color="statusColor"><CircleCheckFilled /></el-icon>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Document, CircleCheckFilled } from '@element-plus/icons-vue'

const props = defineProps({
  fileName: { type: String, required: true },
  fileSize: { type: String, default: '' },
  status: { type: String, default: 'success' }
})

const statusColor = computed(() => {
  return props.status === 'success' ? 'var(--success)' : 'var(--danger)'
})
</script>

<style scoped>
.file-bubble {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-top: 6px;
}
.file-icon {
  flex-shrink: 0;
  color: var(--accent);
}
.file-info {
  flex: 1;
  min-width: 0;
}
.file-name {
  font-size: 13px;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.file-size {
  font-size: 11px;
  color: var(--text-muted);
}
.file-status {
  flex-shrink: 0;
}
</style>
