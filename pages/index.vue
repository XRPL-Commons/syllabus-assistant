<template>
  <div class="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
    <!-- Minimal top bar (no app navbar — this is a focused, full-screen flow). -->
    <header class="px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <NuxtLink to="/" class="flex items-center gap-2 text-gray-900 dark:text-white">
          <img src="/xrpl-logo-white.svg" alt="XRP" class="h-7 w-7 dark:invert-0 invert" />
          <span class="text-lg font-semibold">Academy</span>
        </NuxtLink>
      </div>
    </header>

    <!-- ───────────────────────── INTRO / LANDING ───────────────────────── -->
    <main v-if="phase === 'intro'" class="flex-1 flex items-center justify-center p-6">
      <div class="max-w-2xl w-full text-center">
        <h1 class="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          Syllabus Assistant
        </h1>
        <p class="mt-6 text-lg text-gray-600 dark:text-gray-300">
          Design a course on the XRP Ledger in minutes. Answer a few quick questions about you
          and your course, and we'll turn your answers into a structured, ready-to-edit syllabus.
        </p>

        <div class="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div v-for="f in introFeatures" :key="f.title" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
            <UIcon :name="f.icon" class="h-5 w-5 text-gray-400 dark:text-gray-500" />
            <p class="mt-2 text-sm font-semibold text-gray-900 dark:text-white">{{ f.title }}</p>
            <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{{ f.text }}</p>
          </div>
        </div>

        <div class="mt-10">
          <UButton size="xl" @click="start">
            Get started
            <template #trailing>
              <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
            </template>
          </UButton>
        </div>
      </div>
    </main>

    <!-- ───────────────────────── WIZARD / QUESTIONS ───────────────────────── -->
    <main v-else-if="phase === 'form'" class="flex-1 flex items-center justify-center p-6">
      <UCard class="max-w-2xl w-full shadow-sm">
        <!-- Progress — hidden on section dividers; scoped to the current section. -->
        <div v-if="step.kind !== 'section'" class="mb-8">
          <div class="flex items-center justify-between mb-2 text-xs font-medium text-gray-400">
            <span>Step {{ sectionProgress.position }} of {{ sectionProgress.total }}</span>
            <span>{{ step.chip }}</span>
          </div>
          <div class="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div class="h-full bg-primary-500 transition-all duration-300" :style="{ width: progressPct + '%' }" />
          </div>
        </div>

        <!-- Slide content. The relative wrapper + absolutely-positioned leave
             (see <style>) keeps the card sized to the INCOMING step, so there's
             no oversize flash when moving from a section divider to its first
             question. -->
        <div class="relative">
        <Transition name="slide">
          <div :key="currentStep">
            <!-- Section divider — an in-between step that introduces a section.
                 No back button; a single tall forward arrow on the right. -->
            <div v-if="step.kind === 'section'" class="flex items-stretch gap-4">
              <div class="flex-1 flex flex-col items-center justify-center text-center py-12">
                <div class="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-5">
                  <UIcon :name="step.icon || 'i-heroicons-flag'" class="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </div>
                <p v-if="step.eyebrow" class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ step.eyebrow }}</p>
                <h2 class="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{{ step.title }}</h2>
                <p v-if="step.subtitle" class="mt-3 max-w-md text-gray-500 dark:text-gray-400">{{ step.subtitle }}</p>
              </div>
              <button
                type="button"
                aria-label="Continue"
                class="shrink-0 w-16 self-stretch -my-4 -mr-4 sm:-my-6 sm:-mr-6 flex items-center justify-center border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-200 transition"
                @click="next"
              >
                <UIcon name="i-heroicons-chevron-right" class="h-7 w-7" />
              </button>
            </div>

            <!-- Question steps. -->
            <template v-else>
              <h2 class="text-2xl font-semibold text-gray-900 dark:text-white">
                {{ step.title }}
              </h2>
              <p v-if="step.subtitle" class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {{ step.subtitle }}
              </p>

              <div class="mt-6">
                <!-- Author — name (required) -->
                <template v-if="step.key === 'authorName'">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <UFormField label="First name">
                      <UInput
                        v-model="form.author.firstName"
                        size="xl"
                        placeholder="Jane"
                        icon="i-heroicons-user"
                        class="w-full"
                        autofocus
                        @keydown.enter="canProceed && next()"
                      />
                    </UFormField>
                    <UFormField label="Last name">
                      <UInput
                        v-model="form.author.lastName"
                        size="xl"
                        placeholder="Doe"
                        class="w-full"
                        @keydown.enter="canProceed && next()"
                      />
                    </UFormField>
                  </div>
                </template>

                <!-- Author — university -->
                <template v-else-if="step.key === 'authorUniversity'">
                  <UInput
                    v-model="form.author.university"
                    size="xl"
                    placeholder="e.g. ETH Zürich"
                    icon="i-heroicons-academic-cap"
                    class="w-full"
                    autofocus
                    @keydown.enter="canProceed && next()"
                  />
                </template>

                <!-- Author — GitHub (username only) -->
                <template v-else-if="step.key === 'authorGithub'">
                  <UInput
                    v-model="form.author.github"
                    size="xl"
                    placeholder="your-username"
                    icon="i-heroicons-code-bracket"
                    class="w-full"
                    autofocus
                    @keydown.enter="canProceed && next()"
                  />
                </template>

                <!-- Author — research profile -->
                <template v-else-if="step.key === 'authorResearch'">
                  <UInput
                    v-model="form.author.researchProfile"
                    size="xl"
                    placeholder="https://orcid.org/0000-0000-0000-0000"
                    icon="i-heroicons-identification"
                    class="w-full"
                    autofocus
                    @keydown.enter="canProceed && next()"
                  />
                </template>

                <!-- Author — publications -->
                <template v-else-if="step.key === 'authorPublications'">
                  <UTextarea
                    v-model="form.author.publications"
                    :rows="5"
                    class="w-full"
                    placeholder="Doe, J. (2024). On consensus. Journal of Distributed Systems.&#10;Doe, J. & Roe, R. (2023). Tokenized markets. ACM."
                    autofocus
                  />
                </template>

                <!-- Author — CV (optional) -->
                <template v-else-if="step.key === 'authorCv'">
                  <input ref="cvInput" type="file" accept=".pdf,.doc,.docx" class="hidden" @change="onCvSelected" />
                  <button
                    type="button"
                    @click="cvInput?.click()"
                    class="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition"
                  >
                    <UIcon name="i-heroicons-arrow-up-tray" class="h-6 w-6 mx-auto text-gray-400" />
                    <p class="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">{{ form.author.cv ? 'Replace CV' : 'Upload your CV' }}</p>
                    <p class="text-xs text-gray-400">PDF or Word document · optional</p>
                  </button>
                  <div v-if="form.author.cv" class="mt-3 flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <UIcon name="i-heroicons-document" class="h-4 w-4 text-gray-400 shrink-0" />
                    <span class="truncate flex-1">{{ form.author.cv.name }}</span>
                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="xs" @click="form.author.cv = null" />
                  </div>
                </template>

                <!-- Author — areas of expertise -->
                <template v-else-if="step.key === 'authorExpertise'">
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="t in expertiseOptions"
                      :key="t"
                      type="button"
                      @click="toggleIn(form.author.expertise, t)"
                      :class="chipClass(form.author.expertise.includes(t))"
                    >
                      {{ t }}
                    </button>
                  </div>
                  <div class="mt-4 flex gap-2">
                    <UInput
                      v-model="newExpertise"
                      placeholder="Add an area…"
                      class="flex-1"
                      :ui="{ base: 'rounded-full' }"
                      @keydown.enter.prevent="addExpertise"
                    />
                    <UButton icon="i-heroicons-plus" color="neutral" variant="outline" class="rounded-full" :disabled="!newExpertise.trim()" @click="addExpertise">
                      Add
                    </UButton>
                  </div>
                </template>

              <!-- 1 — Title -->
              <template v-else-if="step.key === 'title'">
                <UInput
                  v-model="form.title"
                  size="xl"
                  placeholder="e.g. Building Payment Apps on the XRP Ledger"
                  class="w-full"
                  autofocus
                  @keydown.enter="canProceed && next()"
                />
              </template>

              <!-- 2 — Topics -->
              <template v-else-if="step.key === 'topics'">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="t in availableTopics"
                    :key="t"
                    type="button"
                    @click="toggleIn(form.topics, t)"
                    :class="chipClass(form.topics.includes(t))"
                  >
                    {{ t }}
                  </button>
                </div>
                <div class="mt-4 flex gap-2">
                  <UInput
                    v-model="newTopic"
                    placeholder="Add your own topic…"
                    class="flex-1"
                    :ui="{ base: 'rounded-full' }"
                    @keydown.enter.prevent="addTopic"
                  />
                  <UButton icon="i-heroicons-plus" color="neutral" variant="outline" class="rounded-full" :disabled="!newTopic.trim()" @click="addTopic">
                    Add
                  </UButton>
                </div>
              </template>

              <!-- 3 — Students (suggestion chips like Topics) -->
              <template v-else-if="step.key === 'students'">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in availableStudents"
                    :key="s"
                    type="button"
                    @click="toggleIn(form.students, s)"
                    :class="chipClass(form.students.includes(s))"
                  >
                    {{ s }}
                  </button>
                </div>
                <div class="mt-4 flex gap-2">
                  <UInput
                    v-model="newStudent"
                    placeholder="Add another audience…"
                    class="flex-1"
                    :ui="{ base: 'rounded-full' }"
                    @keydown.enter.prevent="addStudent"
                  />
                  <UButton icon="i-heroicons-plus" color="neutral" variant="outline" class="rounded-full" :disabled="!newStudent.trim()" @click="addStudent">
                    Add
                  </UButton>
                </div>
              </template>

              <!-- 4 — Duration (sliders only) -->
              <template v-else-if="step.key === 'duration'">
                <div class="space-y-6">
                  <div>
                    <div class="flex items-center justify-between mb-2 text-sm">
                      <span class="font-medium text-gray-700 dark:text-gray-300">Length</span>
                      <span class="text-primary-600 dark:text-primary-400 font-semibold">{{ weeksLabel }}</span>
                    </div>
                    <USlider v-model="form.weeks" :min="0" :max="24" :step="1" />
                    <p class="mt-1.5 text-xs text-gray-400">Slide to 0 for a single one-off workshop.</p>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-2 text-sm">
                      <span class="font-medium text-gray-700 dark:text-gray-300">Hours per session</span>
                      <span class="text-primary-600 dark:text-primary-400 font-semibold">{{ form.hoursPerSession }} h</span>
                    </div>
                    <USlider v-model="form.hoursPerSession" :min="1" :max="8" :step="0.5" />
                  </div>
                </div>
              </template>

              <!-- 5 — Prerequisites (optional — confirm modal if empty) -->
              <template v-else-if="step.key === 'prerequisites'">
                <ul class="space-y-2">
                  <li v-for="(_, i) in form.prerequisites" :key="i" class="flex items-center gap-3">
                    <span class="w-6 shrink-0 text-sm font-semibold text-gray-400 text-right">{{ i + 1 }}.</span>
                    <UInput
                      v-model="form.prerequisites[i]"
                      class="flex-1"
                      placeholder="e.g. 2 years of experience with C++"
                      :data-prereq-input="i"
                      @keydown.enter.prevent="addPrerequisite(i)"
                    />
                    <UButton
                      icon="i-heroicons-x-mark"
                      color="neutral"
                      variant="ghost"
                      size="sm"
                      :disabled="form.prerequisites.length === 1"
                      @click="removePrerequisite(i)"
                    />
                  </li>
                </ul>
                <UButton class="mt-3" icon="i-heroicons-plus" color="neutral" variant="subtle" size="sm" @click="addPrerequisite(form.prerequisites.length - 1)">
                  Add prerequisite
                </UButton>
              </template>

              <!-- 6 — Pedagogical objectives (selectable blocks, multi-select) -->
              <template v-else-if="step.key === 'objective'">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    v-for="o in objectiveOptions"
                    :key="o"
                    type="button"
                    @click="toggleIn(form.objectives, o)"
                    :class="blockClass(form.objectives.includes(o))"
                  >
                    <span class="text-sm font-medium text-gray-900 dark:text-white">{{ o }}</span>
                  </button>
                </div>
                <div class="mt-3 flex gap-3">
                  <UInput
                    v-model="newObjective"
                    placeholder="Add your own objective…"
                    size="xl"
                    class="flex-1"
                    :ui="{ base: 'rounded-xl' }"
                    @keydown.enter.prevent="addObjective"
                  />
                  <UButton color="neutral" variant="outline" size="xl" class="rounded-xl px-5" :disabled="!newObjective.trim()" @click="addObjective">
                    <template #leading><UIcon name="i-heroicons-plus" class="h-5 w-5" /></template>
                    Add
                  </UButton>
                </div>
              </template>

              <!-- 7 — Evaluation -->
              <template v-else-if="step.key === 'evaluation'">
                <div class="flex gap-3">
                  <button type="button" class="flex-1" @click="form.evaluate = true" :class="optionClass(form.evaluate === true)">
                    <span class="text-base font-medium text-gray-900 dark:text-white">Yes, I'll evaluate them</span>
                  </button>
                  <button type="button" class="flex-1" @click="setNoEvaluation" :class="optionClass(form.evaluate === false)">
                    <span class="text-base font-medium text-gray-900 dark:text-white">No evaluation</span>
                  </button>
                </div>

                <div v-if="form.evaluate === true" class="mt-5">
                  <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">Which functionalities would you like available?</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="m in evaluationMethods"
                      :key="m"
                      type="button"
                      @click="toggleIn(form.evaluationMethods, m)"
                      :class="chipClass(form.evaluationMethods.includes(m))"
                    >
                      {{ m }}
                    </button>
                  </div>
                </div>
              </template>

              <!-- 8 — Main sections (outline editor) -->
              <template v-else-if="step.key === 'sections'">
                <div ref="sectionsContainer" class="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                  <div
                    v-for="(s, i) in form.sections"
                    :key="i"
                    class="flex items-center gap-2 px-3 py-2"
                    :style="{ paddingLeft: (12 + s.level * 28) + 'px' }"
                  >
                    <UButton
                      v-if="s.level > 0"
                      icon="i-heroicons-arrow-left"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      title="Outdent"
                      class="shrink-0"
                      @click="s.level = 0"
                    />
                    <span class="shrink-0 text-sm font-semibold tabular-nums" :class="s.level === 0 ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400'">
                      {{ sectionNumbers[i] }}
                    </span>
                    <input
                      v-model="s.text"
                      data-section-input
                      type="text"
                      :placeholder="s.level === 0 ? 'Section title' : 'Sub-section title'"
                      class="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400"
                      @keydown="onSectionKeydown($event, i)"
                    />
                    <UButton
                      icon="i-heroicons-x-mark"
                      color="neutral"
                      variant="ghost"
                      size="xs"
                      :disabled="form.sections.length === 1"
                      @click="removeSection(i)"
                    />
                  </div>
                </div>
                <p class="mt-2 text-xs text-gray-400">
                  <kbd class="px-1 rounded bg-gray-100 dark:bg-gray-800">Enter</kbd> new line ·
                  <kbd class="px-1 rounded bg-gray-100 dark:bg-gray-800">Tab</kbd> indent ·
                  <kbd class="px-1 rounded bg-gray-100 dark:bg-gray-800">Shift+Tab</kbd> outdent
                </p>
              </template>

              <!-- 9 — Resources (optional — confirm modal if empty) -->
              <template v-else-if="step.key === 'resources'">
                <input ref="fileInput" type="file" multiple class="hidden" @change="onFilesSelected" />
                <button
                  type="button"
                  @click="fileInput?.click()"
                  class="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition"
                >
                  <UIcon name="i-heroicons-arrow-up-tray" class="h-6 w-6 mx-auto text-gray-400" />
                  <p class="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">Upload files</p>
                  <p class="text-xs text-gray-400">Papers, slides, videos, datasets…</p>
                </button>

                <ul v-if="form.resourceFiles.length" class="mt-3 space-y-2">
                  <li v-for="(f, i) in form.resourceFiles" :key="i" class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <UIcon name="i-heroicons-document" class="h-4 w-4 text-gray-400 shrink-0" />
                    <span class="truncate flex-1">{{ f.name }}</span>
                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="xs" @click="form.resourceFiles.splice(i, 1)" />
                  </li>
                </ul>

                <p class="mt-5 mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">…or paste links</p>
                <ul class="space-y-2">
                  <li v-for="(_, i) in form.resourceLinks" :key="i" class="flex items-center gap-2">
                    <UInput
                      v-model="form.resourceLinks[i]"
                      class="flex-1"
                      placeholder="https://…"
                      :data-link-input="i"
                      @keydown.enter.prevent="addLink(i)"
                    />
                    <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" size="sm" @click="removeLink(i)" />
                  </li>
                </ul>
                <UButton class="mt-2" icon="i-heroicons-plus" color="neutral" variant="subtle" size="sm" @click="addLink(form.resourceLinks.length - 1)">
                  Add link
                </UButton>
              </template>

              <!-- 10 — Format -->
              <template v-else-if="step.key === 'format'">
                <ul class="space-y-3">
                  <li v-for="opt in formatOptions" :key="opt.value">
                    <button type="button" @click="form.format = opt.value" :class="optionClass(form.format === opt.value)">
                      <span class="text-base font-medium text-gray-900 dark:text-white">{{ opt.label }}</span>
                    </button>
                  </li>
                </ul>
                <div class="mt-3 flex gap-3">
                  <UInput
                    v-model="newFormat"
                    placeholder="Add your own format…"
                    size="xl"
                    class="flex-1"
                    :ui="{ base: 'rounded-xl' }"
                    @keydown.enter.prevent="addFormat"
                  />
                  <UButton color="neutral" variant="outline" size="xl" class="rounded-xl px-5" :disabled="!newFormat.trim()" @click="addFormat">
                    <template #leading><UIcon name="i-heroicons-plus" class="h-5 w-5" /></template>
                    Add
                  </UButton>
                </div>
              </template>

              <!-- 11 — Teacher services -->
              <template v-else-if="step.key === 'teacherServices'">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in teacherServiceOptions"
                    :key="s"
                    type="button"
                    @click="toggleIn(form.teacherServices, s)"
                    :class="chipClass(form.teacherServices.includes(s))"
                  >
                    {{ s }}
                  </button>
                </div>
                <div class="mt-4 flex gap-2">
                  <UInput
                    v-model="newTeacherService"
                    placeholder="Add another need…"
                    class="flex-1"
                    :ui="{ base: 'rounded-full' }"
                    @keydown.enter.prevent="addTeacherService"
                  />
                  <UButton icon="i-heroicons-plus" color="neutral" variant="outline" class="rounded-full" :disabled="!newTeacherService.trim()" @click="addTeacherService">
                    Add
                  </UButton>
                </div>
              </template>

              <!-- 12 — Student services -->
              <template v-else-if="step.key === 'studentServices'">
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="s in studentServiceOptions"
                    :key="s"
                    type="button"
                    @click="toggleIn(form.studentServices, s)"
                    :class="chipClass(form.studentServices.includes(s))"
                  >
                    {{ s }}
                  </button>
                </div>
                <div class="mt-4 flex gap-2">
                  <UInput
                    v-model="newStudentService"
                    placeholder="Add another service…"
                    class="flex-1"
                    :ui="{ base: 'rounded-full' }"
                    @keydown.enter.prevent="addStudentService"
                  />
                  <UButton icon="i-heroicons-plus" color="neutral" variant="outline" class="rounded-full" :disabled="!newStudentService.trim()" @click="addStudentService">
                    Add
                  </UButton>
                </div>
              </template>
            </div>
            </template>
          </div>
        </Transition>
        </div>

        <!-- Nav — hidden on section dividers (they have their own forward arrow). -->
        <div v-if="step.kind !== 'section'" class="flex items-center justify-between mt-8">
          <UButton variant="ghost" color="neutral" :disabled="loading" @click="back">
            <template #leading><UIcon name="i-heroicons-arrow-left" class="h-4 w-4" /></template>
            Back
          </UButton>
          <UButton :loading="loading" :disabled="!canProceed" @click="next">
            {{ isLastStep ? 'Complete' : 'Continue' }}
            <template #trailing><UIcon name="i-heroicons-arrow-right" class="h-4 w-4" /></template>
          </UButton>
        </div>
      </UCard>
    </main>

    <!-- ───────────────────────── PREFILLED EDITOR ───────────────────────── -->
    <main v-else-if="phase === 'editor'" class="flex-1">
      <EditorActivityEditor
        v-if="syllabusDraft"
        :initial="syllabusDraft"
        :saving="isCreating"
        title="Your course"
        submit-label="Create"
        @submit="onCreate"
        @cancel="phase = 'form'"
      />
    </main>

    <!-- ───────────────────────── COMPLETE — RENDERED SYLLABUS ───────────────────────── -->
    <main v-else class="flex-1 p-6">
      <div class="max-w-3xl mx-auto">
        <div class="mb-8 flex items-center justify-center gap-3">
          <UIcon name="i-heroicons-check-circle" class="h-8 w-8 text-green-500" />
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Syllabus complete</h1>
        </div>

        <UCard>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white">{{ finalSyllabus?.name }}</h1>
          <p v-if="finalSyllabus?.description" class="mt-2 text-gray-600 dark:text-gray-300">
            {{ finalSyllabus.description }}
          </p>
          <div class="mt-8">
            <LessonView :blocks="finalSyllabus?.blocks ?? []" />
          </div>
        </UCard>
      </div>
    </main>

    <!-- Confirmation when a skippable step (prerequisites / resources) is left empty. -->
    <ModalsConfirmModal
      v-model:open="confirmOpen"
      title="Skip this step?"
      :message="confirmMessage"
      confirm-label="Continue"
      cancel-label="Go back"
      @confirm="onConfirm"
      @cancel="confirmOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

