<script setup>
import { computed } from 'vue'

const props = defineProps({
  balance: { type: Number, default: 0 }
})

const hours = computed(() => Math.floor(props.balance / 60))
const mins = computed(() => Math.floor(props.balance % 60))
const mainDisplay = computed(() => {
  const m = Math.floor(props.balance)
  return m.toLocaleString('zh-CN')
})
</script>

<template>
  <div class="keep-gradient rounded-3xl p-6 text-white keep-shadow-lg relative overflow-hidden">
    <!-- 装饰圆 -->
    <div class="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full"></div>
    <div class="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full"></div>

    <div class="relative">
      <div class="flex items-center justify-between mb-2">
        <div class="text-sm text-white/80 flex items-center gap-1">
          <span>💰</span>
          <span>我的时间余额</span>
        </div>
        <div class="text-xs text-white/70 bg-white/15 px-2 py-1 rounded-full">
          每日 +1% 利息
        </div>
      </div>

      <div class="flex items-baseline gap-2 mt-4">
        <span class="text-6xl font-black tracking-tight leading-none">{{ mainDisplay }}</span>
        <span class="text-2xl font-bold">分钟</span>
      </div>

      <div class="mt-3 text-white/80 text-sm">
        约 {{ hours }} 小时 {{ mins }} 分钟可玩
      </div>
    </div>
  </div>
</template>
