<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBalance } from './composables/useBalance.js'
import BalanceCard from './components/BalanceCard.vue'
import TimerDisplay from './components/TimerDisplay.vue'
import DepositForm from './components/DepositForm.vue'
import BonusForm from './components/BonusForm.vue'
import TransactionList from './components/TransactionList.vue'

const PASSWORD = 'xiaoyu2026'
const LS_KEY = 'timebank_admin_ok'

const { balance, loadAll, loading, error } = useBalance()

const tab = ref('home') // home | records | admin

const isAdmin = ref(localStorage.getItem(LS_KEY) === '1')
const pwdInput = ref('')
const pwdError = ref('')

function tryLogin() {
  pwdError.value = ''
  if (pwdInput.value === PASSWORD) {
    isAdmin.value = true
    localStorage.setItem(LS_KEY, '1')
    pwdInput.value = ''
  } else {
    pwdError.value = '密码不对哦'
  }
}

function logout() {
  isAdmin.value = false
  localStorage.removeItem(LS_KEY)
}

onMounted(() => {
  loadAll()
})

const tabs = [
  { id: 'home', label: '首页', icon: '🏠' },
  { id: 'records', label: '记录', icon: '📒' },
  { id: 'admin', label: '管理', icon: '⚙️' }
]
</script>

<template>
  <div class="min-h-[100dvh] pb-40 safe-bottom overflow-x-hidden">
    <!-- 顶部渐变头 -->
    <div class="keep-gradient px-5 pt-12 pb-8 text-white relative overflow-hidden">
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
      <div class="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full"></div>
      <div class="relative">
        <div class="text-xs text-white/80">STAR · TIME · BANK</div>
        <h1 class="text-2xl font-black mt-1">⭐ 星晨时间银行</h1>
        <div class="text-sm text-white/80 mt-1">运动存时间 · 游戏花时间</div>
      </div>
    </div>

    <!-- 内容区（向上覆盖头部） -->
    <div class="px-4 -mt-6 relative z-10">

      <!-- 错误条 -->
      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-2xl mb-3">
        {{ error }}
      </div>

      <!-- 首页 -->
      <div v-if="tab === 'home'" class="space-y-4">
        <BalanceCard :balance="balance" />
        <TimerDisplay />

        <!-- 小科普 -->
        <div class="bg-white rounded-2xl p-4 keep-shadow">
          <div class="text-sm text-gray-500 flex items-center gap-1 mb-2">
            <span>💡</span>
            <span>小知识</span>
          </div>
          <div class="text-sm text-gray-700 leading-relaxed">
            每天晚上银行会给你的余额发 <span class="text-keep-green font-bold">1% 利息</span>。
            余额越多，利息越多，存着不花更划算哦～
          </div>
        </div>
      </div>

      <!-- 记录 -->
      <div v-else-if="tab === 'records'">
        <TransactionList />
      </div>

      <!-- 管理 -->
      <div v-else-if="tab === 'admin'">
        <div v-if="!isAdmin" class="bg-white rounded-3xl p-6 keep-shadow text-center">
          <div class="text-5xl mb-3">🔒</div>
          <div class="text-lg font-bold mb-2">管理员入口</div>
          <div class="text-sm text-gray-500 mb-4">请输入密码（老王专用）</div>
          <input type="password" v-model="pwdInput" @keyup.enter="tryLogin" placeholder="密码" class="text-center" />
          <div v-if="pwdError" class="text-red-500 text-sm mt-2">{{ pwdError }}</div>
          <button @click="tryLogin" class="w-full keep-gradient text-white font-bold py-3 rounded-2xl mt-4 btn-press">
            登录
          </button>
        </div>
        <div v-else class="space-y-4">
          <div class="flex justify-between items-center px-2">
            <div class="text-sm text-gray-500">👋 老王，欢迎</div>
            <button @click="logout" class="text-xs text-gray-400 underline">退出管理</button>
          </div>
          <DepositForm />
          <BonusForm />
        </div>
      </div>
    </div>

    <!-- 底部 Tab 导航 -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-bottom z-20">
      <div class="max-w-[640px] mx-auto flex">
        <button
          v-for="t in tabs" :key="t.id"
          @click="tab = t.id"
          :class="[
            'flex-1 py-3 flex flex-col items-center gap-0.5 btn-press transition',
            tab === t.id ? 'text-keep-green' : 'text-gray-400'
          ]"
        >
          <span class="text-xl">{{ t.icon }}</span>
          <span class="text-xs font-semibold">{{ t.label }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