/**
 * Syllabus Assistant — a focused, full-screen flow that walks a teacher through
 * the key questions for designing an XRPL course, then hands them an editable,
 * prefilled draft (the same block editor used to create activities).
 *
 * Three phases share one page (mirroring the onboarding carousel):
 *   intro  — landing hero + "Get started"
 *   form   — sliding multi-step questionnaire (every step needs an answer,
 *            except prerequisites & resources which prompt a confirm modal)
 *   editor — <EditorActivityEditor> prefilled from the answers
 */

const toast = useToast()
const { user, fetchUser } = useAuth()

type Phase = 'intro' | 'form' | 'editor' | 'done'
const phase = ref<Phase>('intro')

const introFeatures = [
  { icon: 'i-heroicons-light-bulb', title: 'Shape your outline', text: 'Topics, sections, objectives — in a few clicks.' },
  { icon: 'i-heroicons-users', title: 'Built for your students', text: 'Tailored to who you teach and how.' },
  { icon: 'i-heroicons-squares-2x2', title: 'Matched activities', text: 'Ready-made content from the Academy library.' }
]

// ── Step metadata (drives the title/subtitle + progress) ─────────────────────
interface StepMeta {
  key: string
  chip: string
  title: string
  subtitle?: string
  kind?: 'section'
  eyebrow?: string
  icon?: string
}
const stepsMeta: StepMeta[] = [
  // ── Section 1 — Author ──────────────────────────────────────────────────────
  { key: 'sectionAuthor', kind: 'section', chip: 'Author', eyebrow: 'Section 1 of 2', icon: 'i-heroicons-identification', title: 'Author info', subtitle: 'First, tell students who is teaching this course.' },
  { key: 'authorName',         chip: 'Author', title: "What's your name?",             subtitle: 'The instructor students will see on the syllabus.' },
  { key: 'authorUniversity',   chip: 'Author', title: 'Where do you teach?',           subtitle: 'Your university or institution. Optional.' },
  { key: 'authorGithub',       chip: 'Author', title: "What's your GitHub username?",   subtitle: 'Optional — just the handle, e.g. janedoe.' },
  { key: 'authorResearch',     chip: 'Author', title: 'Your research profile',         subtitle: 'Optional — ORCID, ResearchGate, Google Scholar or a DOI.' },
  { key: 'authorPublications', chip: 'Author', title: 'Your main publications',        subtitle: 'Optional — your most relevant work, one per line.' },
  { key: 'authorCv',           chip: 'Author', title: 'Upload your CV',                subtitle: 'Optional — a PDF or Word document.' },
  { key: 'authorExpertise',    chip: 'Author', title: 'What topics do you know best?', subtitle: 'Optional — pick your areas of expertise or add your own.' },

  // ── Section 2 — Course ──────────────────────────────────────────────────────
  { key: 'sectionCourse', kind: 'section', chip: 'Course', eyebrow: 'Section 2 of 2', icon: 'i-heroicons-academic-cap', title: 'Create your course', subtitle: "Now let's design the course itself." },
  { key: 'title',           chip: 'Course',       title: "What's the title of your new course?",       subtitle: 'Give it a clear, compelling name.' },
  { key: 'topics',          chip: 'Topics',       title: 'What topics does your course cover?',         subtitle: 'Pick the themes that apply — or add your own.' },
  { key: 'students',        chip: 'Audience',     title: 'Who are your students?',                      subtitle: "Pick who you're teaching — or add your own." },
  { key: 'duration',        chip: 'Duration',     title: 'How long is your course?',                    subtitle: 'Set the length and the pace.' },
  { key: 'prerequisites',   chip: 'Prerequisites', title: 'What are the prerequisites?',                subtitle: 'List everything a student should already know or have done.' },
  { key: 'objective',       chip: 'Objectives',   title: 'What are the pedagogical objectives?',        subtitle: 'Select the outcomes students should reach.' },
  { key: 'evaluation',      chip: 'Assessment',   title: 'Will you evaluate your students?',            subtitle: 'If so, choose the functionalities you want available.' },
  { key: 'sections',        chip: 'Outline',      title: 'List the titles of your main sections',       subtitle: 'Press Enter for a new line, Tab to indent into a sub-section (1.1, 1.2…).' },
  { key: 'resources',       chip: 'Resources',    title: "Any resources you've already developed?",     subtitle: 'Upload files or paste links — papers, videos, slides, repos…' },
  { key: 'format',          chip: 'Format',       title: 'What format do you want for the course?',     subtitle: 'Pick how learners will mainly engage.' },
  { key: 'teacherServices', chip: 'Teaching',     title: 'What support would you need as a teacher?',   subtitle: 'Select everything that would help you deliver this course.' },
  { key: 'studentServices', chip: 'Student care', title: 'What services should your students get?',     subtitle: 'Select the learning support to offer alongside the course.' }
]

