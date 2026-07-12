<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'
import durianpayLogo from '../assets/brand/durianpay-logo.avif'
import loginAnimation from '../assets/login-animation.json'

const lottieContainer = useTemplateRef<HTMLDivElement>('lottieContainer')
let animationInstance: AnimationItem | null = null

onMounted(() => {
  if (!lottieContainer.value) return
  animationInstance = lottie.loadAnimation({
    container: lottieContainer.value,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    animationData: loginAnimation,
  })
})

onBeforeUnmount(() => {
  animationInstance?.destroy()
})
</script>

<template>
  <div
    class="relative grid h-screen w-screen grid-cols-1 overflow-hidden bg-[#F6F6F8] font-sans text-[#14151C] md:grid-cols-2"
  >
    <div class="hidden flex-col justify-between bg-[#14151C] p-14 md:flex">
      <div class="flex items-center gap-3">
        <img :src="durianpayLogo" alt="Durianpay" class="h-10 w-10" />
        <div class="text-xl font-bold tracking-tight text-white">Durianpay</div>
      </div>

      <div>
        <div class="relative mb-2 h-[260px] w-[260px]">
          <div ref="lottieContainer" class="h-[260px] w-[260px]"></div>
          <div
            class="animate-float-a absolute top-1.5 -left-7 h-[22px] w-[22px] text-center text-[22px] leading-[22px] text-[#5A5B66]"
          >
            +
          </div>
          <div
            class="animate-float-b absolute top-9 -right-6 h-[18px] w-[18px] rounded-full border-[1.5px] border-[#5A5B66]"
          ></div>
          <div
            class="animate-float-c absolute bottom-[34px] -left-[30px] h-4 w-4 rounded-full border-[1.5px] border-[#5A5B66]"
          ></div>
          <div
            class="animate-float-d absolute -right-[22px] bottom-2 h-4 w-4 rotate-45 border-[1.5px] border-[#5A5B66]"
          ></div>
        </div>
        <div class="max-w-[420px] text-4xl leading-tight font-bold tracking-tight text-white">
          Payments Ops Dashboard
        </div>
        <div class="mt-4 max-w-[400px] text-base leading-relaxed text-[#9A9AA6]">
          Monitor incoming payments, track settlement status, and act on exceptions in real
          time.
        </div>
      </div>

      <div class="text-[13px] text-[#6B6B76]">© 2026 PT Durian Pay Indonesia — Internal Tool</div>
    </div>

    <div class="flex items-center justify-center overflow-y-auto bg-white p-10">
      <div class="w-full max-w-[380px]">
        <div class="mb-2 text-2xl font-bold">Welcome back</div>
        <div class="mb-7 text-[15px] text-[#6B6B76]">Sign in to access the payments dashboard.</div>

        <form class="flex flex-col gap-4">
          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-[#3A3B45]">Email</label>
            <input
              type="email"
              placeholder="you@durianpay.id"
              class="w-full rounded-[10px] border border-[#E5E5EA] px-3.5 py-3 font-sans text-[15px] text-[#14151C] placeholder-[#ACACB4] outline-none"
            />
          </div>
          <div>
            <label class="mb-1.5 block text-[13px] font-semibold text-[#3A3B45]">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              class="w-full rounded-[10px] border border-[#E5E5EA] px-3.5 py-3 font-sans text-[15px] text-[#14151C] placeholder-[#ACACB4] outline-none"
            />
          </div>

          <button
            type="submit"
            class="mt-1 cursor-pointer rounded-[10px] border-none bg-[#E31C4D] p-[13px] font-sans text-[15px] font-semibold text-white transition-colors hover:bg-[#B8123A]"
          >
            Sign in
          </button>
        </form>

        <div class="mt-6 rounded-[10px] bg-[#F6F6F8] p-4 text-[13px] leading-loose text-[#6B6B76]">
          <div class="mb-1.5 font-semibold text-[#3A3B45]">Demo credentials</div>
          <div>CS Agent — cs@durianpay.id / password</div>
          <div>Operations — ops@durianpay.id / password</div>
        </div>

        <div class="mt-3 flex gap-2.5">
          <button
            type="button"
            class="flex-1 cursor-pointer rounded-lg border border-[#E5E5EA] bg-white p-2.5 font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA]"
          >
            Continue as CS
          </button>
          <button
            type="button"
            class="flex-1 cursor-pointer rounded-lg border border-[#E5E5EA] bg-white p-2.5 font-sans text-[13px] font-semibold text-[#14151C] transition-colors hover:border-[#B0B0BA]"
          >
            Continue as Operations
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
