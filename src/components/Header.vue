<script setup>
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();

function returnBack () {
  const route = router.currentRoute.value;

  if (route.path.startsWith('/edit/')) {

    const id = route.params.id;
    router.push(`/${id}`);
  } else {
    // В остальных случаях (например, на /:id) — возвращаемся на главную
    router.push('/');
  }
}

</script>

<template>
  <article class="wrapper-header">
    <div class="cite-name">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="rgb(4, 16, 50)" stroke-width="4.5"><path fill="rgb(49, 77, 174)" d="M36 15C38.7614 15 41 12.7614 41 10C41 7.23858 38.7614 5 36 5C33.2386 5 31 7.23858 31 10C31 12.7614 33.2386 15 36 15Z"/><path stroke-linecap="round" stroke-linejoin="round" d="M12 16.7691L20.0031 13.998L31 19.2466L20.0031 27.4442L31 34.6834L24.0083 43.998"/><path stroke-linecap="round" stroke-linejoin="round" d="M35.3203 21.6434L38.002 23.1018L44.0003 17.4658"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.849 31.5454L13.8793 35.4572L4.00391 40.9964"/></g></svg>
      <header>Sports Equipment</header>
    </div>
    <button v-if="route.path !== '/'"
      @click="returnBack">
      <h1>Back</h1>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#fff" d="M10.707 8.707a1 1 0 0 0-1.414-1.414l-4 4a1 1 0 0 0 0 1.414l4 4a1 1 0 0 0 1.414-1.414L8.414 13H18a1 1 0 1 0 0-2H8.414z"/></svg>
    </button>
  </article>
</template>

<style lang="scss" scoped>
.wrapper-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: auto;
  min-height: 150px;
  max-width: 100vw;
  padding: 20px 9vw;
  background: --color-white;
  gap: 20px;
  @media (max-width: 1486px) {
    padding: 20px 20px;
    min-height: 90px;
  }
  @media (max-width: 768px) {
    min-height: 80px;
  }
  @media (max-width: 620px) {
    padding: 10px 20px;
  }
  @media (max-width: 360px) {
    padding: 10px 10px;
  }
  svg {
    width: 68px;
    height: 68px;
    @media (max-width: 1340px) {
      min-width: 58px;
      min-height: 58px;
    }
    @media (max-width: 360px) {
      min-width: 34px;
      min-height: 34px;
    }
  }
  .cite-name {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 40px;
    @media (max-width: 360px) {
      gap: 10px;
    }
  }
  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 150px;
    height: 60px;
    border-radius: 30px;
    background: var(--color-dark-blue);
    border: none;
    cursor: pointer;
    @media (max-width: 790px) {
      width: 60px;
      height: 60px;
    }
    @media (max-width: 360px) {
      width: 40px;
      height: 40px;
    }
    h1 {
      cursor: pointer;
      @media (max-width: 790px) {
        display: none;
      }
    }
    svg {
      display: none;
      cursor: pointer;
      @media (max-width: 790px) {
        display: block;
      }
      
    }
  } 
  button:hover {
    background: rgba(4, 16, 50, .9);
  }
  button:active {
    background: rgb(2, 11, 33);
  }
}

</style>