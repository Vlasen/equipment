<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { onMounted } from 'vue';
import axios from 'axios'
import { useCurrentEquipmentStore } from '../stores/currentEquipment';
import { useLoadingStore } from '../stores/loadingCircle';


const route = useRoute();
const router = useRouter();
const currentEquipmentStore = useCurrentEquipmentStore();
const loadingStore = useLoadingStore();

const scrollContainer = ref(null);
const showScrollUpButton = ref(false);
const successStatus = ref('');

const selectedPhoto = ref(currentEquipmentStore.currentEquipment.avatar);
const photosArray = reactive([
  ...(currentEquipmentStore.currentEquipment.gallery || []), 
  ...(currentEquipmentStore.currentEquipment.photos || [])
]);

watch(() => currentEquipmentStore.currentEquipment,
  (newEquipment) => {
    if (newEquipment) {
      selectedPhoto.value = newEquipment.avatar;
      photosArray.splice(0, photosArray.length, ...(newEquipment.gallery || []), ...(newEquipment.photos || []));
    }
  }
);

onMounted(async () => {
  const id = route.params.id;
  if (!id || typeof id !== 'string' || id.includes('%')) {
    console.error('Некорректный ID:', id);
    return;
  }
  if (!currentEquipmentStore.currentEquipment.value) {
    await currentEquipmentStore.getCurrentEquipmentById(id);
  } else {
    console.error('Ошибка получения данных')
  }
});

async function deleteEquipment (id) {
  loadingStore.changeValueLoading(true);

  try {
    await axios.delete(`https://6712a5e16c5f5ced662443cb.mockapi.io/api/v2/inventories/${id}`);
    successStatus.value = "Данные удалены!";
    setTimeout(() => {
      const id = route.params.id;
      router.push(`/`);
    }, 2000);
  } catch (error) {
    console.error("Не удалось получить данные", error);
  } finally {
    loadingStore.changeValueLoading(false);
  }
};


function scrollDown() {
  scrollContainer.value.scrollBy({ top: 70, behavior: 'smooth' });
};
function scrollUp() {
  scrollContainer.value.scrollBy({ top: -70, behavior: 'smooth' });
};
function handleScroll() {
  if (scrollContainer.value.scrollTop > 10) {
    showScrollUpButton.value = true;
  } else {
    showScrollUpButton.value = false;
  }
};
function changeAvatar (photo) {
  selectedPhoto.value = photo;
};
function editEquipment (id) {
  router.push(`/edit/${id}`);
};
</script>

