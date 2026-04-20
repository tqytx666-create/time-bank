import { ref, computed, onUnmounted } from 'vue'

export function useTimer() {
  const running = ref(false)
  const startedAt = ref(0)
  const elapsedSec = ref(0)
  let handle = null

  function tick() {
    if (!running.value) return
    elapsedSec.value = Math.floor((Date.now() - startedAt.value) / 1000)
  }

  function start() {
    if (running.value) return
    running.value = true
    startedAt.value = Date.now()
    elapsedSec.value = 0
    handle = setInterval(tick, 250)
  }

  function stop() {
    if (!running.value) return { seconds: 0, startedAt: 0 }
    running.value = false
    if (handle) {
      clearInterval(handle)
      handle = null
    }
    const sec = Math.floor((Date.now() - startedAt.value) / 1000)
    const start = startedAt.value
    elapsedSec.value = 0
    startedAt.value = 0
    return { seconds: sec, startedAt: start }
  }

  onUnmounted(() => {
    if (handle) clearInterval(handle)
  })

  const mm = computed(() => String(Math.floor(elapsedSec.value / 60)).padStart(2, '0'))
  const ss = computed(() => String(elapsedSec.value % 60).padStart(2, '0'))

  return { running, elapsedSec, mm, ss, start, stop, startedAt }
}
