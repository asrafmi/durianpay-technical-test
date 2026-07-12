import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

interface TypewriterOptions {
  typeSpeed?: number
  deleteSpeed?: number
  holdDelay?: number
}

export function useTypewriter(texts: Ref<string[]> | string[], options: TypewriterOptions = {}) {
  const { typeSpeed = 55, deleteSpeed = 30, holdDelay = 1800 } = options
  const displayText = ref('')
  let timer: ReturnType<typeof setTimeout> | undefined
  let textIndex = 0
  let charIndex = 0
  let deleting = false

  const getTexts = () => ('value' in texts ? texts.value : texts)

  const tick = () => {
    const list = getTexts()
    if (list.length === 0) return
    const current = list[textIndex % list.length]

    if (!deleting) {
      charIndex++
      displayText.value = current.slice(0, charIndex)
      if (charIndex === current.length) {
        deleting = true
        timer = setTimeout(tick, holdDelay)
        return
      }
      timer = setTimeout(tick, typeSpeed)
    } else {
      charIndex--
      displayText.value = current.slice(0, charIndex)
      if (charIndex === 0) {
        deleting = false
        textIndex++
        timer = setTimeout(tick, typeSpeed)
        return
      }
      timer = setTimeout(tick, deleteSpeed)
    }
  }

  onMounted(() => {
    timer = setTimeout(tick, typeSpeed)
  })

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  return { displayText }
}
