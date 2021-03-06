import Vue from 'vue'
import Router from 'vue-router'
import Login from './components/Login.vue'
import Index from './components/Index.vue'
import Users from './components/users/Users.vue'
import Rights from './components/rights/Rights.vue'
import Roles from './components/rights/Roles.vue'
import Categories from './components/products/Categories.vue'
import Goods from './components/products/Goods.vue'
import GoodsAdd from './components/products/GoodsAdd.vue'

Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

const router = new Router({
  routes: [{
    path: '/',
    redirect: '/index'
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/index',
    name: 'index',
    component: Index,
    children: [
      // 通过 /users 就可以匹配子路由了
      {
        path: '/users',
        name: 'users',
        component: Users
      },
      {
        path: '/roles',
        name: 'roles',
        component: Roles
      },
      {
        path: '/rights',
        name: 'rights',
        component: Rights
      },
      {
        path: '/categories',
        name: 'categories',
        component: Categories
      },
      {
        path: '/goods',
        name: 'goods',
        component: Goods
      },
      {
        path: '/goods-add',
        name: 'goods-add',
        component: GoodsAdd
      }
    ]
  }
  ]
})

// to 到哪去
// from 从哪来
// next(方法) 是否放行, next()放行,    拦截: next('/login')
// to 如果是去登陆页, 不需要拦截,
// 如果有票, 有token, 也不需要拦截
// 其他情况, 一律拦截到登录
router.beforeEach((to, from, next) => {
  // console.log(to)
  const token = localStorage.getItem('token')
  if (to.path === '/login' || token) {
    next()
  } else {
    next('/login')
  }
})

// 命名路由, 有名字的路由
export default router
// this.$router.push('/')
// this.$router.push({ name: 'home' })