const currentStep = ref(0)
const step = computed(() => stepsMeta[currentStep.value])
const isLastStep = computed(() => currentStep.value === stepsMeta.length - 1)
// Progress is scoped to the current section: count only the question steps
// between the section header and the next one (or the end of the flow).
const sectionProgress = computed(() => {
  let start = currentStep.value
  while (start >= 0 && stepsMeta[start].kind !== 'section') start--
  const firstQuestion = start + 1
  let end = firstQuestion
  while (end < stepsMeta.length && stepsMeta[end].kind !== 'section') end++
  return { position: currentStep.value - firstQuestion + 1, total: end - firstQuestion }
})
const progressPct = computed(() => {
  const { position, total } = sectionProgress.value
  return total > 0 ? (position / total) * 100 : 0
})

// ── Option catalogues ────────────────────────────────────────────────────────
const availableTopics = ref<string[]>([
  'Cryptography', 'Tokenomics', 'DeFi', 'Smart Contracts', 'Payments',
  'NFTs', 'Consensus', 'Wallets', 'AMM', 'Hooks', 'Sidechains',
  'Stablecoins', 'Tokenization (RWA)', 'Compliance'
])
const newTopic = ref('')

const availableStudents = ref<string[]>([
  'Beginner developers', 'Experienced developers', 'Students & academics',
  'Founders & entrepreneurs', 'Product & business teams',
  'Non-technical professionals', 'Designers', 'Researchers'
])
const newStudent = ref('')

