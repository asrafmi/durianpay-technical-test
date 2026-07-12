<script setup lang="ts">
import { onMounted, onBeforeUnmount, watch, useTemplateRef } from 'vue'
import lottie, { type AnimationItem } from 'lottie-web'

const props = withDefaults(
  defineProps<{
    animationData: object
    loop?: boolean
    autoplay?: boolean
  }>(),
  {
    loop: true,
    autoplay: true,
  },
)

const container = useTemplateRef<HTMLDivElement>('container')
let animationInstance: AnimationItem | null = null

function play() {
  if (!container.value) return
  animationInstance?.destroy()
  animationInstance = lottie.loadAnimation({
    container: container.value,
    renderer: 'svg',
    loop: props.loop,
    autoplay: props.autoplay,
    animationData: props.animationData,
  })
}

onMounted(play)
watch(() => props.animationData, play)

onBeforeUnmount(() => {
  animationInstance?.destroy()
})
</script>

<template>
  <div ref="container" />
</template>
