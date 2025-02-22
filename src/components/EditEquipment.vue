<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios'
import DOMPurify from 'dompurify';
import { useLoadingStore } from '../stores/loadingCircle';
import { useCurrentEquipmentStore } from '../stores/currentEquipment';

const router = useRouter();
const route = useRoute();

const currentEquipmentStore = useCurrentEquipmentStore();
const loadingStore = useLoadingStore();

const photosArray = ref([]);
const galleryArray = ref([]);

const categories = ref([]);
const isCheckPhotos = ref(false);
const checkError = ref("");
const successStatus = ref("");
const updatedProduct = ref({});
  
const dataInput = reactive({
  tittle: {
    field: 'Название',
    value: currentEquipmentStore.currentEquipment.title,
    error: '',
  },
  category: {
    field: 'Категория',
    value: currentEquipmentStore.currentEquipment.category,
    error: '',
  },
  count: {
    field: 'Количество',
    value: currentEquipmentStore.currentEquipment.count,
    error: '',
  },
  price: {
    field: 'Цена',
    value: currentEquipmentStore.currentEquipment.price,
    error: '',
  },
  description: {
    field: 'Описание',
    value: currentEquipmentStore.currentEquipment.description,
    error: '',
  },
  avatar: {
    field: 'Аватар',
    value: currentEquipmentStore.currentEquipment.avatar,
    error: ''
  },
  
});

function validateInput (dataInput) {
  let isValid = true;
  dataInput.tittle.error = '';
  dataInput.count.error = '';
  dataInput.price.error = '';
  dataInput.description.error = '';
  dataInput.avatar.error = '';

    if (!dataInput.tittle.value) {
      dataInput.tittle.error = 'Поле не может быть пустым';
      isValid = false;
    } else if (dataInput.tittle.value.length < 3 || !/\D/.test(dataInput.tittle.value)) {
      dataInput.tittle.error = 'Название должно содержать минимум 3 символа, не может состоять только из цифр';
      isValid = false;
    }

    if (!dataInput.count.value || dataInput.count.value < 1) {
      dataInput.count.error = 'Введите число больше нуля';
      isValid = false;
    } else if (!/^[1-9]\d*$/.test(dataInput.count.value)) {
      dataInput.count.error = 'Введите числовое значение';
      isValid = false;
    }
    if (!dataInput.price.value || dataInput.price.value === 0) {
      dataInput.price.error = 'Введите цену. Значение не может быть равно нулю';
      isValid = false;
    } else if (!/^[\d.,]+$/.test(dataInput.price.value)) {
      dataInput.price.error = 'Введите числовое значение';
      isValid = false;
    }
    if (dataInput.description.value.length === 0 || dataInput.description.value.length > 255 ) {
      dataInput.description.error = 'Введите описание не больше 255 символов. Значение не может быть пустым';
      isValid = false;
    }
    if (!dataInput.avatar.value) {
      dataInput.avatar.error = 'Введите ссылку на изображение аватара';
      isValid = false;
    }
    if (!isValid) {
      loadingStore.changeValueLoading(false);
    }
    
  return isValid;
};

async function putChanges (id) {
  loadingStore.changeValueLoading(true);
  const isValid = await validateInput(dataInput);

  if (!isValid) return
  
  if (photosArray.value.some(item => item === '')){
    photosArray.value = [];
  }
  if (galleryArray.value.some(item => item === '')){
    galleryArray.value = [];
  }
  
  updatedProduct.value = {
    title: dataInput.tittle.value,
    category: dataInput.category.value,
    price: dataInput.price.value,
    avatar: dataInput.avatar.value,
    count: dataInput.count.value,
    description: dataInput.description.value,
    photos: photosArray.value,
    gallery: galleryArray.value,
  };

  try {
    await axios.put(`https://6712a5e16c5f5ced662443cb.mockapi.io/api/v2/inventories/${id}`,
      updatedProduct.value
    );
    successStatus.value = "Данные отправлены!";
    const idEquipment = route.params.id;
    setTimeout(() => {
      router.push(`/${idEquipment}`);
    }, 2000);
  } catch (error) {
    console.error("Не удалось получить данные", error);
  } finally {
    loadingStore.changeValueLoading(false);
  }
};

async function getCategory () {
  loadingStore.changeValueLoading(true);
  try {
    const response = await axios.get('https://6712a5e16c5f5ced662443cb.mockapi.io/api/v2/categories/');
    categories.value = response.data;
  } catch (error) {
    console.error("Не удалось получить данные", error);
  } finally {
    loadingStore.changeValueLoading(false);
  }
};