<template>
  <main>
    <section class="equipment-info-wrapper">
      <div class="equipment-main-info">
        <div class="photos-wrapper">
          <div class="gallery">
            <svg v-if="showScrollUpButton"
              class="scroll-up" 
              @click="scrollUp" 
              xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="rgb(114, 150, 213)" fill-rule="evenodd" d="M17 15a1 1 0 0 0 .707-1.707l-5-5a1 1 0 0 0-1.414 0l-5 5A1 1 0 0 0 7 15z" clip-rule="evenodd"/>
            </svg>
            <div class="photo-container" ref="scrollContainer" @scroll="handleScroll">
              <img class="photo-in-gallary" 
                alt="Equipment avatar" 
                :src="currentEquipmentStore.currentEquipment.avatar"
                @click="changeAvatar(currentEquipmentStore.currentEquipment.avatar)"/>
              <img class="photo-in-gallary" 
                v-for="photo in photosArray" 
                alt="Equipment image" 
                :src="photo"
                @click="changeAvatar(photo)"
              />
            </div>
            <svg v-if="currentEquipmentStore.currentEquipment.photos ? photosArray.length > 1 : false"
              class="scroll-down" 
              @click="scrollDown" 
              xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="rgb(114, 150, 213)" fill-rule="evenodd" d="M17 15a1 1 0 0 0 .707-1.707l-5-5a1 1 0 0 0-1.414 0l-5 5A1 1 0 0 0 7 15z" clip-rule="evenodd"/>
            </svg>
          </div>
          <img 
            class="avatar" 
            alt="Equipment avatar" 
            :src="selectedPhoto"
            />
        </div>
        <div class="main-text-info">
          <h1>{{ currentEquipmentStore.currentEquipment.title }}</h1>
          <div class="category-status-box">
            <div class="category-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="rgb(114, 150, 213)" d="m12 2l-5.5 9h11zm0 3.84L13.93 9h-3.87zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5s4.5-2.01 4.5-4.5s-2.01-4.5-4.5-4.5m0 7a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5M3 21.5h8v-8H3zm2-6h4v4H5z"/></svg>
              <h3>{{ currentEquipmentStore.currentEquipment.category }}</h3>
            </div>
            <h3>Количество: {{ currentEquipmentStore.currentEquipment.count }}</h3>
          </div>
          <h2>{{ currentEquipmentStore.currentEquipment.price }}</h2>
          
        </div>
        
      </div>
      <div class="description">
        <h3>{{ currentEquipmentStore.currentEquipment.description }}</h3>
      </div>

      <div class="button-box">
        <div class="info-status" >
          <div class="input-status">
            {{ successStatus }}
          </div>
        </div>

        <button class="edit-btn" type="button" @click="editEquipment(currentEquipmentStore.currentEquipment.id)">
          <h1>Редактировать</h1>
        </button>
        <button class="delete-btn" type="button" @click="deleteEquipment(currentEquipmentStore.currentEquipment.id)">
          <h1>Удалить</h1>
        </button>
      </div>
    </section>
  </main>
  <article class="circle-loading-wraper" v-if="loadingStore.isLoading">
    <svg xmlns="http://www.w3.org/2000/svg" width="74" height="74" viewBox="0 0 24 24"><defs><linearGradient id="mingcuteLoadingLine0" x1="50%" x2="50%" y1="5.271%" y2="91.793%"><stop offset="0%" stop-color="rgb(114, 150, 213)"/><stop offset="100%" stop-color="rgb(114, 150, 213)" stop-opacity="0.55"/></linearGradient><linearGradient id="mingcuteLoadingLine1" x1="50%" x2="50%" y1="8.877%" y2="90.415%"><stop offset="0%" stop-color="rgb(114, 150, 213)" stop-opacity="0"/><stop offset="100%" stop-color="rgb(114, 150, 213)" stop-opacity="0.55"/></linearGradient></defs><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="url(#mingcuteLoadingLine0)" d="M8.886.006a1 1 0 0 1 .22 1.988A8.001 8.001 0 0 0 10 17.944v2c-5.523 0-10-4.476-10-10C0 4.838 3.848.566 8.886.007Z" transform="translate(2 2.055)"/><path fill="url(#mingcuteLoadingLine1)" d="M14.322 1.985a1 1 0 0 1 1.392-.248A9.99 9.99 0 0 1 20 9.945c0 5.523-4.477 10-10 10v-2a8 8 0 0 0 4.57-14.567a1 1 0 0 1-.248-1.393" transform="translate(2 2.055)"/></g></svg>
  </article>
</template>

