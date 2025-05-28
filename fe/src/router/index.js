import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import AboutView from '../views/AboutView.vue'
import TryView from '../views/TryView.vue'
import ContactView from '@/views/ContactView.vue'
import GalleryView from '@/views/GalleryView.vue'
import PhotoboothView from '@/views/PhotoboothView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      //component: () => import('../views/AboutView.vue'),
      component: AboutView,
    },
    {
      path: '/try',
      name: 'try',
      component: TryView,
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/gallery',
      name: 'gallery',
      component: GalleryView,
    },
    {
      path: '/photobooth',
      name: 'photobooth',
      component: PhotoboothView,
    }
  ],
})

export default router
