import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase.js'

const DAILY_RATE = 0.01

const balance = ref(0)
const lastInterestDate = ref(null)
const transactions = ref([])
const loading = ref(false)
const error = ref('')

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(fromStr, toStr) {
  const a = new Date(fromStr + 'T00:00:00')
  const b = new Date(toStr + 'T00:00:00')
  return Math.round((b - a) / 86400000)
}

async function ensureBalanceRow() {
  const { data, error: e } = await supabase
    .from('balance')
    .select('*')
    .eq('id', 1)
    .maybeSingle()
  if (e) throw e
  if (!data) {
    const { data: ins, error: e2 } = await supabase
      .from('balance')
      .insert({ id: 1, current_balance: 0, last_interest_date: todayStr() })
      .select()
      .single()
    if (e2) throw e2
    return ins
  }
  return data
}

export async function loadAll() {
  loading.value = true
  error.value = ''
  try {
    const row = await ensureBalanceRow()
    balance.value = Number(row.current_balance) || 0
    lastInterestDate.value = row.last_interest_date
    await settleInterestIfNeeded()
    await loadTransactions()
  } catch (e) {
    error.value = e.message || '加载失败'
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadTransactions() {
  const { data, error: e } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (e) throw e
  transactions.value = data || []
}

async function settleInterestIfNeeded() {
  const today = todayStr()
  if (!lastInterestDate.value) {
    lastInterestDate.value = today
    await supabase.from('balance').update({ last_interest_date: today }).eq('id', 1)
    return
  }
  const days = daysBetween(lastInterestDate.value, today)
  if (days <= 0) return

  let bal = Number(balance.value)
  const toInsert = []
  const cursor = new Date(lastInterestDate.value + 'T00:00:00')
  for (let i = 0; i < days; i++) {
    cursor.setDate(cursor.getDate() + 1)
    const interest = Math.round(bal * DAILY_RATE * 100) / 100
    if (interest > 0) {
      bal = Math.round((bal + interest) * 100) / 100
      const yy = cursor.getFullYear()
      const mm = String(cursor.getMonth() + 1).padStart(2, '0')
      const dd = String(cursor.getDate()).padStart(2, '0')
      const dateStr = `${yy}-${mm}-${dd}`
      toInsert.push({
        type: 'interest',
        screen_minutes: interest,
        description: `${dateStr} 每日1%利息`,
        created_at: new Date(cursor.getTime()).toISOString()
      })
    }
  }
  if (toInsert.length > 0) {
    const { error: e1 } = await supabase.from('transactions').insert(toInsert)
    if (e1) throw e1
  }
  const { error: e2 } = await supabase
    .from('balance')
    .update({ current_balance: bal, last_interest_date: today })
    .eq('id', 1)
  if (e2) throw e2
  balance.value = bal
  lastInterestDate.value = today
}

export async function deposit({ exerciseType, exerciseMinutes, description }) {
  const ratio = exerciseType === 'badminton' ? 2 : 1
  const screen = Math.round(Number(exerciseMinutes) * ratio * 100) / 100
  if (!(screen > 0)) throw new Error('运动时长必须大于0')
  const newBal = Math.round((Number(balance.value) + screen) * 100) / 100
  const { error: e1 } = await supabase.from('transactions').insert({
    type: 'deposit',
    exercise_type: exerciseType,
    exercise_minutes: Number(exerciseMinutes),
    screen_minutes: screen,
    description: description || null
  })
  if (e1) throw e1
  const { error: e2 } = await supabase
    .from('balance')
    .update({ current_balance: newBal })
    .eq('id', 1)
  if (e2) throw e2
  balance.value = newBal
  await loadTransactions()
  return screen
}

export async function addBonus({ minutes, description }) {
  const add = Math.round(Number(minutes) * 100) / 100
  if (!(add > 0)) throw new Error('奖励时间必须大于0')
  const newBal = Math.round((Number(balance.value) + add) * 100) / 100
  const { error: e1 } = await supabase.from('transactions').insert({
    type: 'bonus',
    screen_minutes: add,
    description: description || null
  })
  if (e1) throw e1
  const { error: e2 } = await supabase
    .from('balance')
    .update({ current_balance: newBal })
    .eq('id', 1)
  if (e2) throw e2
  balance.value = newBal
  await loadTransactions()
  return add
}

export async function withdraw({ seconds, startedAt }) {
  const minutes = Math.ceil(seconds / 60)
  if (minutes <= 0) return 0
  const newBal = Math.round((Number(balance.value) - minutes) * 100) / 100
  const { error: e1 } = await supabase.from('transactions').insert({
    type: 'withdraw',
    screen_minutes: minutes,
    description: `使用 ${minutes} 分钟（实际${seconds}秒）`,
    created_at: startedAt ? new Date(startedAt).toISOString() : new Date().toISOString(),
    ended_at: new Date().toISOString()
  })
  if (e1) throw e1
  const { error: e2 } = await supabase
    .from('balance')
    .update({ current_balance: newBal })
    .eq('id', 1)
  if (e2) throw e2
  balance.value = newBal
  await loadTransactions()
  return minutes
}

export function useBalance() {
  return {
    balance,
    transactions,
    loading,
    error,
    lastInterestDate,
    balanceMinutes: computed(() => Math.floor(Number(balance.value))),
    balanceSeconds: computed(() => Math.round((Number(balance.value) % 1) * 60)),
    loadAll,
    deposit,
    addBonus,
    withdraw
  }
}