onMounted(async () => {
  getCategory();
  const id = route.params.id;
  if (!currentEquipmentStore.currentEquipment.value) {
    await currentEquipmentStore.getCurrentEquipmentById(id);
    photosArray.value = currentEquipmentStore.currentEquipment.photos ? currentEquipmentStore.currentEquipment.photos : [];
    galleryArray.value = currentEquipmentStore.currentEquipment.gallery ? currentEquipmentStore.currentEquipment.gallery : [];
  }
});

function checkPhotos () {
  isCheckPhotos.value = !isCheckPhotos.value;
}
function addField() {
  photosArray.value = [...photosArray.value, ''];
};
function removePhotoField(index) {
  photosArray.value = photosArray.value.filter((_, i) => i !== index);

};
function removeGalleryField(index) {
  galleryArray.value = photosArray.value.filter((_, i) => i !== index);

};

watch(() => currentEquipmentStore.currentEquipment,
  (newEquipment) => {
    if (newEquipment) {
      dataInput.tittle.value = DOMPurify.sanitize(newEquipment.title);
      dataInput.count.value = DOMPurify.sanitize(newEquipment.count);
      dataInput.category.value = DOMPurify.sanitize(newEquipment.category);
      dataInput.price.value = DOMPurify.sanitize(newEquipment.price);
      dataInput.description.value = DOMPurify.sanitize(newEquipment.description);
      dataInput.avatar.value = DOMPurify.sanitize(newEquipment.avatar);
    }
  }
);
watch(photosArray, (newValue) => {
  checkError.value = '';

  const hasEmptyFields = newValue.some(photo => photo.trim() === '');

  if (hasEmptyFields) {
    checkError.value = 'Введите правильные ссылки на изображения (пустые значения не допускаются)';
  }
});
watch(galleryArray.value, (newValue) => {
  checkError.value = '';
  
  const hasEmptyFields = newValue.some(photo => photo.trim() === '');

  if (hasEmptyFields) {
    checkError.value = 'Введите правильные ссылки на изображения (пустые значения не допускаются)';
  } else {
    galleryArray.value = newValue;
  }
});

</script>

