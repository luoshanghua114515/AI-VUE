import request from './request'

export function loginApi(userName, password) {
  return request.post('/user/login', { userName, password })
}