const objectiveOptions = ref<string[]>([
  'Understand XRPL consensus',
  'Build & submit transactions',
  'Issue tokens & trustlines',
  'Design tokenomics',
  'Integrate XRPL payments',
  'Use AMMs & DeFi primitives',
  'Ship a production-ready dApp',
  'Apply security best practices'
])
const newObjective = ref('')

const evaluationMethods = [
  'Quiz', 'Oral exam with a tech mentor', 'Project demo', 'Coding challenge', 'Written assignment'
]

const formatOptions = ref([
  { value: 'cohort',       label: 'Cohort-based (pre-scheduled live sessions and async homework)' },
  { value: 'coding',       label: 'Coding sessions only' },
  { value: 'async',        label: 'Async learning materials only' },
  { value: 'async_office', label: 'Async learning materials and 1:1 office hours' }
])
const newFormat = ref('')

const teacherServiceOptions = ref<string[]>([
  'Help grading online', 'Run coding sessions with a tech specialist', 'Guidance on using AI in teaching',
  'Content production support (video, slides)', 'Live session hosting & moderation'
])
const newTeacherService = ref('')

const studentServiceOptions = ref<string[]>([
  'Course credits / certification', '1:1 mentorship', 'Developer learning journey (technical track)',
  'Career & networking support', 'Access to a learner community'
])
const newStudentService = ref('')

