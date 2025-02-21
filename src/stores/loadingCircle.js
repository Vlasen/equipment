import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useLoadingStore = defineStore('loadingCircle', () => {
  const isLoading = ref(false);
  
  function changeValueLoading(data) {
    isLoading.value = data;
  }

  return { isLoading, changeValueLoading }
})