<template>
  <main>
    <div class="edit-form-wrapper">
      <form @submit.prevent="putChanges(currentEquipmentStore.currentEquipment.id)">

        <div class="wrapper" v-for="(data, key) in dataInput" :key="key">
          <h1 :for="data.value">{{ data.field }}</h1>
          <div class="input-box">

          <div v-if="key === 'description'"
            class="textarea-wrapper">
            <textarea 
              v-model="data.value" 
              placeholder="Введите описание">
            </textarea>
            
            <div class="info-error">
              <div class='input-invalid'>
                {{ data.error }}
              </div>
              <h3
                :class="{'input-invalid' : data.value && data.value.length > 255}"
              >
                {{ data.value? data.value.length : 0 }}/255
              </h3>
            </div>
          </div>
          
          <select v-else-if="key === 'category'" 
            v-model="data.value">
            <option disabled value="">Выберите категорию</option>
            <option v-for="category in categories" 
              :key="category.id"
              :value="category.title">{{ category.title }}</option>
          </select>

          <input :class="{'small-element' : key === 'count' || key === 'price'}" 
            v-else
            v-model="data.value"
            type="text"
            :id="data.value"
            placeholder="Введите название"
            
          />
          </div>
          <div class="info-error" v-if="data.error && key != 'description'">
            
            <div class="input-invalid">
              {{ data.error }}
            </div>
  
          </div>
        </div>


        <div class="photo-wrapper" v-if="galleryArray.length > 0 || photosArray.length > 0">
          <h1>Фото</h1>
          
          <div class="field" v-for="(photo, index) in galleryArray" :key="index">
            <input v-model="galleryArray[index]" type="text" placeholder="Введите ссылку на изображение" />
            <div class="remove-btn-wrapper">
              <button type="button" @click="removeGalleryField(index)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="rgba(255, 116, 97, 1)" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M7.5 12h9"/></g></svg>
              </button>
            </div>
            
          </div>

          <div class="field" v-for="(photo, index) in photosArray" :key="index">
            <input v-model="photosArray[index]" type="text" placeholder="Введите ссылку на изображение" />
            <div class="remove-btn-wrapper">
              <button type="button" @click="removePhotoField(index)">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="none" stroke="rgba(255, 116, 97, 1)" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M7.5 12h9"/></g></svg>
              </button>
            </div>
            
          </div>
          <div class="info-error">
            <div class="input-invalid">
              {{ checkError }}
            </div>
  
          </div>
        </div>

        <div class="check-container" v-if="isCheckPhotos && dataInput.avatar.value">
          <h1>Проверка аватара: </h1>
          <div class="photos-for-check">
            
            <img v-if="dataInput.avatar.value" 
              :src="dataInput.avatar.value" 
              alt="Uploaded photo"
            >
          </div>
        </div>

        <div class="check-container" v-if="isCheckPhotos &&  !photosArray.some(item => item === '') && (galleryArray || photosArray.length > 0)">
          <h1>Проверка фото: </h1>
          
          <div class="photos-for-check" 
            v-if="isCheckPhotos && galleryArray && galleryArray.length > 0"
            v-for="(photo, index) in galleryArray" 
            :key="index">
            <img v-if="photo" 
              :src="photo" 
              alt="Uploaded photo">
            <svg 
              v-if="photo" 
              @click="removeGalleryField(index)" 
              xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="rgb(255, 116, 97)" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V5h14zM17 8.4L13.4 12l3.6 3.6l-1.4 1.4l-3.6-3.6L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7z"/>
            </svg>
          </div>
          <div class="photos-for-check" 
            v-if="isCheckPhotos && photosArray && photosArray.length > 0"
            v-for="(photo, index) in photosArray" 
            :key="index">
            
            <img v-if="photo" 
              :src="photo" 
              alt="Uploaded photo"
            >
            <svg 
              v-if="photo" 
              @click="removePhotoField(index)" 
              xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24"><path fill="rgb(255, 116, 97)" d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V5h14zM17 8.4L13.4 12l3.6 3.6l-1.4 1.4l-3.6-3.6L8.4 17L7 15.6l3.6-3.6L7 8.4L8.4 7l3.6 3.6L15.6 7z"/>
            </svg>
          </div>
        </div>
        
        
        <div class="info-status" v-if="successStatus">
            
          <div class="input-status">
            {{ successStatus }}
          </div>

        </div>
        <div class="button-wrapper">
          <button type="button" @click="addField">
            <h1>Добавить ссылку</h1>
          </button>
          <button type="button" @click="checkPhotos"> 
            <h1>Проверить фото</h1>
          </button>
          <button type="submit">
            <h1>Сохранить</h1>
          </button>
        </div>

      </form>
    </div>
    
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
    .edit-form-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      
      width: min(100%, 1600px);
      height: auto;
      max-height: max(80vh, 680px);
      min-height: fit-content;
      padding: 60px 90px;
      gap: 30px;
      background: var(--color-blue);
      border-radius: 20px;
      box-shadow: 0 0 25px rgba(0, 0, 0, .5);
      @media (max-width: 1000px) {
        padding: 60px 50px;
      }
      @media (max-width: 620px) {
        padding: 30px;
      }
      @media (max-width: 360px) {
        justify-content: flex-start;
        padding: 20px;
        gap: 10px;
      }
      form {
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 24px;
      @media (max-width: 360px) {
        gap: 16px;
      }
      .wrapper {
        position: relative;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        justify-content: center;
        text-align: left;
        gap: 12px;
        width: 100%;
        label {
          color: var(--color-gray) !important;
          width: 100%;
          padding: 0 24px;
          
        }
        .input-box {
          position: relative;
          gap: 24px;

          @media (max-width: 360px) {
            gap: 16px;
          }
        }
        input {
          font-family: 'Montserrat';
          font-style: normal;
          padding: 0 58px 0 28px;
          width: 100%;
          height: 52px;
          background: var(--color-white);
          border-radius: 36px;
          font-weight: 400;
          font-size: 18px;
          line-height: 28px;
          color: var(--color-dark-blue);
          transition: border-color 0.2s ease;
          border: none;
          @media (max-width: 360px) {
            height: 48px;
            font-size: 16px;
            line-height: 24px;
          }
        }
        input::placeholder {
          font-weight: 400;
          font-size: 18px;
          line-height: 28px;
          color: var(--color-dark-blue);
          opacity: .4;
          @media (max-width: 360px) {
            font-size: 16px;
            line-height: 24px;
          }
        }
        input:hover {
          border: solid 1px var(--color-light-blue);
          box-shadow: 0 0 20px var(--color-light-blue);
        }
        input:focus {
          border: solid 2px var(--color-light-blue);
          box-shadow: 0 0 20px var(--color-light-blue);
          outline: none;
        }
        .small-element {
          height: 52px;
          width: min(275px, 100%);
        }
        .textarea-wrapper{
          textarea {
            font-family: 'Montserrat';
            font-style: normal;
            display: flex;
            flex-direction: row;
            align-items: flex-start;
            padding: 16px 24px;
            width: 100%;
            height: auto;
            min-height: 120px;
            max-height: 200px;
            border-radius: 20px;
            font-weight: 400;
            font-size: 18px;
            line-height: 28px;
            resize: none;
            @media (max-width: 1366px) {
              height: 140px;
            }
            @media (max-width: 624px) {
              font-size: 16px;
              line-height: 24px;
            }
          }
          textarea::placeholder {
            font-weight: 400;
            font-size: 18px;
            line-height: 28px;
            color: var(--color-dark-blue);
            opacity: .4;
            @media (max-width: 360px) {
              font-size: 16px;
              line-height: 24px;
            }
          }
          textarea:hover {
            border: solid 2px var(--color-light-blue);
            box-shadow: 0 0 20px var(--color-light-blue);
          }
          textarea:focus {
            border: solid 2px var(--color-light-blue);
            box-shadow: 0 0 20px var(--color-light-blue);
            outline: none;
          }
          .info-error {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;
            .input-invalid {
              padding: 0 24px;
              font-weight: 400;
              font-size: 18px;
              line-height: 28px;
              color: var(--color-red-invalid) !important;
              @media (max-width: 360px) {
                font-size: 16px;
              }
            }
          }
        }
        select {
          font-family: 'Montserrat';
          font-style: normal;
          height: 52px;
          width: min(275px, 100%);
          border-radius: 25px;
          padding: 5px 15px;
          font-weight: 400;
          font-size: 18px;
          line-height: 28px;
          @media (max-width: 360px) {
            height: 48px;
            font-size: 16px;
            line-height: 24px;
          } 
        }
        select:hover {
          border: solid 2px var(--color-light-blue);
          box-shadow: 0 0 20px var(--color-light-blue);
        }
        select:focus {
          border: solid 2px var(--color-light-blue);
          box-shadow: 0 0 20px var(--color-light-blue);
          outline: none;
        }

        .info-error {
          position: relative;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;

          .input-invalid {
            padding: 0 24px;
            font-weight: 400;
            font-size: 18px;
            line-height: 28px;
            color: var(--color-red-invalid) !important;
            @media (max-width: 360px) {
              font-size: 16px;
            }
          }
          .symbols-number {
            margin-left: auto;
            text-align: right;
          }
        }
      }
      .photo-wrapper {
        h1 {
          margin-bottom: -14px;
        }
        .field {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
          margin: 24px 0;
          input {
            font-family: 'Montserrat';
            font-style: normal;
            padding: 0 58px 0 28px;
            width: calc(100% - 70px);
            height: 52px;
            background: var(--color-white);
            border-radius: 36px;
            font-weight: 400;
            font-size: 18px;
            line-height: 28px;
            color: var(--color-dark-blue);
            transition: border-color 0.2s ease;
            border: none;
            @media (max-width: 360px) {
              height: 48px;
              width: calc(100% - 50px);
              font-size: 16px;
              line-height: 24px;
            }
          }
          input::placeholder {
            font-weight: 400;
            font-size: 18px;
            line-height: 28px;
            color: var(--color-dark-blue);
            opacity: .4;
            @media (max-width: 360px) {
              font-size: 16px;
              line-height: 24px;
            }
          }
          input:hover {
            border: solid 1px var(--color-light-blue);
            box-shadow: 0 0 20px var(--color-light-blue);
          }
          input:focus {
            border: solid 2px var(--color-light-blue);
            box-shadow: 0 0 20px var(--color-light-blue);
            outline: none;
          }
          button {
            background: none;
            border: none;
          }
          svg {
            width: 44px;
            height: 44px;
            cursor: pointer;
            @media (max-width: 360px) {
              width: 34px;
              height: 34px;
            }
          }
          button:hover {
            opacity: .9;
          }
        }
        .info-error {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
          height: auto;

          .input-invalid {
            padding: 0 24px;
            font-weight: 400;
            font-size: 18px;
            line-height: 28px;
            color: var(--color-red-invalid) !important;
            @media (max-width: 360px) {
              font-size: 16px;
            }
          }
        }
      }

      .check-container {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        gap: 20px;
        margin-top: 20px;
        h1 {
          margin: 15px 0 5px;
        }
        .photos-for-check {
          position: relative;
          gap: 20px;
          img {
            height: 120px;
          }
          svg {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 2;
          }
          svg:hover {
            border-radius: 50%;
            background: radial-gradient(circle, rgba(4, 16, 50, .5), rgba(48, 48, 48, 0));
            opacity: .8;
          }
        }
      }
      
    }
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
      .button-wrapper {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        gap: 20px;
        margin-top: 20px;
        @media (max-width: 360px) {
          margin-top: 0;
            gap: 10px;
          }
        button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 260px;
          height: 90px;
          border-radius: 50px;
          background: var(--color-dark-blue);
          border: none;
          cursor: pointer;
          @media (max-width: 787px) {
            width: 220px;
          }
          @media (max-width: 637px) {
            width: 100%;
          }
          @media (max-width: 360px) {
            height: 60px;
          }
        }
        button:hover {
          background: rgba(4, 16, 50, .8);
        }
        button:active {
          background: rgb(2, 11, 33);
        }
      }
    }
    h1 {
      margin: 0 20px;
    }
  }
</style>