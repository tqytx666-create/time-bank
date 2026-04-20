<script setup>
import { computed } from 'vue'
import { useBalance } from '../composables/useBalance.js'

const { transactions, loading } = useBalance()

const TYPE_META = {
  deposit: { icon: '🏃', label: '运动存入', color: 'text-keep-green', bg: 'bg-green-50', sign: '+' },
  withdraw: { icon: '🎮', label: '游戏使用', color: 'text-red-500', bg: 'bg-red-50', sign: '-' },
  bonus: { icon: '🎁', label: '奖励时间', color: 'text-amber-600', bg: 'bg-amber-50', sign: '+' },
  interest: { icon: '💎', label: '每日利息', color: 'text-blue-500', bg: 'bg-blue-50', sign: '+' }
}

function fmtTime(iso) {
  const d = new Date(iso)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return sameDay ? `今天 ${hh}:${mi}` : `${mm}-${dd} ${hh}:${mi}`
}

function exerciseLabel(t) {
  if (t.type !== 'deposit') return ''
  if (t.exercise_type === 'badminton') return `🏸 羽毛球 ${t.exercise_minutes}min`
  return `🏃 其他运动 ${t.exercise_minutes}min`
}

const grouped = computed(() => {
  const map = new Map()
  for (const t of transactions.value) {
    const d = new Date(t.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(t)
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
})

function groupTitle(dateStr) {
  const today = new Date()
  const y = today.getFullYear()
  const m = String(today.getMonth() + 1).padStart(2, '0')
  const d = String(today.getDate()).padStart(2, '0')
  const todayStr = `${y}-${m}-${d}`
  if (dateStr === todayStr) return '今天'
  const yesterday = new Date(today.getTime() - 86400000)
  const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (dateStr === yStr) return '昨天'
  const parts = dateStr.split('-')
  return `${parts[1]}月${parts[2]}日`
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="loading" class="text-center text-gray-400 py-10">加载中...</div>
    <div v-else-if="transactions.length === 0" class="text-center text-gray-400 py-16">
      <div class="text-5xl mb-3">📭</div>
      <div>还没有任何记录</div>
      <div class="text-xs mt-1">去运动一下，存点时间吧～</div>
    </div>
    <div v-else v-for="group in grouped" :key="group.date">
      <div class="text-sm text-gray-400 font-semibold mb-2 px-2">{{ groupTitle(group.date) }}</div>
      <div class="bg-white rounded-2xl keep-shadow overflow-hidden">
        <div v-for="(t, idx) in group.items" :key="t.id"
             class="flex items-center gap-3 p-4"
             :class="idx !== group.items.length - 1 ? 'border-b border-gray-50' : ''">
          <div :class="['w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0', TYPE_META[t.type].bg]">
            {{ TYPE_META[t.type].icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-semibold text-gray-900">{{ TYPE_META[t.type].label }}</span>
              <span v-if="exerciseLabel(t)" class="text-xs text-gray-400">{{ exerciseLabel(t) }}</span>
            </div>
            <div class="text-xs text-gray-400 mt-0.5 truncate">
              {{ fmtTime(t.created_at) }}<span v-if="t.description"> · {{ t.description }}</span>
            </div>
          </div>
          <div :class="['font-black text-lg tabular-nums', TYPE_META[t.type].color]">
            {{ TYPE_META[t.type].sign }}{{ t.screen_minutes }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
