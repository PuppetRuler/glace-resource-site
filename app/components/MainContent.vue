<template>
  <div
    id="scroll-container"
    ref="scrollContainer"
    class="h-full flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide"
  >
    <div class="max-w-7xl mx-auto space-y-8 md:space-y-12">
      <section
        v-for="(section, key) in curentNavData"
        :id="key"
        :key="key"
        :ref="
          (el) => {
            if (el) sectionRefs[key as string] = el as HTMLElement;
          }
        "
        :data-section="key"
        class="scroll-mt-8 mb-5"
      >
        <!-- 分组标题 -->
        <div
          class="flex items-center gap-2 md:gap-3 mb-4 md:mb-6 rounded-xl backdrop-blur-sm p-3 md:p-4 w-fit dark:shadow-[inset_-2px_2px_2px_0_rgba(255,255,255,0.2),-2px_2px_2px_2px_rgba(0,0,0,0.4)] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)]"
        >
          <UIcon
            :name="section.icon"
            class="text-xl md:text-2xl text-primary"
          />
          <h2 class="text-lg md:text-2xl font-bold text-primary">
            {{ section.label }}
          </h2>
        </div>

        <!-- 内容 - 动态列数 -->
        <div
          :class="[
            'grid gap-x-3 gap-y-3 md:gap-x-6 md:gap-y-4',
            isSidebarOpen
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
          ]"
        >
          <UCard
            v-for="item in section.items"
            :key="item.name"
            as="a"
            :href="item.url"
            target="_blank"
            :ui="{
              root: 'group cursor-pointer transition-all duration-300 hover:scale-105 rounded-full overflow-hidden bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm dark:shadow-[inset_-2px_2px_2px_0_rgba(255,255,255,0.2),-2px_2px_2px_2px_rgba(0,0,0,0.4)] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_12px_24px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.7)] ring-0',
              body: 'px-2 py-1.5 md:px-3 md:py-2 relative'
            }"
          >
            <div class="flex items-center gap-2 md:gap-2.5">
              <!-- 图标容器 - 响应式大小 -->
              <UAvatar
                :src='item.logo'
                referrerpolicy="no-referrer"
                :alt="item.name"
                loading="lazy"
                :class="[
                  'rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner',
                  isSidebarOpen
                    ? 'w-7 h-7 md:w-9 md:h-9'
                    : 'w-8 h-8 md:w-9 md:h-9'
                ]"
              />

              <!-- 文字内容 - 响应式字体 -->
              <div class="flex-1 min-w-0 pr-0.5 md:pr-1">
                <h3
                  :class="[
                    'text-gray-900 dark:text-white font-medium leading-tight truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors',
                    isSidebarOpen ? 'text-xs md:text-sm' : 'text-xs md:text-sm'
                  ]"
                >
                  {{ item.name }}
                </h3>
                <p
                  :class="[
                    'text-gray-600 dark:text-gray-400 leading-tight truncate',
                    isSidebarOpen
                      ? 'text-[10px] md:text-xs'
                      : 'text-[9px] md:text-xs'
                  ]"
                >
                  {{ item.description }}
                </p>
              </div>

              <!-- 右侧箭头图标 - 移动端隐藏 -->
              <div
                class="hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 shrink-0"
              >
                <UIcon
                  name="i-lucide-arrow-right"
                  class="text-gray-400 dark:text-primary-600 w-5 h-5 stroke-3"
                />
              </div>
            </div>
          </UCard>
        </div>

        <USeparator
          type="dashed"
          icon="i-lucide-scissors"
          class="mt-6 md:mt-10"
          size="sm"
          :ui="{
            border: 'border-gray-900 dark:border-gray-100'
          }"
        />
      </section>

      <footer class="space-y-4 md:space-y-6 pb-8 pt-8 md:pt-12">
        <div
          class="pb-12 md:pb-20 rounded-xl p-4 md:p-6 bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm dark:shadow-[inset_-2px_2px_2px_0_rgba(255,255,255,0.2),-2px_2px_2px_2px_rgba(0,0,0,0.4)] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] text-gray-900 dark:text-white"
        >
          <div class="flex items-center gap-2 md:gap-3 mb-2">
            <UIcon
              name="i-heroicons-information-circle"
              class="text-xl md:text-2xl text-emerald-400"
            />
            <h3 class="text-lg md:text-xl font-bold">
              关于本站
            </h3>
          </div>
          <UModal
            v-model:open="open"
            :ui="{
              content:
                'w-80 bg-transparent backdrop-blur-md ring-0 shadow-[inset_0_0_4px_1px_rgba(255,255,255,0.6),0_0_8px_1px_rgba(0,0,0,0.6)]',
              header: 'hidden'
            }"
            :overlay="false"
          >
            <span
              class="text-sm md:text-md leading-relaxed ml-6 md:ml-8 w-fit underline-animation transition-all duration-500 block"
            >
              本站创建的初衷是为诸位死宅构建一个高效、纯粹的资源聚合导航，
              内容涵盖技术开发与二次元ACG，深度整合了从模块开发、AI，到轻小说、Galgame
              及动漫资源。旨在剔除冗余，仅保留最值得收藏的日常工具。
            </span>
            <template #body>
              <div class="h-40 flex flex-col justify-around items-center">
                <div
                  class="w-full"
                  @mouseenter="hoveredIndex = 1"
                >
                  <UButton
                    class="w-full flex justify-center text-2xl active:bg-primary relative"
                    @click="changeNavMode('security')"
                  >
                    <UIcon
                      name="i-lucide-arrow-big-right"
                      class="absolute top-auto bottom-auto left-0"
                      :class="hoveredIndex === 1 ? 'opacity-100' : 'opacity-0'"
                    />
                    <span>H! 是不行的!</span>
                  </UButton>
                </div>
                <div
                  class="w-full"
                  @mouseenter="hoveredIndex = 2"
                >
                  <UButton
                    class="w-full flex justify-center bg-error hover:bg-error/80 active:bg-error text-2xl relative"
                    @click="changeNavMode('insecurity')"
                  >
                    <UIcon
                      name="i-lucide-arrow-big-right"
                      class="absolute top-auto bottom-auto left-0"
                      :class="hoveredIndex === 2 ? 'opacity-100' : 'opacity-0'"
                    />
                    <span>就要色色!</span>
                  </UButton>
                </div>
              </div>
            </template>
          </UModal>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import navDataJson from '~/assets/data/nav.json'

