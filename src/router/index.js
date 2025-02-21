import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EquipmentPageView from '../views/EquipmentPageView.vue'
import EditPageView from '../views/EditPageView.vue'
import AddPageView from '../views/AddPageView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/:id',
      name: 'currentEquipmentPage',
      component: EquipmentPageView,
    },
    {
      path: '/edit/:id',
      name: 'editPage',
      component: EditPageView,
    },
    {
      path: '/add',
      name: 'addPage',
      component: AddPageView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    localStorage.removeItem('currentEquipment');
  }
  next();
});

export default router
