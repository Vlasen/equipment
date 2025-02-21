import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useLoadingStore } from './loadingCircle';
import axios from 'axios'

export const useCurrentEquipmentStore = defineStore('currentEquipment', () => {
  const currentEquipment = ref({})
  
  function setCurrentEquipment(data) {
    currentEquipment.value = data;
  };
  function resetCurrentEquipment() {
    currentEquipment.value = {};
  };
  async function getCurrentEquipmentById(id) {
    const loadingStore = useLoadingStore();
    loadingStore.changeValueLoading(true);
    try {
      const response = await axios.get(`https://6712a5e16c5f5ced662443cb.mockapi.io/api/v2/inventories/${id}`);
      currentEquipment.value = response.data;
    } catch (error) {
      console.error('Ошибка при получении данных товара: ', error);
    } finally {
      loadingStore.changeValueLoading(false);
    }
  };
  return { currentEquipment, setCurrentEquipment, resetCurrentEquipment, getCurrentEquipmentById }
})
