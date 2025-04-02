<template>
  <div class="flex justify-end overflow-hidden">
    <div class="flex-1" style="app-region: drag;"></div>
    <div>
      <n-button quaternary @click="minimize">
        <i class="i-tabler-minus"></i>
      </n-button>
      <n-button quaternary @click="toggleMaximize">
        <i class="i-tabler-maximize" v-if="!isMaximized"></i>
        <i class="i-tabler-minimize" v-else></i>
      </n-button>
      <n-button quaternary @click="close" class="close-btn">
        <i class="i-tabler-x"></i>
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { minimize, toggleMaximize, close, onMaximized, onUnmaximized } = window.api

const isMaximized = ref(false)

// 监听窗口状态变化
onMounted(() => {
  onMaximized(() => {
    isMaximized.value = true
  })

  onUnmaximized(() => {
    isMaximized.value = false
  })
})
</script>

<style scoped></style>
