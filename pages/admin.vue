<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- ───────────── Password gate ───────────── -->
    <div v-if="!unlocked" class="min-h-screen flex items-center justify-center p-6">
      <UCard class="max-w-sm w-full">
        <div class="text-center mb-5">
          <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <UIcon name="i-heroicons-lock-closed" class="h-6 w-6 text-gray-400" />
          </div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">Admin access</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">Enter the password to view submissions.</p>
        </div>
        <form @submit.prevent="unlock()">
          <UInput v-model="password" type="password" placeholder="Password" autofocus class="w-full" :disabled="loading" />
          <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
          <UButton type="submit" block class="mt-4" :loading="loading">Unlock</UButton>
        </form>
      </UCard>
    </div>

    <!-- ───────────── Dashboard ───────────── -->
    <div v-else class="max-w-6xl mx-auto p-6">
      <!-- Detail view -->
      <template v-if="selected">
        <div class="flex items-center justify-between mb-6">
          <UButton variant="ghost" color="neutral" @click="selected = null">
            <template #leading><UIcon name="i-heroicons-arrow-left" class="h-4 w-4" /></template>
            Back to submissions
          </UButton>
          <span class="text-sm text-gray-400">{{ fmtDate(selected.createdAt) }}</span>
        </div>

        <!-- 1. Author -->
        <UCard class="mb-6">
          <template #header>
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">1 · Author</h2>
          </template>
          <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div><dt class="text-gray-400">Name</dt><dd class="text-gray-900 dark:text-white font-medium">{{ selected.author?.name || '—' }}</dd></div>
            <div><dt class="text-gray-400">University</dt><dd class="text-gray-900 dark:text-white">{{ selected.author?.university || '—' }}</dd></div>
            <div>
              <dt class="text-gray-400">GitHub</dt>
              <dd><a v-if="selected.author?.github" :href="ghUrl(selected.author.github)" target="_blank" rel="noopener" class="text-primary-600 dark:text-primary-400 hover:underline">{{ selected.author.github }}</a><span v-else>—</span></dd>
            </div>
            <div>
              <dt class="text-gray-400">Research profile</dt>
              <dd><a v-if="selected.author?.researchProfile" :href="selected.author.researchProfile" target="_blank" rel="noopener" class="text-primary-600 dark:text-primary-400 hover:underline truncate inline-block max-w-full align-bottom">{{ selected.author.researchProfile }}</a><span v-else>—</span></dd>
            </div>
            <div class="sm:col-span-2">
              <dt class="text-gray-400">Areas of expertise</dt>
              <dd class="flex flex-wrap gap-1.5 mt-1">
                <UBadge v-for="t in (selected.author?.expertise ?? [])" :key="t" color="neutral" variant="subtle">{{ t }}</UBadge>
                <span v-if="!(selected.author?.expertise ?? []).length">—</span>
              </dd>
            </div>
            <div class="sm:col-span-2" v-if="selected.author?.publications">
              <dt class="text-gray-400">Publications</dt>
              <dd class="whitespace-pre-wrap text-gray-700 dark:text-gray-200">{{ selected.author.publications }}</dd>
            </div>
            <div v-if="selected.author?.cv"><dt class="text-gray-400">CV</dt><dd class="text-gray-700 dark:text-gray-200">{{ selected.author.cv }}</dd></div>
          </dl>
        </UCard>

        <!-- 2. Responses -->
        <UCard class="mb-6">
          <template #header>
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">2 · Course responses</h2>
          </template>
          <div class="space-y-4 text-sm">
            <div><p class="text-gray-400 mb-1">Course title</p><p class="text-gray-900 dark:text-white font-medium">{{ selected.answers?.title || '—' }}</p></div>
            <div>
              <p class="text-gray-400 mb-1">Topics</p>
              <div class="flex flex-wrap gap-1.5"><UBadge v-for="t in (selected.answers?.topics ?? [])" :key="t" color="primary" variant="subtle">{{ t }}</UBadge><span v-if="!(selected.answers?.topics ?? []).length">—</span></div>
            </div>
            <div>
              <p class="text-gray-400 mb-1">Students</p>
              <div class="flex flex-wrap gap-1.5"><UBadge v-for="t in (selected.answers?.students ?? [])" :key="t" color="neutral" variant="subtle">{{ t }}</UBadge><span v-if="!(selected.answers?.students ?? []).length">—</span></div>
            </div>
            <div><p class="text-gray-400 mb-1">Duration</p><p class="text-gray-700 dark:text-gray-200">{{ durationLabel(selected.answers) }}</p></div>
            <div>
              <p class="text-gray-400 mb-1">Prerequisites</p>
              <ol v-if="(selected.answers?.prerequisites ?? []).length" class="list-decimal list-inside text-gray-700 dark:text-gray-200"><li v-for="(p, i) in selected.answers.prerequisites" :key="i">{{ p }}</li></ol>
              <p v-else class="text-gray-500">—</p>
            </div>
            <div>
              <p class="text-gray-400 mb-1">Objectives</p>
              <ul v-if="(selected.answers?.objectives ?? []).length" class="list-disc list-inside text-gray-700 dark:text-gray-200"><li v-for="(o, i) in selected.answers.objectives" :key="i">{{ o }}</li></ul>
              <p v-else class="text-gray-500">—</p>
            </div>
            <div>
              <p class="text-gray-400 mb-1">Assessment</p>
              <div v-if="selected.answers?.evaluate" class="flex flex-wrap gap-1.5"><UBadge v-for="m in (selected.answers?.evaluationMethods ?? [])" :key="m" color="neutral" variant="subtle">{{ m }}</UBadge><span v-if="!(selected.answers?.evaluationMethods ?? []).length" class="text-gray-700 dark:text-gray-200">Yes</span></div>
              <p v-else class="text-gray-700 dark:text-gray-200">No formal evaluation</p>
            </div>
            <div>
              <p class="text-gray-400 mb-1">Outline</p>
              <ul v-if="(selected.answers?.sections ?? []).length" class="text-gray-700 dark:text-gray-200">
                <li v-for="(s, i) in selected.answers.sections" :key="i" :style="{ paddingLeft: (s.level * 16) + 'px' }"><span class="font-semibold tabular-nums mr-1">{{ s.number }}</span>{{ s.text }}</li>
              </ul>
              <p v-else class="text-gray-500">—</p>
            </div>
            <div v-if="(selected.answers?.resourceFiles ?? []).length || (selected.answers?.resourceLinks ?? []).length">
              <p class="text-gray-400 mb-1">Resources</p>
              <ul class="text-gray-700 dark:text-gray-200">
                <li v-for="(f, i) in (selected.answers?.resourceFiles ?? [])" :key="'f'+i">📄 {{ f }}</li>
                <li v-for="(l, i) in (selected.answers?.resourceLinks ?? [])" :key="'l'+i"><a :href="l" target="_blank" rel="noopener" class="text-primary-600 dark:text-primary-400 hover:underline">{{ l }}</a></li>
              </ul>
            </div>
            <div><p class="text-gray-400 mb-1">Format</p><p class="text-gray-700 dark:text-gray-200">{{ selected.answers?.format || '—' }}</p></div>
            <div>
              <p class="text-gray-400 mb-1">Teacher services</p>
              <div class="flex flex-wrap gap-1.5"><UBadge v-for="t in (selected.answers?.teacherServices ?? [])" :key="t" color="neutral" variant="subtle">{{ t }}</UBadge><span v-if="!(selected.answers?.teacherServices ?? []).length">—</span></div>
            </div>
            <div>
              <p class="text-gray-400 mb-1">Student services</p>
              <div class="flex flex-wrap gap-1.5"><UBadge v-for="t in (selected.answers?.studentServices ?? [])" :key="t" color="neutral" variant="subtle">{{ t }}</UBadge><span v-if="!(selected.answers?.studentServices ?? []).length">—</span></div>
            </div>
          </div>
        </UCard>

        <!-- 3. Generated syllabus -->
        <UCard>
          <template #header>
            <h2 class="text-base font-semibold text-gray-900 dark:text-white">3 · Syllabus created</h2>
          </template>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">{{ selected.syllabus?.name }}</h3>
          <p v-if="selected.syllabus?.description" class="mt-1 text-gray-600 dark:text-gray-300">{{ selected.syllabus.description }}</p>
          <div class="mt-6">
            <LessonView :blocks="selected.syllabus?.blocks ?? []" />
          </div>
        </UCard>
      </template>

      <!-- List + charts view -->
      <template v-else>
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Submissions</h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ total }} syllabus submission{{ total === 1 ? '' : 's' }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UButton variant="ghost" color="neutral" size="sm" icon="i-heroicons-arrow-path" :loading="loading" @click="refresh">Refresh</UButton>
            <UButton variant="ghost" color="neutral" size="sm" icon="i-heroicons-lock-closed" @click="lock">Lock</UButton>
          </div>
        </div>

        <!-- Stat cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <UCard v-for="stat in stats" :key="stat.label">
            <p class="text-xs font-medium text-gray-400 uppercase tracking-wide">{{ stat.label }}</p>
            <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{{ stat.value }}</p>
          </UCard>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <UCard>
            <template #header><h2 class="text-sm font-semibold text-gray-900 dark:text-white">Most requested topics</h2></template>
            <BarRow v-for="r in byTopic" :key="r.label" :label="r.label" :count="r.count" :max="maxTopic" />
            <p v-if="!byTopic.length" class="text-sm text-gray-400 py-4 text-center">No data yet.</p>
          </UCard>
          <UCard>
            <template #header><h2 class="text-sm font-semibold text-gray-900 dark:text-white">Formats chosen</h2></template>
            <BarRow v-for="r in byFormat" :key="r.label" :label="r.label" :count="r.count" :max="maxFormat" />
            <p v-if="!byFormat.length" class="text-sm text-gray-400 py-4 text-center">No data yet.</p>
          </UCard>
        </div>

        <!-- Table -->
        <UCard>
          <template #header><h2 class="text-sm font-semibold text-gray-900 dark:text-white">All submissions</h2></template>
          <div v-if="!submissions.length" class="text-center py-12 text-sm text-gray-400">No submissions yet.</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-left text-xs uppercase tracking-wide text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th class="py-2 pr-3 font-medium">Date</th>
                  <th class="py-2 pr-3 font-medium">Author</th>
                  <th class="py-2 pr-3 font-medium">Course</th>
                  <th class="py-2 pr-3 font-medium">Format</th>
                  <th class="py-2 pr-3 font-medium">Topics</th>
                  <th class="py-2"></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="s in submissions"
                  :key="s.id"
                  class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  @click="selected = s"
                >
                  <td class="py-2.5 pr-3 whitespace-nowrap text-gray-500">{{ fmtDate(s.createdAt) }}</td>
                  <td class="py-2.5 pr-3 font-medium text-gray-900 dark:text-white">{{ s.author?.name || '—' }}</td>
                  <td class="py-2.5 pr-3 text-gray-700 dark:text-gray-200">{{ s.syllabus?.name || s.answers?.title || '—' }}</td>
                  <td class="py-2.5 pr-3 text-gray-500 max-w-[14rem] truncate">{{ s.answers?.format || '—' }}</td>
                  <td class="py-2.5 pr-3 text-gray-500">{{ (s.answers?.topics ?? []).length }}</td>
                  <td class="py-2.5 text-right"><UIcon name="i-heroicons-chevron-right" class="h-4 w-4 text-gray-400" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
useHead({ title: 'Admin · Syllabus Assistant' })

const password = ref('')
const unlocked = ref(false)
const loading = ref(false)
const error = ref('')
const submissions = ref<any[]>([])
const selected = ref<any | null>(null)

const fetchSubmissions = () =>
  $fetch<any[]>('/api/admin/submissions', { method: 'POST', body: { password: password.value } })

const unlock = async (opts: { silent?: boolean } = {}) => {
  loading.value = true
  error.value = ''
  try {
    // An empty list still unlocks — the dashboard works with zero submissions.
    submissions.value = await fetchSubmissions()
    unlocked.value = true
    if (import.meta.client) sessionStorage.setItem('admin-pw', password.value)
  } catch (e: any) {
    // Drop any stale stored password so we don't keep auto-failing (and burning
    // lockout attempts) on every reload.
    if (import.meta.client) sessionStorage.removeItem('admin-pw')
    const status = e?.statusCode ?? e?.response?.status ?? e?.data?.statusCode
    // A failed silent auto-unlock (stale password) shouldn't nag — just show the gate.
    if (opts.silent) { password.value = ''; return }
    if (status === 423) {
      error.value = 'Admin access has been locked after too many failed attempts. An administrator must unlock it.'
    } else if (status === 401) {
      error.value = 'Incorrect password.'
    } else {
      error.value = 'Could not load submissions.'
    }
  } finally {
    loading.value = false
  }
}

const refresh = async () => {
  loading.value = true
  try { submissions.value = await fetchSubmissions() } catch { /* ignore */ } finally { loading.value = false }
}

const lock = () => {
  unlocked.value = false
  password.value = ''
  submissions.value = []
  selected.value = null
  if (import.meta.client) sessionStorage.removeItem('admin-pw')
}

onMounted(() => {
  const saved = import.meta.client ? sessionStorage.getItem('admin-pw') : null
  if (saved) { password.value = saved; unlock({ silent: true }) }
})

// ── Aggregations ──────────────────────────────────────────────
const tally = (items: string[]) => {
  const m = new Map<string, number>()
  for (const it of items) if (it) m.set(it, (m.get(it) ?? 0) + 1)
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
}

const byTopic = computed(() => tally(submissions.value.flatMap(s => s.answers?.topics ?? [])).slice(0, 8))
const byFormat = computed(() => tally(submissions.value.map(s => s.answers?.format).filter(Boolean)))
const maxTopic = computed(() => Math.max(1, ...byTopic.value.map(r => r.count)))
const maxFormat = computed(() => Math.max(1, ...byFormat.value.map(r => r.count)))

const total = computed(() => submissions.value.length)
const stats = computed(() => {
  const ws = submissions.value.map(s => s.answers?.weeks).filter((w: any) => typeof w === 'number')
  const avgWeeks = ws.length ? Math.round(ws.reduce((a: number, b: number) => a + b, 0) / ws.length) : 0
  const uniqueAuthors = new Set(submissions.value.map(s => s.author?.name).filter(Boolean)).size
  const pctEval = total.value ? Math.round(submissions.value.filter(s => s.answers?.evaluate === true).length / total.value * 100) : 0
  return [
    { label: 'Submissions', value: total.value },
    { label: 'Authors', value: uniqueAuthors },
    { label: 'Avg length', value: avgWeeks ? `${avgWeeks} wk` : '—' },
    { label: 'With assessment', value: `${pctEval}%` }
  ]
})

const fmtDate = (iso: string) => { try { return new Date(iso).toLocaleString() } catch { return iso } }
const durationLabel = (a: any) => !a ? '—' : a.weeks === 0 ? `Single workshop · ${a.hoursPerSession}h` : `${a.weeks} weeks · ${a.hoursPerSession}h / session`
const ghUrl = (handle: string) => {
  const h = String(handle).replace(/^@/, '').replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^github\.com\//i, '')
  return `https://github.com/${h}`
}
</script>
