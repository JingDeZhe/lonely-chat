<script setup lang="ts"></script>

<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-notification-provider>
        <n-loading-bar-provider>
          <app-utils>
            <router-view></router-view>
          </app-utils>
        </n-loading-bar-provider>
      </n-notification-provider>
    </n-dialog-provider>
  </n-message-provider>
</template>

<style lang="scss"></style>
