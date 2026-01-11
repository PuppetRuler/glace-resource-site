<template>
  <div
    id="scroll-container"
    ref="scrollContainer"
    class="h-full flex-1 overflow-y-auto p-8 scrollbar-hide"
  >
    <div class="max-w-7xl mx-auto space-y-12">
      <section
        v-for="(section, key) in navData"
        :key="key"
        :id="key"
        :ref="(el) => { if (el) sectionRefs[key as string] = el as HTMLElement }"
        :data-section="key"
        class="scroll-mt-8 mb-5"
      >
        <!-- 分组标题 -->
        <div class="flex items-center gap-3 mb-6 rounded-xl backdrop-blur-sm p-4 w-fit dark:shadow-[inset_-2px_2px_2px_0_rgba(255,255,255,0.2),-2px_2px_2px_2px_rgba(0,0,0,0.4)] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)]">
          <UIcon :name="section.icon" class="text-2xl text-primary" />
          <h2 class="text-2xl font-bold text-primary">{{ section.label }}</h2>
        </div>
        <!-- 内容 -->
        <div
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4"
        >
          <UCard
            v-for="item in section.items"
            :key="item.name"
            as="a"
            :href="item.url"
            target="_blank"
            :ui="{
              root: 'group cursor-pointer transition-all duration-300 hover:scale-105 rounded-full overflow-hidden bg-white/10 dark:bg-gray-900/10 backdrop-blur-sm dark:shadow-[inset_-2px_2px_2px_0_rgba(255,255,255,0.2),-2px_2px_2px_2px_rgba(0,0,0,0.4)] shadow-[inset_0_2px_2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.15),0_12px_24px_rgba(0,0,0,0.4)] dark:hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_12px_24px_rgba(0,0,0,0.7)] ring-0',
              body: 'px-3 py-2 relative',
            }"
          >
            <div class="flex items-center gap-2.5">
              <!-- 图标容器 -->
              <div
                class="w-9 h-9 rounded-full bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner"
              >
                <UIcon
                  :name="item.logo || 'i-heroicons-globe-alt'"
                  :class="[
                    'text-lg transition-colors',
                    !item.logo
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-700 dark:text-gray-300',
                  ]"
                />
              </div>

              <!-- 文字内容 -->
              <div class="flex-1 min-w-0 pr-1">
                <h3
                  class="text-gray-900 dark:text-white font-medium text-sm leading-tight truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  {{ item.name }}
                </h3>
                <p
                  class="text-xs text-gray-600 dark:text-gray-400 leading-tight truncate"
                >
                  {{ item.description }}
                </p>
              </div>

              <!-- 右侧箭头图标 -->
              <div
                class="opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 shrink-0"
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
          class="mt-10"
          size="sm"
          :ui="{
            border: 'border-gray-900 dark:border-gray-100',
          }"
        />
      </section>

      <footer class="space-y-6 pb-8 border-t border-gray-800 pt-12">
        <div class="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div class="flex items-center gap-3 mb-4">
            <UIcon
              name="i-heroicons-information-circle"
              class="text-2xl text-emerald-400"
            />
            <h3 class="text-xl font-bold text-white">关于本站</h3>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed">
            glace的资源站致力于分享优质的 ACG 相关资源。
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from "vue";
import navDataJson from "~/assets/data/nav.json";

// 类型定义，解决 TS 2339 / 2322 报错
interface NavItem {
  name: string;
  url: string;
  description: string;
  logo: string;
}
interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

const navData = navDataJson as Record<string, NavGroup>;
const scrollContainer = ref<HTMLElement | null>(null);

// 显式指定 Record 类型，修复 key 索引报错
const sectionRefs = ref<Record<string, HTMLElement>>({});

// 共享全局状态
const activeSection = useState<string>("activeNavId", () => "anime");
const isManualScrolling = useState<boolean>("isManualScrolling", () => false);

let observer: IntersectionObserver | null = null;

onMounted(() => {
  nextTick(() => {
    if (!scrollContainer.value) return;

    observer = new IntersectionObserver(
      (entries) => {
        // 如果是手动点击导航引发的滚动，不更新高亮
        if (isManualScrolling.value) return;

        let maxRatio = 0;
        let activeKey = "";

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            activeKey = (entry.target as HTMLElement).dataset.section || "";
          }
        });

        if (activeKey) {
          activeSection.value = activeKey;
        }
      },
      {
        root: scrollContainer.value,
        rootMargin: "-10% 0px -70% 0px", // 触发位置偏向视口上方
        threshold: [0, 0.2, 0.5, 0.8, 1],
      }
    );

    // 观察所有已存储的 section
    Object.values(sectionRefs.value).forEach((el) => {
      if (el) observer?.observe(el);
    });
  });
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
