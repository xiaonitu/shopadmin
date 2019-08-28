<template>
  <div class="login">
    <el-form
      :model="form"
      :rules="rules"
      ref="form"
      label-width="80px"
      class="demo-ruleForm"
      status-icon
    >
      <!-- 头像图片 -->
      <img class="logo" src="./../assets/avatar.jpg" alt />
      <!-- status-icon 是小图标×与√  prop是梅花* 号 与scripts里的username对应 -->
      <el-form-item label="用户名" prop="username">
        <el-input v-model="form.username" placeholder="请输入用户名" @keyup.enter.native="login"></el-input>
        <!-- 你可能有很多次想要在一个组件的根元素上直接监听一个原生事件。这时，你可以使用 v-on 的 .native 修饰符： -->
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          @keyup.enter.native="login"
        ></el-input>
      </el-form-item>

      <el-form-item>
        <el-button class="btn1" type="primary" @click="login">登录</el-button>
        <el-button @click="reset">重置</el-button>
      </el-form-item>

      <!-- 这是消息提示 -->
    </el-form>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data () {
    return {
      form: {
        username: '',
        password: ''

      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
          { min: 3, max: 12, message: '长度在 3 到12个字符', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: ['blur', 'change'] }
        ]

      }
    }
  },
  methods: {
    reset () {
      this.$refs.form.resetFields()
    },
    login () {
      // this.$message('这是一条消息提示')
      // 先获取到el-form，
      // 参数1：是否效验成功
      // axios.post(url, data).then(...)
      this.$refs.form.validate(isvalid => {
        if (!isvalid) return
        // console.log(111)
        axios.post('http://localhost:8888/api/private/v1/login', this.form).then(res => {
          const { meta } = res.data
          if (meta.status === 200) {
            // 成功，跳转首页
            console.log(meta.msg)
            // (1)默认提示this.$message(meta.msg)
            // (2)配置具体的提示
            this.$message({
              message: meta.msg,
              type: 'success',
              duration: 1000
            })
            // 跳转到首页，需要有首页的组件
            // this.$router.push('/index')//通过path进行跳转
            this.$router.push('/index')
          } else {
            // 失败，给用户提示
            // console.log(meta.msg)
            // this.$message({
            //   message.meta.msg,
            //   type:'error',
            //   duration:1000
            // })
            // (3)直接配置提示的类型，进行提示
            this.$message.error(meta.msg)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  background: #2d434c;
  overflow: hidden;
  .el-form {
    width: 400px;
    height: 200px;
    background: #fff;
    margin: 0 auto;
    margin-top: 200px;
    padding: 20px;
    padding-top: 80px;
    position: relative;
    border-radius: 20px;
    .logo {
      width: 120px;
      height: 120px;
      position: absolute;
      left: 50%;
      transform: translate(-50%);
      top: -70px;
      border-radius: 50%;
      border: 5px solid #fff;
    }
    .btn1 {
      margin-right: 100px;
    }
  }
}
</style>
