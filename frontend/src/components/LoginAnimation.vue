<script setup lang="ts">
import { onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'
import loginAnimation from '../assets/animation/login-animation.json'

const container = useTemplateRef<HTMLDivElement>('container')
let animationInstance: AnimationItem | null = null

onMounted(() => {
  if (!container.value) return
  animationInstance = lottie.loadAnimation({
    container: container.value,
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
  <div ref="container" />
</template>