// 侧边栏功能
const navData = navDataJson as NavData
const { navMode, handleObserverEntries } = useNavigationStore()

// 侧边栏模式单独获取
const isSidebarOpen = useSideBarMode()

// 基础响应式数据与计算
const scrollContainer = ref<HTMLElement | null>(null)
const sectionRefs = ref<Record<string, HTMLElement>>({})
const curentNavData = computed(() => navData[navMode.value])

// 滚动监听逻辑 (IntersectionObserver)
let observer: IntersectionObserver | null = null

onMounted(() => {
  nextTick(() => {
    if (!scrollContainer.value) return

    observer = new IntersectionObserver(
      (entries) => {
        handleObserverEntries(entries)
      },
      {
        root: scrollContainer.value,
        rootMargin: '-10% 0px -70% 0px', // 顶部 10% 到 底部 70% 的判定区间
        threshold: [0, 0.2, 0.5, 0.8, 1]
      }
    )

    // 开始观察所有 Section 元素
    Object.values(sectionRefs.value).forEach((el) => {
      if (el) observer?.observe(el)
    })
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

// 修改内容的类型(security/insecurity)
const open = ref(false)
const hoveredIndex = ref(0)

defineShortcuts({
  shift_tab: () => (open.value = !open.value)
})

/**
 * 修改当前内容的类型 (security/insecurity)
 * @param {string} mode - 'security' or 'insecurity'
 */
function changeNavMode(mode: string) {
  if (mode !== navMode.value) {
    // 修改 Store 中的全局状态
    navMode.value = navMode.value === 'security' ? 'insecurity' : 'security'
  }
  open.value = false
}
</script>

<style scoped lang="scss">
.scrollbar-hide {
  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
}

.underline-animation {
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
  display: inline;
  background-image: linear-gradient(
    rgba(79, 192, 141, 0.5),
    rgba(79, 192, 141, 0.5)
  );
  background-repeat: no-repeat;
  background-position: 0% 100%;
  background-size: 100% 20%;
  transition: background-size 250ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    background-size: 100% 50%;
  }
}
</style>
