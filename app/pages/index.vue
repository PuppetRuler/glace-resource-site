<template>
  <div class="h-full w-full bg-img">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 vignette-overlay backdrop-saturate-150 z-0" />
    <AppBackground />
    
    <!-- 骨架屏状态 -->
    <template v-if="loading">
      <div class="h-full w-full flex flex-col">
        <!-- Header 骨架屏 -->
        <div class="h-16 border-b dark:border-gray-800 border-gray-300 backdrop-blur-xl">
          <div class="h-full px-6 flex items-center justify-between">
            <!-- Logo 骨架 -->
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />
              <div class="w-32 h-6 rounded bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />
            </div>
            
            <!-- 右侧按钮骨架 -->
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />
              <div class="w-10 h-10 rounded-lg bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />
            </div>
          </div>
        </div>

        <div class="flex h-[calc(100vh-4rem)] overflow-hidden">
          <!-- 侧边栏骨架屏 -->
          <div class="w-20 md:w-44 shrink-0 border-r dark:border-gray-800 border-gray-300 backdrop-blur-xl rounded-r-xl">
            <div class="pt-4 px-3 space-y-2">
              <div 
                v-for="i in 8" 
                :key="i"
                class="h-12 rounded-lg bg-gray-300/30 dark:bg-gray-700/30 animate-pulse"
                :style="{ animationDelay: `${i * 0.05}s` }"
              />
            </div>
          </div>

          <!-- 主内容骨架屏 -->
          <div class="flex-1 overflow-hidden p-4 md:p-8">
            <div class="max-w-7xl mx-auto space-y-8 md:space-y-12">
              <!-- 重复多个分组骨架 -->
              <div 
                v-for="section in 3" 
                :key="section"
                class="space-y-4"
              >
                <!-- 分组标题骨架 -->
                <div class="flex items-center gap-3 mb-6 p-4 w-fit rounded-xl">
                  <div class="w-8 h-8 rounded-lg bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />
                  <div class="w-32 h-7 rounded bg-gray-300/50 dark:bg-gray-700/50 animate-pulse" />
                </div>

                <!-- 卡片网格骨架 -->
                <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                  <div 
                    v-for="card in 8" 
                    :key="card"
                    class="h-16 md:h-20 rounded-full bg-gray-300/30 dark:bg-gray-700/30 backdrop-blur-sm animate-pulse"
                    :style="{ animationDelay: `${card * 0.05}s` }"
                  />
                </div>

                <!-- 分隔线骨架 -->
                <div class="mt-6 md:mt-10 h-px bg-gray-300/50 dark:bg-gray-700/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 实际内容 -->
    <template v-else>
      <AppHeader />
      <div class="flex h-[calc(100vh-4rem)] overflow-hidden">
        <!-- Navigation Menu -->
        <div class="w-fit shrink-0">
          <NavigationMenu
            :active-section="activeSection"
            @navigate="handleNavigate"
          />
        </div>

        <!-- Main Content -->
        <MainContent
          ref="mainContentRef"
          @section-change="handleSectionChange"
          class="flex-1"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import rawNavData from "~/assets/data/nav.json";
import * as ThumbHash from "~/assets/js/thumbhash";

// --- 1. 定义类型接口 ---
interface NavItem {
  name: string;
  url: string;
  description: string;
  logo: string;
}

interface NavCategory {
  label: string;
  icon: string;
  items: NavItem[];
}

type NavData = Record<string, NavCategory>;

// --- 2. 状态声明 ---
const navData = rawNavData as NavData;
const activeSection = ref<string | undefined>(undefined);

interface MainContentExpose {
  scrollToSection: (key: string) => void;
}

const mainContentRef = ref<MainContentExpose | null>(null);
const loading = ref(true);

// --- 3. 逻辑处理 ---
onMounted(() => {
  const keys = Object.keys(navData);
  if (keys.length > 0) {
    activeSection.value = keys[0];
  }

  // 骨架屏最小显示时间
  const minSkeletonMs = 800;
  setTimeout(() => {
    loading.value = false;
  }, minSkeletonMs);
});

const handleNavigate = (sectionKey: string): void => {
  if (mainContentRef.value) {
    mainContentRef.value.scrollToSection(sectionKey);
  }
};

const handleSectionChange = (sectionKey: string): void => {
  activeSection.value = sectionKey;
};

// 背景图片加载逻辑
onMounted(async () => {
  const el = document.querySelector(".bg-img") as HTMLElement;
  if (!el) return;

  const isDesktop = window.innerWidth >= 768;
  const ORIGINAL_URL = isDesktop
    ? "/img/bg.jpg"
    : "https://fastly.jsdelivr.net/gh/PuppetRuler/drawing-board@main/images/1726620907142bg.jpg";

  /* ========== 1. 生成 ThumbHash 占位图 ========== */
  const image = new Image();
  image.crossOrigin = "Anonymous";
  image.src = ORIGINAL_URL;

  try {
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const scale = 100 / Math.max(image.width, image.height);
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const binaryThumbHash = ThumbHash.rgbaToThumbHash(
        pixels.width,
        pixels.height,
        pixels.data
      );
      const placeholderURL = ThumbHash.thumbHashToDataURL(binaryThumbHash);

      el.style.setProperty("--bg-placeholder", `url(${placeholderURL})`);
    }
  } catch (e) {
    console.error("ThumbHash 生成失败:", e);
  }

  /* ========== 2. 加载原图 ========== */
  const img = new Image();
  img.src = ORIGINAL_URL;

  const finishLoading = () => {
    el.style.setProperty("--bg-img", `url(${ORIGINAL_URL})`);
    el.classList.add("loaded");
  };

  if (img.complete) {
    finishLoading();
  } else {
    img.onload = finishLoading;
    img.onerror = finishLoading;
  }
});
</script>

<style lang="scss">
/* Hide scrollbar */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

// 背景图片容器逻辑
.bg-img {
  position: relative;
  overflow: hidden;
  --bg-blur-opacity: 1;
  --bg-clear-opacity: 0;

  // 模糊层
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--bg-img-blur);
    background-size: cover;
    background-position: center;
    filter: blur(20px);
    transform: scale(1.1);
    opacity: var(--bg-blur-opacity);
    transition: opacity 0.5s ease;
    z-index: -2;
  }
  
  // 清晰层
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    background-image: var(--bg-img);
    background-size: cover;
    background-position: center;
    opacity: var(--bg-clear-opacity);
    transition: opacity 0.5s ease;
    z-index: -1;
  }
  
  // 加载完成
  &.loaded {
    --bg-blur-opacity: 0;
    --bg-clear-opacity: 1;
  }
}

// 遮罩层
.vignette-overlay {
  pointer-events: none;
  position: fixed;
  inset: 0;
  background-image: radial-gradient(
    ellipse at top right,
    rgba(var(--bg-gradient-home), 0.35) 0%,
    rgba(var(--bg-gradient-home), 0.5) 50%,
    rgba(var(--bg-gradient-home), 1) 100%
  );
  transition: background 300ms ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
}

.dark {
  .vignette-overlay {
    --bg-gradient-home: 20, 20, 20;
  }
}

// 淡入淡出动画
.fade-slide {
  &-enter-active,
  &-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
  }
  &-enter-from {
    opacity: 0;
    transform: translateY(10px);
  }
  &-leave-to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

// 骨架屏动画优化
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>