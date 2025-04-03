<template>
  <div class="main-layout">
    <div class="sidebar">
      <div class="sidebar-items">
        <router-link
          v-for="route in mainRoutes"
          :key="route.name"
          :to="{ name: route.name }"
          class="sidebar-item"
          :class="{ active: isActive(route) }"
        >
          <i :class="route.meta?.icon"></i>
        </router-link>
      </div>
      <div class="flex-1" style="app-region: drag"></div>
    </div>
    <div class="body">
      <custom-app-bar></custom-app-bar>
      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()

const mainRoutes = computed(() => {
  return (
    router.options.routes.find((r) => r.path === '/')?.children?.filter((r) => r.meta?.icon) || []
  )
})

const isActive = (routeItem: any) => {
  return route.name?.toString().startsWith(routeItem.name?.toString() || '')
}
</script>

<style lang="scss">
.main-layout {
  --at-apply: h-screen grid grid-cols-[auto_1fr];

  .sidebar {
    --at-apply: flex flex-col bg-[#282C34] p-3;

    &-items {
      --at-apply: flex flex-col gap-1;
    }

    &-item {
      --at-apply: text-2xl decoration-none text-[#ABB2BF];

      &.active {
        --at-apply: text-[#ff770f];
      }
    }
  }

  .body {
    --at-apply: grid grid-rows-[30px_1fr];
  }
}
</style>
