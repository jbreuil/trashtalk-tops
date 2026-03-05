import { useLocalStorage } from '@vueuse/core'

export function useSpoiler() {
  const spoilerOn = useLocalStorage('tt-spoiler', true)

  function toggle() {
    spoilerOn.value = !spoilerOn.value
  }

  return {
    spoilerOn,
    toggle,
  }
}