const expertiseOptions = ref<string[]>([
  'Distributed systems', 'Cryptography', 'Consensus protocols', 'DeFi', 'Tokenomics',
  'Smart contracts', 'Payments & settlement', 'Game theory', 'Network security', 'Economics'
])
const newExpertise = ref('')

// ── Form state ────────────────────────────────────────────────────────────────
const form = reactive({
  author: {
    firstName: '',
    lastName: '',
    university: '',
    github: '',
    researchProfile: '',
    publications: '',
    expertise: [] as string[],
    cv: null as { name: string } | null
  },
  title: '',
  topics: [] as string[],
  students: [] as string[],
  weeks: 12,
  hoursPerSession: 2,
  prerequisites: [''] as string[],
  objectives: [] as string[],
  evaluate: null as boolean | null,
  evaluationMethods: [] as string[],
  sections: [{ level: 0, text: '' }] as { level: number; text: string }[],
  resourceFiles: [] as { name: string }[],
  resourceLinks: [''] as string[],
  format: '' as string,
  teacherServices: [] as string[],
  studentServices: [] as string[]
})

const weeksLabel = computed(() =>
  form.weeks === 0 ? 'Single workshop' : `${form.weeks} ${form.weeks === 1 ? 'week' : 'weeks'}`
)

const hasPrereqs = computed(() => form.prerequisites.some(p => p.trim()))
const hasResources = computed(() => form.resourceFiles.length > 0 || form.resourceLinks.some(l => l.trim()))

