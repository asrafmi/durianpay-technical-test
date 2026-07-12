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
  <div class="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-2 bg-[#F6F6F8] px-6 text-center font-sans text-[#14151C]">
    <LottiePlayer
      :animation-data="developmentAnimation"
      class="animate-page-enter-media h-[300px] w-[300px]"
      style="animation-delay: 0s"
    />

    <h1
      class="animate-page-enter-up text-2xl font-bold tracking-tight"
      style="animation-delay: 0.3s"
    >
      Oops! Halaman Belum Tersedia :(
    </h1>

    <p
      class="animate-page-enter-up max-w-[520px] text-sm leading-relaxed text-[#6B6B76]"
      style="animation-delay: 0.6s"
    >
      Halaman ini sedang dalam pengembangan. Mohon tunggu beberapa saat hingga kurun waktu
      yang tidak dapat ditentukan.
      <br />
      Mohon maaf atas ketidaknyamanannya.
    </p>

    <div class="mt-4 flex items-center gap-3">
      <div class="animate-page-enter-up" style="animation-delay: 0.9s">
        <RouterLink
          to="/dashboard"
          class="inline-block cursor-pointer rounded-[10px] bg-[#E31C4D] px-5 py-2.5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#B8123A]"
        >
          Halaman Dashboard
        </RouterLink>
      </div>
      <div class="animate-page-enter-up" style="animation-delay: 1.2s">
        <button
          type="button"
          class="cursor-pointer rounded-[10px] border border-[#E5E5EA] bg-white px-5 py-2.5 font-sans text-sm font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA]"
          @click="goBack"
        >
          Kembali
        </button>
      </div>
    </div>
  </div>
</template>
