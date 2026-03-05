import { useLocalStorage } from '@vueuse/core'

export function useRankingOrder() {
  const ascending = useLocalStorage('tt-ranking-order-asc', false)

  function toggle() {
    ascending.value = !ascending.value
  }

  return {
    ascending,
    toggle,
  }
}