// Every step needs an answer, except prerequisites & resources (which are valid
// when empty but trigger a confirmation before advancing).
const stepValid = computed(() => {
  switch (step.value.key) {
    case 'authorName': return form.author.firstName.trim().length > 0 && form.author.lastName.trim().length > 0
    case 'title': return form.title.trim().length > 0
    case 'topics': return form.topics.length > 0
    case 'students': return form.students.length > 0
    case 'duration': return true
    case 'prerequisites': return true
    case 'objective': return form.objectives.length > 0
    case 'evaluation': return form.evaluate === false || (form.evaluate === true && form.evaluationMethods.length > 0)
    case 'sections': return form.sections.some(s => s.text.trim().length > 0)
    case 'resources': return true
    case 'format': return form.format !== ''
    case 'teacherServices': return form.teacherServices.length > 0
    case 'studentServices': return form.studentServices.length > 0
    default: return true
  }
})
const canProceed = computed(() => stepValid.value)

// ── Shared styling helpers ────────────────────────────────────────────────────
const optionClass = (selected: boolean) => [
  'w-full text-left px-6 py-5 rounded-xl border-2 transition',
  selected
    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
]
const blockClass = (selected: boolean) => [
  'flex items-center justify-between gap-3 text-left px-5 py-4 rounded-xl border-2 transition',
  selected
    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
]
const chipClass = (selected: boolean) => [
  'px-4 py-2 rounded-full border-2 text-sm font-medium transition',
  selected
    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
]

const toggleIn = (arr: string[], value: string) => {
  const i = arr.indexOf(value)
  if (i === -1) arr.push(value)
  else arr.splice(i, 1)
}

// ── Topics / Students (chip + free-add) ───────────────────────────────────────
const addFromInput = (pool: Ref<string[]>, selected: string[], input: Ref<string>) => {
  const v = input.value.trim()
  if (!v) return
  if (!pool.value.includes(v)) pool.value.push(v)
  if (!selected.includes(v)) selected.push(v)
  input.value = ''
}
const addTopic = () => addFromInput(availableTopics, form.topics, newTopic)
const addStudent = () => addFromInput(availableStudents, form.students, newStudent)
const addObjective = () => addFromInput(objectiveOptions, form.objectives, newObjective)
const addTeacherService = () => addFromInput(teacherServiceOptions, form.teacherServices, newTeacherService)
const addStudentService = () => addFromInput(studentServiceOptions, form.studentServices, newStudentService)
const addExpertise = () => addFromInput(expertiseOptions, form.author.expertise, newExpertise)

// ── Author CV upload (single file, optional) ──────────────────────────────────
const cvInput = ref<HTMLInputElement | null>(null)
const onCvSelected = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  ;(e.target as HTMLInputElement).value = ''
  if (file) form.author.cv = { name: file.name }
}

