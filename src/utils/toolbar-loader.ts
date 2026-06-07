import { readonly, ref } from 'vue'

const isToolbarLoading = ref(false)

export function useToolbarLoader() {
  return {
    isToolbarLoading: readonly(isToolbarLoading),
    setToolbarLoading
  }
}

export function setToolbarLoading(value: boolean) {
  isToolbarLoading.value = value
}
