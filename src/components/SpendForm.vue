<script setup>
import { ref } from 'vue'
import { useBalance } from '../composables/useBalance.js'

const { balance, withdrawDirect } = useBalance()

const minutes = ref('')
const description = ref('')
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

async function submit() {
  errorMsg.value = ''
  successMsg.value = ''
  const n = Number(minutes.value)
  if (!(n > 0)) {
    errorMsg.value = '请输入要使用的分钟数'
    return
  }
  if (n > Math.floor(balance.value)) {
    errorMsg.value = `余额不足，当前只有 ${Math.floor(balance.value)} 分钟`
    return
  }
  submitting.value = true
  try {
    const mins = await withdrawDirect({ minutes: n, description: description.value })
    successMsg.value = `扣除成功！使用 ${mins} 分钟 ⏱️`
    minutes.value = ''
    description.value = ''
  } catch (e) {
    errorMsg.value = e.message || '扣除失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl p-5 keep-shadow">
    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span>🎮</span>
      <span>取时间</span>
    </h3>

    <div class="flex items-center justify-center mb-4 px-4 py-3 bg-green-50 rounded-2xl">
      <span class="text-sm text-gray-500">当前余额</span>
      <span class="text-3xl font-black text-keep-green mx-3 tabular-nums">{{ Math.floor(balance) }}</span>
      <span class="text-sm text-gray-500">分钟</span>
    </div>

    <label class="block text-sm text-gray-500 mb-1">使用多少分钟</label>
    <input type="number" inputmode="numeric" min="1" step="1" v-model="minutes" placeholder="比如 30" />

    <label class="block text-sm text-gray-500 mb-1 mt-4">备注（可选）</label>
    <textarea v-model="description" rows="2" placeholder="比如：英语没学好，惩罚30分钟"></textarea>

    <div v-if="successMsg" class="mt-3 text-center text-keep-green font-semibold text-sm">{{ successMsg }}</div>
    <div v-if="errorMsg" class="mt-3 text-center text-red-500 text-sm">{{ errorMsg }}</div>

    <button
      @click="submit"
      :disabled="submitting"
      class="w-full keep-gradient text-white font-bold py-4 rounded-2xl text-lg btn-press keep-shadow mt-4 disabled:opacity-60"
    >
      {{ submitting ? '扣除中...' : '🎮 扣除时间' }}
    </button>
  </div>
</template>