// Format is single-select: a custom entry becomes a new option and is selected.
const addFormat = () => {
  const v = newFormat.value.trim()
  if (!v) return
  if (!formatOptions.value.some(o => o.value === v)) formatOptions.value.push({ value: v, label: v })
  form.format = v
  newFormat.value = ''
}

// ── Prerequisites ─────────────────────────────────────────────────────────────
const addPrerequisite = async (afterIndex: number) => {
  form.prerequisites.splice(afterIndex + 1, 0, '')
  await nextTick()
  document.querySelector<HTMLInputElement>(`[data-prereq-input="${afterIndex + 1}"]`)?.focus()
}
const removePrerequisite = (i: number) => {
  if (form.prerequisites.length === 1) return
  form.prerequisites.splice(i, 1)
}

// ── Evaluation ────────────────────────────────────────────────────────────────
const setNoEvaluation = () => {
  form.evaluate = false
  form.evaluationMethods = []
}

// ── Sections outline editor ───────────────────────────────────────────────────
const sectionsContainer = ref<HTMLElement | null>(null)

// Walk the list assigning 1, 1.1, 1.2, 2, … from the per-item level.
const sectionNumbers = computed(() => {
  let top = 0
  let sub = 0
  return form.sections.map((s) => {
    if (s.level === 0) { top++; sub = 0; return `${top}.` }
    sub++
    return `${top}.${sub}`
  })
})

const focusSection = async (index: number) => {
  await nextTick()
  const inputs = sectionsContainer.value?.querySelectorAll<HTMLInputElement>('input[data-section-input]')
  inputs?.[index]?.focus()
}
const addSection = (index: number) => {
  const level = form.sections[index]?.level ?? 0
  form.sections.splice(index + 1, 0, { level, text: '' })
  focusSection(index + 1)
}
const removeSection = (index: number) => {
  if (form.sections.length === 1) return
  form.sections.splice(index, 1)
  focusSection(Math.max(0, index - 1))
}
const onSectionKeydown = (e: KeyboardEvent, index: number) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    addSection(index)
  } else if (e.key === 'Tab') {
    e.preventDefault()
    form.sections[index].level = e.shiftKey ? 0 : 1
  } else if (e.key === 'Backspace' && form.sections[index].text === '' && form.sections.length > 1) {
    e.preventDefault()
    removeSection(index)
  }
}

// ── Resources ─────────────────────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
const onFilesSelected = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const f of Array.from(files)) form.resourceFiles.push({ name: f.name })
  ;(e.target as HTMLInputElement).value = ''
}
const addLink = async (afterIndex: number) => {
  form.resourceLinks.splice(afterIndex + 1, 0, '')
  await nextTick()
  document.querySelector<HTMLInputElement>(`[data-link-input="${afterIndex + 1}"]`)?.focus()
}
const removeLink = (i: number) => {
  if (form.resourceLinks.length === 1) { form.resourceLinks[0] = ''; return }
  form.resourceLinks.splice(i, 1)
}

// ── Navigation + skip-confirmation ────────────────────────────────────────────
const loading = ref(false)

const confirmOpen = ref(false)
const confirmMessage = ref('')
let confirmAction: (() => void) | null = null
const openConfirm = (message: string, action: () => void) => {
  confirmMessage.value = message
  confirmAction = action
  confirmOpen.value = true
}
const onConfirm = () => {
  confirmOpen.value = false
  const action = confirmAction
  confirmAction = null
  action?.()
}

const start = () => {
  phase.value = 'form'
  currentStep.value = 0
}
const back = () => {
  if (currentStep.value === 0) { phase.value = 'intro'; return }
  currentStep.value--
}
const proceed = () => {
  if (isLastStep.value) { void finish(); return }
  currentStep.value++
}
const next = () => {
  if (!stepValid.value) return
  if (step.value.key === 'prerequisites' && !hasPrereqs.value) {
    return openConfirm("You haven't added any prerequisites. Continue without them?", proceed)
  }
  if (step.value.key === 'resources' && !hasResources.value) {
    return openConfirm("You haven't added any resources. Continue without them?", proceed)
  }
  proceed()
}

// ── Build the prefilled editor draft ──────────────────────────────────────────
type DraftBlock = { type: 'markdown'; payload: { content: string } }
interface SyllabusDraft {
  name: string
  description: string
  blocks: DraftBlock[]
}
const syllabusDraft = ref<SyllabusDraft | null>(null)
const isCreating = ref(false)
const finalSyllabus = ref<{ name: string; description: string; blocks: Array<{ type: string; order: number; payload: Record<string, any> }> } | null>(null)
const recommended = ref<Array<{ _id: string; name: string; type?: string }>>([])

const md = (content: string): DraftBlock => ({ type: 'markdown', payload: { content } })

