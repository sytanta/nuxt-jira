<script setup lang="ts">
import { useDragAndDrop } from "fluid-dnd/vue";
import 'vue-sonner/style.css'

import useAuthStore from './stores/auth';

const authStore = useAuthStore()
await authStore.init()

provide('useDragAndDrop', useDragAndDrop);
</script>

<template>
  <Loader v-if="authStore.isFirstLoading" class="fixed size-full top-0 left-0 bg-white z-10" />

  <NuxtLayout>
    <NuxtPage></NuxtPage>
  </NuxtLayout>

  <!-- Vue sonner -->
  <Toaster />
</template>