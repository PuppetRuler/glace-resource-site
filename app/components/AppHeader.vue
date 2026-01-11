<template>
  <UHeader class="dark:border-b-black/20 backdrop-blur-3x">
    <template #left>
      <div class="flex items-center gap-3">
        <UAvatar class="h-10 w-auto" size="3xl" src="/favicon.ico" />
        <UButton
          icon="i-heroicons-bars-3"
          variant="ghost"
          color="neutral"
          size="xl"
          class="hover:bg-white/10"
          @click="toggleSidebar"
        />
        <h1
          class="text-[0.5em] sm:text-3xl sm:pl-2 font-bold tracking-wide transition-all duration-300 bg-clip-text text-transparent bg-linear-to-br from-zinc-900 via-zinc-700 to-zinc-400 dark:from-white dark:via-white/80 dark:to-white/20"
        >
          glace的资源站
        </h1>
      </div>
    </template>
    <template #right>
      <UButton
        icon="i-simple-icons-github"
        label="GitHub"
        to="https://github.com/PuppetRuler"
        target="_blank"
        variant="ghost"
        color="neutral"
        class="hover:bg-white/10"
      />
      <ColorModeButton />
    </template>
  </UHeader>
</template>

<script setup lang="ts">
// 定义侧边栏状态，默认为开启 (true)
// 使用 useState('isSidebarOpen') 确保在所有组件中共享同一个响应式变量
const isSidebarOpen = useState<boolean>("isSidebarOpen", () => true);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>

<style lang="scss">
button[aria-label="Open menu"] {
  display: none;
}
</style>
