import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Index from './components/Index.vue'
Vue.use(Router)
// const originalPush = Router.prototype.push
// Router.prototype.push = function push (location) {
//   return originalPush.call(this, location).catch(err => err)
// }
export default new Router({
  routes: [{
    path: '/login',
    component: Login
  }, {
    path: '/index',
    component: Index
  },
  {
    path: '/',
    redirect: '/index'
  }
  ]
})
