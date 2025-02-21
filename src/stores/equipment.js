import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useEquipmentStore = defineStore('equipment', () => {
  const equipmentList = ref([])
  
  function setEquipment(data) {
    equipmentList.value = data;
  }

  return { equipmentList, setEquipment }
})