<style lang="scss" scoped>
  main {
    display: flex;
    justify-content: center;
    height: auto;
    min-height: calc(100vh - 150px);
    width: 100%;
    padding: 40px 80px;
    background: var(--color-dark-blue);
    @media (max-width: 1486px) {
      min-height: calc(100vh - 108px);
    }
    @media (max-width: 840px) {
      min-width: 230px;
      padding: 40px;
    }
    @media (max-width: 620px) {
      min-height: calc(100vh - 88px);
    }
    @media (max-width: 614px) {
      min-height: calc(100vh - 118px);
    }
    @media (max-width: 535px) {
      min-height: calc(100vh - 108px);
      min-width: 450px;
      padding: 40px 20px;
    }
    @media (max-width: 505px) {
      min-height: calc(100vh - 106px);
      min-width: 450px;
      padding: 40px 20px;
    }
    @media (max-width: 360px) {
      min-height: calc(100vh - 88px);
      min-width: 300px;
      gap: 20px;
      padding: 20px;
    }
    .equipment-info-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      
      width: min(100%, 1600px);
      height: auto;
      min-height: fit-content;
      padding: 50px 40px;
      gap: 30px;
      background: var(--color-blue);
      border-radius: 20px;
      box-shadow: 0 0 25px rgba(0, 0, 0, .5);
      @media (max-width: 620px) {
        padding: 30px;
      }
      @media (max-width: 360px) {
        justify-content: flex-start;
        padding: 20px;
        gap: 10px;
      }


      .equipment-main-info {
        max-width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 20px;
        @media (max-width: 1140px) {
          flex-direction: column;
        }

        .photos-wrapper {
          display: flex;
          flex-direction: row;
          @media (max-width: 1140px) {
            justify-content: center;
          }

          .gallery {
            position: relative;
            display: flex;
            flex-direction: column;
            max-width: 130px;
            max-height: 300px;
            @media (max-width: 620px) {
              max-width: 110px;
              max-height: 250px;
            }
            @media (max-width: 360px) {
              max-height: 150px;
              max-width: 80px;
            }
            .photo-container {
              display: flex;
              flex-direction: column;
              max-height: 90%;
              margin: 30px 0;
              padding: 15px;
              gap: 30px;
              overflow: hidden;

              .photo-in-gallary:hover {
                box-shadow: 0 0 15px var(--color-light-blue);
                border: solid 1px var(--color-light-blue);
              }
            }
            .scroll-up {
              position: absolute;
              top: -5px;
              left: 50px;
              cursor: pointer;
              @media (max-width: 620px) {
                left: 35px;
              }
              @media (max-width: 360px) {
                left: 22px;
              }
            }
            .scroll-up:hover {
              border-radius: 50%;
              background: radial-gradient(circle, rgba(114, 150, 213, .5), rgba(48, 48, 48, 0));
            }
            .scroll-down {
              position: absolute;
              bottom: -5px;
              left: 50px;
              transform: rotate(180deg);
              transition: opacity 0.3s;
              cursor: pointer;
              @media (max-width: 620px) {
                left: 35px;
              }
              @media (max-width: 360px) {
                left: 22px;
              }
            }
            .scroll-down:hover {
              border-radius: 50%;
              background: radial-gradient(circle, rgba(114, 150, 213, .5), rgba(48, 48, 48, 0));
            }
          }
          
          .avatar {
            max-width: 400px;
            min-width: 300px;
            margin: 0 10px;
            border-radius: 5px;
            object-fit: cover;
            @media (max-width: 1570px) {
              max-width: 600px;
            }
            @media (max-width: 1400px) {
              max-width: 500px;
            }
            @media (max-width: 1146px) {
              max-height: max(80%, 600px);
            }
            @media (max-width: 620px) {
              min-width: 240px;
              max-height: 250px;
            }
            @media (max-width: 360px) {
              min-width: min(60vw, 150px);
              max-height: 150px;
            }
          }
        }
        
        .main-text-info {
          flex: 1;
          height: auto;
          min-width: min(60vw, 150px);
          h1 {
            width: auto;
            font-weight: 700;
            font-size: 38px;
            line-height: 54px;
            word-wrap: break-word;
            overflow-wrap: break-word;
            @media (max-width: 700px) {
              font-size: 24px;
              line-height: 32px;
            }
            @media (max-width: 360px) {
              font-size: 18px;
              line-height: 20px;
            }
          }

          .category-status-box {
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            margin: 20px 0 0 0;
            gap: 30px;
            @media (max-width: 1570px) {
              flex-direction: column;
              align-items: start;
              gap: 20px;
            }        
            @media (max-width: 1140px) {
              gap: 5px;
            }
            .category-wrapper {
              display: flex;
              flex-direction: row;
              align-items: center;
              gap: 10px;

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
          h2 {
            text-align: end;
            margin: 30px 0;
            @media (max-width: 1382px) {
              margin: 20px 0;
            }
            @media (max-width: 1140px) {
              margin: 10px 0;
            }
            @media (max-width: 700px) {
              font-size: 26px;
              line-height: 32px;
            }
            @media (max-width: 360px) {
              font-size: 18px;
              line-height: 52px;
            }
          }
        }
        
      }
      
      .button-box {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: 20px;
        .info-status {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          height: auto;
          
          .input-status {
            padding: 0 24px;
            font-weight: 400;
            font-size: 18px;
            line-height: 28px;
            color: var(--color-green) !important;
            @media (max-width: 360px) {
              font-size: 16px;
            }
          }
        }
        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 290px;
          height: 90px;
          border-radius: 50px;
          border: none;
          cursor: pointer;
          @media (max-width: 637px) {
            width: 100%;
          }
          @media (max-width: 360px) {
            height: 50px;
          }
        }
        .edit-btn {
          background: var(--color-dark-blue);
        }
        .edit-btn:hover {
          background: rgba(4, 16, 50, .8);
        }
        .edit-btn:active {
          background: rgb(2, 11, 33);
        }
        .delete-btn {
          background: var(--color-red-invalid);
        }
        .delete-btn:hover {
          background: rgba(255, 116, 97, .8);;
        }
        .delete-btn:active {
          background: rgb(248, 87, 65);;
        }
      }
    }
    h3 {
      font-weight: 400;
      font-size: 24px;
      line-height: 32px;
      word-wrap: break-word;
      @media (max-width: 700px) {
        font-size: 16px;
        line-height: 24px;
      }
      @media (max-width: 360px) {
        font-size: 12px;
        line-height: 20px;
      }
    }
  }
</style>