<template>
  <el-container class="index">
    <el-header>
      <div class="logo">
        <img src="./../assets/logo.png" alt />
      </div>
      <div class="title">
        <h1>电商后台管理系统</h1>
      </div>
      <div class="logout">
        欢迎光临~
        <a href="javascript:;" @click="logout" type="text">退出</a>
      </div>
    </el-header>
    <!--
        el-menu 整个大的菜单组件
          default-active="2-1" 配置哪个菜单项, 默认被选中
          unique-opened 配置是否只有一个子菜单展开

        el-submenu 子菜单
          <template v-slot:title> 配置的是子菜单的标题

          el-menu-item 配置的是展开的菜单项
          index 标记菜单项的
    -->
    <el-container>
      <el-aside width="200px">
        <el-menu
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
          router
          :default-active="defaultActive"
        >
          <el-submenu :index="menu.path" v-for="menu in menuList" :key="menu.id">
            <template v-slot:title>
              <i class="el-icon-location"></i>
              <span>{{menu.authName}}</span>
            </template>
            <el-menu-item :index="item.path" v-for="item in menu.children" :key="item.id">
              <i class="el-icon-menu"></i>
              <span slot="title">{{item.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuList: []
    }
  },
  async created () {
    const { meta, data } = await this.$axios.get('menus')
    if (meta.status === 200) {
      this.$message.success(meta.msg)
      this.menuList = data
      console.log(data)
    } else {
      this.$message.error(meta.msg)
    }
  },
  methods: {
    logout () {
      this.$confirm('亲，你确定要退出系统吗?', '温馨提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$message.success('退出成功')
        localStorage.removeItem('token')
        this.$router.push('/login')
      }).catch((e) => {
        // this.$message.info('退出取消')
        // ({
        //   type: 'info',
        //   message: '已取消退出'
        // })
        console.log(e)
      })
    }
  },
  // 计算属性
  computed: {
    defaultActive () {
      // $router 路由规则
      // $route当前路由信息
      return this.$route.path.slice(1)
    }
  }
}

</script>

<style lang='scss' scoped>
.index {
  height: 100%;
  .el-header {
    background-color: #d8d8d8;
    display: flex;
    .logo {
      // flex: 1;
      width: 180px;
      img {
        height: 40px;
        margin: 0 auto;
        margin-top: 10px;
      }
    }
    .title {
      flex: 1;
      h1 {
        text-align: center;
        line-height: 60px;
      }
    }
    .logout {
      line-height: 60px;
      text-align: right;
      a {
        color: orange;
        text-decoration: none;
      }
    }
  }

  .el-aside {
    background-color: #545c64;
    color: #333;
    line-height: 200px;
    .el-menu {
      border: none;
    }
  }

  .el-main {
    background-color: #ecf0f1;
    color: #333;
    // text-align: center;
    // line-height: 160px;
  }
}
</style>