const buildDraft = (): SyllabusDraft => {
  const duration = form.weeks === 0
    ? `Single workshop (~${form.hoursPerSession}h)`
    : `${form.weeks} ${form.weeks === 1 ? 'week' : 'weeks'}, ~${form.hoursPerSession}h per session`
  const formatLabel = formatOptions.value.find(o => o.value === form.format)?.label ?? '—'

  const blocks: DraftBlock[] = []

  blocks.push(md([
    '## Overview',
    '',
    `- **Audience:** ${form.students.join(', ') || '—'}`,
    `- **Duration:** ${duration}`,
    `- **Format:** ${formatLabel}`,
    `- **Topics:** ${form.topics.join(', ') || '—'}`
  ].join('\n')))

  // Instructor / author block.
  const a = form.author
  const fullName = `${a.firstName} ${a.lastName}`.trim()
  if (fullName) {
    const lines = ['## Instructor', '']
    lines.push(a.university.trim() ? `**${fullName}** — ${a.university.trim()}` : `**${fullName}**`)
    const meta: string[] = []
    const gh = a.github.trim().replace(/^@/, '').replace(/^https?:\/\/(www\.)?github\.com\//i, '').replace(/^github\.com\//i, '')
    if (gh) meta.push(`- GitHub: https://github.com/${gh}`)
    if (a.researchProfile.trim()) meta.push(`- Research profile: ${a.researchProfile.trim()}`)
    if (a.expertise.length) meta.push(`- Expertise: ${a.expertise.join(', ')}`)
    if (a.cv) meta.push(`- CV: ${a.cv.name}`)
    if (meta.length) lines.push('', ...meta)
    const pubs = a.publications.split('\n').map(p => p.trim()).filter(Boolean)
    if (pubs.length) lines.push('', '**Selected publications**', ...pubs.map(p => `- ${p}`))
    blocks.push(md(lines.join('\n')))
  }

  if (form.objectives.length) {
    blocks.push(md(['## Learning objectives', '', ...form.objectives.map(o => `- ${o}`)].join('\n')))
  }

  const prereqs = form.prerequisites.map(p => p.trim()).filter(Boolean)
  if (prereqs.length) {
    blocks.push(md(['## Prerequisites', '', ...prereqs.map((p, i) => `${i + 1}. ${p}`)].join('\n')))
  }

  const outline = form.sections
    .map((s, i) => ({ s, num: sectionNumbers.value[i] }))
    .filter(({ s }) => s.text.trim())
    .map(({ s, num }) => `- ${num} ${s.text.trim()}`)
  if (outline.length) {
    blocks.push(md(['## Course outline', '', ...outline].join('\n')))
  }

  blocks.push(md(form.evaluate
    ? ['## Assessment', '', 'Students will be evaluated through:', ...form.evaluationMethods.map(m => `- ${m}`)].join('\n')
    : ['## Assessment', '', 'No formal evaluation.'].join('\n')))

  if (form.teacherServices.length || form.studentServices.length) {
    const parts = ['## Support', '']
    if (form.teacherServices.length) parts.push('**For the teacher:**', ...form.teacherServices.map(s => `- ${s}`), '')
    if (form.studentServices.length) parts.push('**For students:**', ...form.studentServices.map(s => `- ${s}`))
    blocks.push(md(parts.join('\n')))
  }

  const resourceLines = [
    ...form.resourceFiles.map(f => `- ${f.name}`),
    ...form.resourceLinks.map(l => l.trim()).filter(Boolean).map(l => `- ${l}`)
  ]
  if (resourceLines.length) {
    blocks.push(md(['## Existing resources', '', ...resourceLines].join('\n')))
  }

  if (recommended.value.length) {
    blocks.push(md([
      '## Recommended Academy activities',
      '',
      ...recommended.value.slice(0, 12).map(a => `- [${a.name}](/activity/${a._id})${a.type ? ` — ${a.type}` : ''}`)
    ].join('\n')))
  }

  return {
    name: form.title.trim(),
    description: `A course on the XRP Ledger${form.students.length ? ` for ${form.students.join(', ')}` : ''}.`,
    blocks
  }
}

const finish = async () => {
  loading.value = true
  try {
    // No filtering yet — pull the whole library and surface it as tailored picks.
    recommended.value = await $fetch('/api/activity-modules').catch(() => [])
  } finally {
    syllabusDraft.value = buildDraft()
    loading.value = false
    phase.value = 'editor'
  }
}

const onCreate = async (payload: { name: string; description: string; blocks: Array<{ type: string; order: number; payload: Record<string, any> }> }) => {
  isCreating.value = true
  try {
    const a = form.author
    const submission = {
      author: {
        firstName: a.firstName.trim(),
        lastName: a.lastName.trim(),
        name: `${a.firstName} ${a.lastName}`.trim(),
        university: a.university.trim(),
        github: a.github.trim(),
        researchProfile: a.researchProfile.trim(),
        publications: a.publications.trim(),
        expertise: [...a.expertise],
        cv: a.cv?.name ?? null
      },
      answers: {
        title: form.title.trim(),
        topics: [...form.topics],
        students: [...form.students],
        weeks: form.weeks,
        hoursPerSession: form.hoursPerSession,
        prerequisites: form.prerequisites.map(p => p.trim()).filter(Boolean),
        objectives: [...form.objectives],
        evaluate: form.evaluate,
        evaluationMethods: [...form.evaluationMethods],
        sections: form.sections
          .map((s, i) => ({ number: sectionNumbers.value[i], level: s.level, text: s.text.trim() }))
          .filter(s => s.text),
        resourceFiles: form.resourceFiles.map(f => f.name),
        resourceLinks: form.resourceLinks.map(l => l.trim()).filter(Boolean),
        format: formatOptions.value.find(o => o.value === form.format)?.label ?? form.format,
        teacherServices: [...form.teacherServices],
        studentServices: [...form.studentServices]
      },
      syllabus: { name: payload.name, description: payload.description, blocks: payload.blocks }
    }
    await $fetch('/api/submissions', { method: 'POST', body: submission })
    finalSyllabus.value = payload
    phase.value = 'done'
  } catch (error: any) {
    toast.add({
      title: 'Unable to create',
      description: error?.data?.statusMessage || error?.message || 'Please try again.',
      color: 'error'
    })
  } finally {
    isCreating.value = false
  }
}

onMounted(async () => {
  if (!user.value) {
    try { await fetchUser() } catch { /* anonymous handled by middleware */ }
  }
})
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
/* Take the leaving step out of flow so the card sizes to the incoming step
   immediately — prevents the oversize flash between steps. */
.slide-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
