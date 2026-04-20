<script setup>
import { ref } from 'vue'
import { useBalance } from '../composables/useBalance.js'

const { addBonus } = useBalance()

const minutes = ref('')
const description = ref('')
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const stars = ref([])

function spawnStars() {
  const arr = []
  for (let i = 0; i < 6; i++) {
    arr.push({
      id: Date.now() + i,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 0.4,
      emoji: ['⭐', '🌟', '✨', '💫'][i % 4]
    })
  }
  stars.value = arr
  setTimeout(() => (stars.value = []), 1800)
}

async function submit() {
  errorMsg.value = ''
  successMsg.value = ''
  const n = Number(minutes.value)
  if (!(n > 0)) {
    errorMsg.value = '请输入奖励分钟数'
    return
  }
  submitting.value = true
  try {
    const added = await addBonus({ minutes: n, description: description.value })
    successMsg.value = `奖励 ${added} 分钟游戏时间 🎁`
    spawnStars()
    minutes.value = ''
    description.value = ''
  } catch (e) {
    errorMsg.value = e.message || '添加失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl p-5 keep-shadow relative overflow-hidden">
    <div v-for="s in stars" :key="s.id"
         class="star-pop"
         :style="{ left: s.left + '%', top: '40%', animationDelay: s.delay + 's' }">
      {{ s.emoji }}
    </div>

    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span>🎁</span>
      <span>奖励时间</span>
    </h3>

    <label class="block text-sm text-gray-500 mb-1">奖励分钟数</label>
    <input type="number" inputmode="numeric" min="0" step="1" v-model="minutes" placeholder="比如 30" />

    <label class="block text-sm text-gray-500 mb-1 mt-4">备注</label>
    <textarea v-model="description" rows="2" placeholder="比如：完成作业奖励30分钟"></textarea>

    <div v-if="successMsg" class="mt-3 text-center text-keep-green font-semibold text-sm">{{ successMsg }}</div>
    <div v-if="errorMsg" class="mt-3 text-center text-red-500 text-sm">{{ errorMsg }}</div>

    <button
      @click="submit"
      :disabled="submitting"
      class="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold py-4 rounded-2xl text-lg btn-press mt-4 disabled:opacity-60"
    >
      {{ submitting ? '添加中...' : '🌟 添加奖励' }}
    </button>
  </div>
</template>
