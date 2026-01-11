<template>
  <div class="h-full w-full bg-img">
    <!-- 遮罩层 -->
    <div class="fixed inset-0 vignette-overlay backdrop-saturate-150 z-0" />
    <AppBackground />
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

// 对应 JSON 的 Record 结构，键名如 "light_novel_acg"
type NavData = Record<string, NavCategory>;

// --- 2. 状态声明 ---

// 显式断言导入的 JSON 符合 NavData 接口
const navData = rawNavData as NavData;

// 当前活动的 Section 键名
const activeSection = ref<string | undefined>(undefined);

// 定义 MainContent 组件的暴露接口类型
// 假设该组件通过 defineExpose 暴露了 scrollToSection 方法
interface MainContentExpose {
  scrollToSection: (key: string) => void;
}

const mainContentRef = ref<MainContentExpose | null>(null);

// --- 3. 逻辑处理 ---

// 初始化时设置第一个 section 为活动状态
onMounted(() => {
  const keys = Object.keys(navData);
  if (keys.length > 0) {
    activeSection.value = keys[0];
  }
});

/**
 * 处理从菜单点击的导航
 * @param sectionKey - 对应 navData 中的分类键名
 */
const handleNavigate = (sectionKey: string): void => {
  if (mainContentRef.value) {
    mainContentRef.value.scrollToSection(sectionKey);
  }
};

/**
 * 处理由于页面滚动触发的活动 Section 变更
 * @param sectionKey - 滚动检测到的当前分类键名
 */
const handleSectionChange = (sectionKey: string): void => {
  activeSection.value = sectionKey;
};

// 简单加载状态：可以在未来替换为真实的数据加载逻辑或由子组件触发
const loading = ref(true);

onMounted(() => {
  // 给出一个最小的骨架显示时间以避免闪烁
  const minSkeletonMs = 350;
  setTimeout(() => (loading.value = false), minSkeletonMs);
});

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
      image.onerror = reject; // 捕获加载失败
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

  /* ========== 2. 写入占位背景（模糊层） ========== */

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
    img.onerror = finishLoading; // 避免卡死在模糊状态
  }
});
</script>

<style lang="scss">
/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

// 背景图片容器逻辑
.bg-img {
  position: relative;
  overflow: hidden;
  --bg-blur-opacity: 1;
  --bg-clear-opacity: 0;

  // 模糊层 (Before)
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
  // 清晰层 (After)
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
  // 加载完成后的状态切换
  &.loaded {
    --bg-blur-opacity: 0;
    --bg-clear-opacity: 1;
  }
}
// 遮罩层：径向渐变
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
// 深色模式适配
.dark {
  .vignette-overlay {
    --bg-gradient-home: 20, 20, 20;
  }
}
// 统一内容切换动画 (Nuxt Transition)
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
</style>
