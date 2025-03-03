<script setup>
import axios from 'axios'
import { useRouter } from 'vue-router';
import { onMounted, ref, computed } from "vue"
import { useEquipmentStore } from '../stores/equipment';
import { useLoadingStore } from '../stores/loadingCircle';
import { useCurrentEquipmentStore } from '../stores/currentEquipment';

const router = useRouter();

const equipmentStore = useEquipmentStore();
const loadingStore = useLoadingStore();
const currentEquipmentStore = useCurrentEquipmentStore();

const currentPage = ref(1);
const itemsPerPage = ref(9);

async function getEquipment () {
  loadingStore.changeValueLoading(true);
  try {
    const response = await axios.get('https://6712a5e16c5f5ced662443cb.mockapi.io/api/v2/inventories');
    equipmentStore.setEquipment(response.data);
  } catch (error) {
    console.error(error);
  } finally {
    loadingStore.changeValueLoading(false);
  }
};
onMounted(() => {
  getEquipment();
});

const paginatedEquipment = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value;
  const endIndex = startIndex + itemsPerPage.value;
  return equipmentStore.equipmentList.slice(startIndex, endIndex);
});

function nextPage () {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
const totalPages = computed(() => {
  return Math.ceil(equipmentStore.equipmentList.length / itemsPerPage.value);
});

async function openEquipmentPage (id) {
  await currentEquipmentStore.getCurrentEquipmentById(id);
  router.push(`/${id}`);
};
function mouseMoveGradient(event) {
  let elem = event.target;
  if (elem.getAttribute('class') == "topGradientLayer") {
    let box = elem.getBoundingClientRect();
    let X = event.clientX - box.left;
    let Y = event.clientY - box.top;

    let xPercent = X / (box.width / 100);
    let yPercent = Y / (box.height / 100);
    elem.style.background = `radial-gradient(circle 35px at ${xPercent}% ${yPercent}%, rgba(114, 150, 213, .5), rgba(0, 0, 0, 0))`;
  }
};
function mouseLeave(event) {
  let elem = event.target;
  if (elem.getAttribute('class') == "topGradientLayer") {
    elem.style.background = "none";
  }
};
</script>

<template>
  <main class="main-list">
    <section class="equipment-card" v-for="equipment in paginatedEquipment">
      <img class="equipment-avatar" alt="Equipment avatar" :src="equipment.avatar"/>
      <div class="topGradientLayer" 
        @mousemove="mouseMoveGradient" 
        @mouseleave="mouseLeave"
        @click="openEquipmentPage(equipment.id)"
        >
      </div>
      <div class="text-info">
        <h1>{{ equipment.title }}</h1>
        <div class="category-wrapper" v-if="equipment.category">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="rgb(114, 150, 213)" d="m12 2l-5.5 9h11zm0 3.84L13.93 9h-3.87zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5s4.5-2.01 4.5-4.5s-2.01-4.5-4.5-4.5m0 7a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5M3 21.5h8v-8H3zm2-6h4v4H5z"/></svg>
          <h3>{{ equipment.category }}</h3>
        </div>
        <h3>Количество: {{ equipment.count }}</h3>
        <h2>{{ equipment.price }}</h2>
      </div>  
    </section>

    <div class="pagination">
      <button class="back-btn" :disabled="currentPage === 1" @click="prevPage">
        <h1>Назад</h1>
        <svg class="back-svg" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="rgb(4, 16, 50)" fill-rule="evenodd" d="M17 15a1 1 0 0 0 .707-1.707l-5-5a1 1 0 0 0-1.414 0l-5 5A1 1 0 0 0 7 15z" clip-rule="evenodd"/>
            </svg>
      </button>
      <h3>Страница {{ currentPage }} из {{ totalPages }}</h3>
      <button :disabled="currentPage === totalPages" @click="nextPage">
        <h1>Вперед</h1>
        <svg class="next-svg" xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="rgb(4, 16, 50)" fill-rule="evenodd" d="M17 15a1 1 0 0 0 .707-1.707l-5-5a1 1 0 0 0-1.414 0l-5 5A1 1 0 0 0 7 15z" clip-rule="evenodd"/></svg>
      </button>
    </div>

    <button class="add-new-equipment-btn" type="button" @click="router.push('/add')">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="rgb(4, 16, 50)" fill-rule="evenodd" d="M277.119 65.93v168.951h168.952v42.238H277.119v168.952h-42.238V277.119H65.93v-42.238h168.951V65.93z"/></svg>
    </button>
  </main>
  <article class="circle-loading-wraper" v-if="loadingStore.isLoading">
    <svg xmlns="http://www.w3.org/2000/svg" width="74" height="74" viewBox="0 0 24 24"><defs><linearGradient id="mingcuteLoadingLine0" x1="50%" x2="50%" y1="5.271%" y2="91.793%"><stop offset="0%" stop-color="rgb(114, 150, 213)"/><stop offset="100%" stop-color="rgb(114, 150, 213)" stop-opacity="0.55"/></linearGradient><linearGradient id="mingcuteLoadingLine1" x1="50%" x2="50%" y1="8.877%" y2="90.415%"><stop offset="0%" stop-color="rgb(114, 150, 213)" stop-opacity="0"/><stop offset="100%" stop-color="rgb(114, 150, 213)" stop-opacity="0.55"/></linearGradient></defs><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="url(#mingcuteLoadingLine0)" d="M8.886.006a1 1 0 0 1 .22 1.988A8.001 8.001 0 0 0 10 17.944v2c-5.523 0-10-4.476-10-10C0 4.838 3.848.566 8.886.007Z" transform="translate(2 2.055)"/><path fill="url(#mingcuteLoadingLine1)" d="M14.322 1.985a1 1 0 0 1 1.392-.248A9.99 9.99 0 0 1 20 9.945c0 5.523-4.477 10-10 10v-2a8 8 0 0 0 4.57-14.567a1 1 0 0 1-.248-1.393" transform="translate(2 2.055)"/></g></svg>
  </article>
</template>

<style lang="scss" scoped>
.main-list {
  position: relative;
  display: grid;
  grid-auto-rows: min-content;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 60px;
  height: auto;
  min-height: calc(100vh - 150px);
  width: 100%;
  padding: 40px 80px;
  background: var(--color-dark-blue);
  @media (max-width: 1786px) {
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  }
  @media (max-width: 1500px) {
    min-height: calc(100vh - 108px);
    gap: 40px;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  }
  @media (max-width: 1340px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  @media (max-width: 930px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
  @media (max-width: 840px) {
    min-width: 230px;
    padding: 40px;
    grid-template-columns: repeat(1, minmax(220px, 1fr));
  }
  @media (max-width: 620px) {
    min-height: calc(100vh - 88px);
  }
  @media (max-width: 500px) {
    min-height: calc(100vh - 108px);
    min-width: 450px;
    padding: 40px 20px;
  }
  @media (max-width: 360px) {
    min-height: calc(100vh - 88px);
    min-width: 300px;
    gap: 20px;
  }
  .equipment-card {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    background: var(--color-blue);
    border-radius: 10px;
    min-width: 500px;
    max-width: 600px;
    height: 100%;
    max-height: 300px;
    padding-right: 15px;
    box-shadow: 0 0 35px rgb(0, 0, 0, .6);
    @media (max-width: 1786px) {
      min-width: 400px;
      max-width: 468.6px;
      min-height: 220px;
    }
    @media (max-width: 1500px) {
      min-width: 380px;
      max-width: 450px;
    }
    @media (max-width: 1340px) {
      min-width: 300px;
      max-width: 540px;
      min-height: 129px;
      max-height: 195px;
    }
    @media (max-width: 930px) {
      min-width: 330px;
      max-width: 540px;
      min-height: 190px;
    }
    @media (max-width: 840px) {
      min-width: 220px;
      max-width: 760px;
    }
    @media (max-width: 500px) {
      min-width: 405px;
      max-width: 760px;
    }
    @media (max-width: 360px) {
      min-width: 260px;
      max-width: 300px;
      min-height: 140px;
    }
    .equipment-avatar {
      max-width: 40%;
      border-radius: 10px 0 0 10px;
      min-width: 170px;
      @media (max-width: 1340px) {
        border-radius: 10px 0 0 0;
        min-width: 110px;
        max-height: 130px;
      }
      @media (max-width: 1079px) {
        min-width: 150px;
        max-height: 100%;
      }
      @media (max-width: 360px) {
        min-width: 110px;
        max-height: 100%;
      }
    }
    .topGradientLayer {
      position: absolute;
      border-radius: 10px;
      z-index: 2;
      height: 100%;
      width: 100%;
      cursor: pointer;
    }
    .text-info {
      position: relative;
      height: 100%;
      width: 70%;
      margin: 10px 0 0 20px;
      gap: 10px;
      @media (max-width: 1500px) {
        margin: 10px 0 0 10px;
        width: 50%;
      }
      @media (max-width: 1340px) {
        margin: 10px 0 0 10px;
        width: 60%;
      }
      @media (max-width: 930px) {
        width: 50%;
      }
      @media (max-width: 840px) {
        width: 70%;
      }
      @media (max-width: 360px) {
        width: 60%;
      }
      h1 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        text-overflow: ellipsis;  
        line-clamp: 2;
        white-space: normal;
        word-break: break-all;
      }
      h2 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 1;
        text-overflow: ellipsis;  
        line-clamp: 1;
        white-space: normal;
        word-break: break-all;
      }
      .category-wrapper {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        margin-top: 15px;
        width: auto;
        @media (max-width: 1786px) {
          margin-top: 5px;
        }
        @media (max-width: 1340px) {
          position: absolute;
          bottom: 18px;
          left: -65%;
          width: 120px;
        }
        @media (max-width: 1079px) {
          position: static;
        }
        h3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
          text-overflow: ellipsis;  
          line-clamp: 1;
          white-space: normal;
          word-break: break-all;
        }
        svg {
            width: 24px;
            height: 24px;
          @media (max-width: 360px) {
            max-width: 18px;
            max-height: 18px;
          }
        }
      }
    }
  }
  .pagination {
    grid-column: -1 / 1;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    height: 80px;
    gap: 20px;
    button {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 160px;
      height: 50px;
      border-radius: 50px;
      background: var(--color-light-blue);
      color: var(--color-dark-blue);
      border: none;
      cursor: pointer;
      @media (max-width: 740px) {
        width: 50px;
        height: 50px;
      }
      @media (max-width: 360px) {
        width: 40px;
        height: 40px;
      }
      h1 {
        font-size: 20px;
        color: var(--color-dark-blue);
        @media (max-width: 740px) {
          display: none;
        }
      }
      svg {
        display: none;
        @media (max-width: 740px) {
          display: block;
        }
      }
      .back-svg {
        transform: rotate(-90deg);
      }
      .next-svg {
        transform: rotate(90deg);
      }
    }
    button:disabled {
      background: var(--color-dark-blue-desabled) !important;
      
    }
    button:hover {
      background: rgb(142, 174, 227);
    }
    button:active {
      background: rgb(86, 124, 191);
    }
  }
  .add-new-equipment-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    width: 70px;
    height: 70px;
    bottom: 40px;
    right: 40px;
    background: var(--color-light-blue);
    border: none;
    border-radius: 50px;
    z-index: 10;
    @media (max-width: 740px) {
      width: 50px;
      height: 50px;
    }
    @media (max-width: 600px) {
      bottom: 100px;
      right: 30px;
    }
    @media (max-width: 600px) {
      right: 15px;
    }
    svg {
      width: 52px;
      height: 52px;
    }
  }
  .add-new-equipment-btn:hover {
    box-shadow: 0 0 25px rgb(0, 0, 0);
    background: rgb(142, 174, 227);
  }
  .add-new-equipment-btn:active {
      background: rgb(86, 124, 191);
    }
}
</style>