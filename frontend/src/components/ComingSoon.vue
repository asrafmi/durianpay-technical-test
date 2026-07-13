<script setup lang="ts">
import { useRouter } from 'vue-router'
import LottiePlayer from './LottiePlayer.vue'
import developmentAnimation from '../assets/animation/under-development-animation.json'

const router = useRouter()

function goBack() {
  router.back()
}
</script>

<template>
  <div class="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-2 bg-bg-page px-6 text-center font-sans text-text-primary">
    <LottiePlayer
      :animation-data="developmentAnimation"
      class="animate-page-enter-media h-[300px] w-[300px]"
      style="animation-delay: 0s"
    />

    <h1
      class="animate-page-enter-up text-2xl font-bold tracking-tight"
      style="animation-delay: 0.3s"
    >
      Oops! This Page Isn't Ready Yet :(
    </h1>

    <p
      class="animate-page-enter-up max-w-[520px] text-sm leading-relaxed text-text-muted"
      style="animation-delay: 0.6s"
    >
      This page is still under development. Please check back later.
      <br />
      Sorry for the inconvenience.
    </p>

    <div class="mt-4 flex items-center gap-3">
      <div class="animate-page-enter-up" style="animation-delay: 0.9s">
        <RouterLink
          to="/dashboard"
          class="inline-block cursor-pointer rounded-[10px] bg-primary px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          Go to Dashboard
        </RouterLink>
      </div>
      <div class="animate-page-enter-up" style="animation-delay: 1.2s">
        <button
          type="button"
          class="cursor-pointer rounded-[10px] border border-border bg-white px-5 py-2.5 font-sans text-sm font-semibold text-text-primary transition-colors hover:border-border-hover"
          @click="goBack"
        >
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>
