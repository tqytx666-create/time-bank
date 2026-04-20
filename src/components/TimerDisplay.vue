<script setup>
import { computed, ref, watch } from 'vue'
import { useTimer } from '../composables/useTimer.js'
import { useBalance } from '../composables/useBalance.js'

const { running, elapsedSec, mm, ss, start, stop } = useTimer()
const { balance, withdraw } = useBalance()

const confirming = ref(false)
const justUsed = ref(null)
const errorMsg = ref('')

// 剩余分钟 = 余额 - 本次已用分钟（向上取整）
const usedMinutes = computed(() => Math.ceil(elapsedSec.value / 60))
const remainingBalance = computed(() => {
  if (!running.value) return Math.floor(balance.value)
  return Math.max(0, Math.floor(balance.value) - usedMinutes.value)
})

// 进度圈（以当前余额为1周 60min）
const progressSec = computed(() => elapsedSec.value % 60)
const progressPct = computed(() => (progressSec.value / 60) * 100)

const circumference = 2 * Math.PI * 120
const dashOffset = computed(() => circumference - (progressPct.value / 100) * circumference)

async function handleStart() {
  errorMsg.value = ''
  if (balance.value < 1) {
    errorMsg.value = '余额不足 1 分钟，不能开始哦～'
    return
  }
  start()
  justUsed.value = null
}

async function handleStop() {
  const { seconds, startedAt } = stop()
  if (seconds <= 0) return
  try {
    const mins = await withdraw({ seconds, startedAt })
    justUsed.value = { seconds, mins }
  } catch (e) {
    errorMsg.value = e.message || '扣减失败，再试一次'
  }
}

// 倒计时器低余额警告
watch([running, balance], () => {
  if (running.value && balance.value - usedMinutes.value <= 1) {
    // 余额快用完
  }
})
</script>

<template>
  <div class="bg-white rounded-3xl p-6 keep-shadow">
    <div class="flex items-center justify-between mb-4">
      <div class="text-gray-500 text-sm">⏱️ 游戏计时</div>
      <div v-if="running" class="flex items-center gap-1 text-keep-green text-sm font-semibold">
        <span class="w-2 h-2 bg-keep-green rounded-full animate-ping"></span>
        使用中
      </div>
    </div>

    <!-- 大圆盘 -->
    <div class="flex items-center justify-center my-4">
      <div class="relative w-64 h-64">
        <svg class="w-full h-full -rotate-90" viewBox="0 0 260 260">
          <circle cx="130" cy="130" r="120" fill="none" stroke="#f1f5f9" stroke-width="12" />
          <circle
            cx="130" cy="130" r="120" fill="none"
            :stroke="running ? '#2ecc71' : '#d1fae5'"
            stroke-width="12"
            stroke-linecap="round"
            :stroke-dasharray="circumference"
            :stroke-dashoffset="running ? dashOffset : 0"
            class="transition-all duration-300"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div v-if="running" class="text-5xl font-black text-gray-900 tabular-nums tick">
            {{ mm }}:{{ ss }}
          </div>
          <div v-else class="text-5xl font-black text-gray-900">
            00:00
          </div>
          <div class="text-sm text-gray-400 mt-1">
            {{ running ? '本次已用' : '准备开始' }}
          </div>
          <div class="mt-3 px-3 py-1 rounded-full bg-green-50 text-keep-green text-xs font-semibold">
            剩余 {{ remainingBalance }} 分钟
          </div>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMsg" class="text-center text-sm text-red-500 mb-3">{{ errorMsg }}</div>

    <!-- 使用完成 -->
    <div v-if="justUsed && !running" class="text-center bg-green-50 rounded-2xl p-3 mb-3">
      <div class="text-keep-green font-semibold">本次使用 {{ justUsed.mins }} 分钟（{{ justUsed.seconds }} 秒）</div>
    </div>

    <!-- 按钮 -->
    <button
      v-if="!running"
      @click="handleStart"
      class="w-full keep-gradient text-white font-bold py-4 rounded-2xl text-lg btn-press keep-shadow"
    >
      ▶️ 开始使用
    </button>
    <button
      v-else
      @click="handleStop"
      class="w-full bg-red-500 text-white font-bold py-4 rounded-2xl text-lg btn-press"
    >
      ⏹️ 结束使用
    </button>

    <div class="text-center text-xs text-gray-400 mt-3">
      每 60 秒算 1 分钟（不足 1 分钟向上取整）
    </div>
  </div>
</template>
