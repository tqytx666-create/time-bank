<script setup>
import { ref, computed } from 'vue'
import { useBalance } from '../composables/useBalance.js'

const { deposit } = useBalance()

const exerciseType = ref('badminton')
const minutes = ref('')
const description = ref('')
const submitting = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const coins = ref([])

const preview = computed(() => {
  const n = Number(minutes.value)
  if (!n || n <= 0) return 0
  return exerciseType.value === 'badminton' ? n * 2 : n
})

function spawnCoins() {
  const arr = []
  for (let i = 0; i < 8; i++) {
    arr.push({
      id: Date.now() + i,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 0.3,
      emoji: ['🪙', '💰', '⭐', '✨'][i % 4]
    })
  }
  coins.value = arr
  setTimeout(() => (coins.value = []), 1500)
}

async function submit() {
  errorMsg.value = ''
  successMsg.value = ''
  const n = Number(minutes.value)
  if (!(n > 0)) {
    errorMsg.value = '请输入运动分钟数'
    return
  }
  submitting.value = true
  try {
    const gained = await deposit({
      exerciseType: exerciseType.value,
      exerciseMinutes: n,
      description: description.value
    })
    successMsg.value = `存入成功！获得 ${gained} 分钟游戏时间 🎉`
    spawnCoins()
    minutes.value = ''
    description.value = ''
  } catch (e) {
    errorMsg.value = e.message || '存入失败'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-3xl p-5 keep-shadow relative overflow-hidden">
    <!-- 金币掉落 -->
    <div v-for="c in coins" :key="c.id"
         class="coin"
         :style="{ left: c.left + '%', top: '30%', animationDelay: c.delay + 's' }">
      {{ c.emoji }}
    </div>

    <h3 class="text-lg font-bold mb-4 flex items-center gap-2">
      <span>🏸</span>
      <span>存时间（运动换游戏）</span>
    </h3>

    <!-- 运动类型选择 -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <button
        type="button"
        @click="exerciseType = 'badminton'"
        :class="[
          'py-3 rounded-2xl font-semibold btn-press border-2 transition',
          exerciseType === 'badminton'
            ? 'border-keep-green bg-green-50 text-keep-green'
            : 'border-gray-200 bg-white text-gray-500'
        ]"
      >
        🏸 羽毛球课<br><span class="text-xs font-normal">1 分钟 = 2 分钟</span>
      </button>
      <button
        type="button"
        @click="exerciseType = 'other'"
        :class="[
          'py-3 rounded-2xl font-semibold btn-press border-2 transition',
          exerciseType === 'other'
            ? 'border-keep-green bg-green-50 text-keep-green'
            : 'border-gray-200 bg-white text-gray-500'
        ]"
      >
        🏃 其他运动<br><span class="text-xs font-normal">1 分钟 = 1 分钟</span>
      </button>
    </div>

    <label class="block text-sm text-gray-500 mb-1">运动时长（分钟）</label>
    <input type="number" inputmode="numeric" min="0" step="1" v-model="minutes" placeholder="比如 60" />

    <!-- 换算预览 -->
    <div v-if="preview > 0" class="mt-3 p-3 bg-green-50 rounded-2xl text-center">
      <span class="text-sm text-gray-500">将获得</span>
      <span class="text-2xl font-black text-keep-green mx-2">{{ preview }}</span>
      <span class="text-sm text-gray-500">分钟游戏时间</span>
    </div>

    <label class="block text-sm text-gray-500 mb-1 mt-4">备注（可选）</label>
    <textarea v-model="description" rows="2" placeholder="比如：今天上了 60 分钟羽毛球课"></textarea>

    <div v-if="successMsg" class="mt-3 text-center text-keep-green font-semibold text-sm">{{ successMsg }}</div>
    <div v-if="errorMsg" class="mt-3 text-center text-red-500 text-sm">{{ errorMsg }}</div>

    <button
      @click="submit"
      :disabled="submitting"
      class="w-full keep-gradient text-white font-bold py-4 rounded-2xl text-lg btn-press keep-shadow mt-4 disabled:opacity-60"
    >
      {{ submitting ? '存入中...' : '💰 存入时间' }}
    </button>
  </div>
</template>
