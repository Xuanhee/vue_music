import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const Rank = () => import('components/rank/rank')
const Recommend = () => import('components/recommend/recommend')
const Singer = () => import('components/singer/singer')
const Search = () => import('components/search/search')
const SingerDetail = () => import('components/singer-detail/singer-detail')
const Disc = () => import('components/disc/disc')
const TopList = () => import('components/top-list/top-list')
const UserCenter = () => import('components/user-center/user-center')
const routes = [
  {
    path: '/',
    redirect: '/recommend'
  },
  {
    path: '/recommend',
    component: Recommend,
    children: [{
      path: ':id',
      component: Disc
    }]
  },
  {
    path: '/singer',
    component: Singer,
    children: [{
      path: ':id',
      component: SingerDetail
    }]
  },
  {
    path: '/rank',
    component: Rank,
    children: [{
      path: ':id',
      component: TopList
    }]
  },
  {
    path: '/search',
    component: Search,
    children: [{
      path: ':id',
      component: SingerDetail
    }]
  },
  {
    path: '/user',
    component: UserCenter
  }
]

const router = new VueRouter({
  routes
})

export default router
