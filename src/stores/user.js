import { defineStore } from 'pinia'
import { ref } from 'vue'
import { loginApi } from '@/api/user'
import { ElMessage } from 'element-plus'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userName = ref(localStorage.getItem('userName') || '')

  async function login(userNameInput, password) {
    const res = await loginApi(userNameInput, password)
    if (res.data.status === 1) {
      token.value = res.data.token
      userName.value = userNameInput
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('userName', userNameInput)
      return true
    } else {
      ElMessage.error(res.data.msg || '登录失败')
      return false
    }
  }

  function logout() {
    token.value = ''
    userName.value = ''
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
  }

  return { token, userName, login, logout }
})
