
<template>
  <!-- 用户管理A创建切换git users分支
  B创建Users组件配置嵌套路由
  main.js里Users-axios优化(每次都导入 axios 很麻烦)和配置默认的baseurl(问题: 每次都要拼接地址, 很麻烦)、配置请求拦截器-配置token(问题：每次请求都要带上token，麻烦)
  -->
  <div class="users">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索 -->
    <el-input placeholder="请输入关键字" v-model="query" class="input-with-select">
      <el-button slot="append" icon="el-icon-search" @click="searchUser"></el-button>
    </el-input>
    <!-- 添加功能 点击弹出模态框-->
    <el-button type="success" plain @click="showAddDialog">添加用户</el-button>

    <!-- 列表 -->
    <el-table :data="userList" style>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column label="用户状态">
        <template v-slot:default="obj">
          <!-- F点击开关按钮 -->
          <!-- element-ui组件定义的row是行，col是列,row这个参数，是element ui内部，定义是slot时，传递过来的
          change事件，修改用户状态-->
          <el-switch
            @change="changeState(obj.row)"
            v-model="obj.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949"
          ></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="240px">
        <template v-slot:default="obj">
          <!-- 修改用户 -->
          <el-button
            type="primary"
            plain
            icon="el-icon-edit"
            size="small"
            @click="showeditUser(obj.row)"
          ></el-button>
          <!-- D删除用户 注册点击事件弹出一个$confirm确认框 then catch
          3.点击确认发送ajax请求-->
          <el-button
            type="danger"
            plain
            icon="el-icon-delete"
            size="small"
            @click="delUser(obj.row.id)"
          ></el-button>
          <!-- @click="delUser(obj.row.id)"拿到当前点击事件的一行id -->
          <el-button
            type="success"
            plain
            size="small"
            icon="el-icon-check"
            @click="assignroleDialog(obj.row)"
          >分配角色</el-button>
          <!-- assignroleDialog分配事件后面加(obj.row)是因为将来需要传参，回显 -->
        </template>
      </el-table-column>
    </el-table>
    <!-- C分页渲染 -->
    <!-- @size-change=每页条数变化时触发
      @current-change=当前页变化时触发
      :current-page=当前页
      :page-sizes=可供选择每页条数的选择项
      :page-size=每页条数
      layout=显示的功能键
    :total=总页数-->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[1, 3, 4, 2]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 添加的模态框 -->
    <el-dialog title="添加用户" @close="closeDialog" :visible.sync="dialogVisible" width="60%">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" status-icon>
        <el-form-item label="用户名" prop="username">
          <el-input placeholder="请输入用户名" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" placeholder="请输入密码" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="form.mobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <!-- 点击确定的时候才添加用户 -->
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改模态框 -->
    <el-dialog title="修改用户" :visible.sync="editVisible" width="40%">
      <!-- :model是用于传值，父传值  ref用于获取dom元素 -->
      <el-form ref="editform" :model="editform" :rules="rules" label-width="80px" status-icon>
        <el-form-item label="用户名">
          <!-- type="info" 获取下标 -->
          <!-- <el-tag type="info">{{editform.username}}</el-tag> -->
          <el-tag type="info">{{ editform.username}}</el-tag>
        </el-form-item>
        <!-- prop 配置是对象的键名, 填充内容 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editform.email" placeholder="请输入邮箱"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editform.mobile" placeholder="请输入手机号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserdialog">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配对话框 -->
    <!-- ：visible.sync是控制模态框的隐藏与显示 -->
    <el-dialog title="修改用户" :visible.sync="assignVisible" width="40%">
      <!-- :model是用于传值，父传值  ref用于获取dom元素 -->
      <el-form ref="assignform" :model="assignform" :rules="rules" label-width="80px" status-icon>
        <el-form-item label="用户名">
          <!-- type="info" 获取下标 -->
          <!-- <el-tag type="info">{{editform.username}}</el-tag> -->
          <el-tag type="info">{{ assignform.username}}</el-tag>
        </el-form-item>
        <!-- prop 配置是对象的键名, 填充内容 -->
        <el-form-item label="角色列表">
          <!-- v-model的值为当前被选中的el-option的 value 属性值 -->
          <!-- v-model="value"双向数据绑定，所以绑定的是角色id，但不是直接绑定rid，
          如果直接="rid"绑定的是data中的rid，所以要写成assignform.rid,
          这样绑定的是分配中的assignform.rid
          :key="item.value"是为了防止遍历重名，一般给的是id
          :label="item.label"是显示内容
          :value="item.value"是将来用于提交的id，不能乱写。，
          选中的option的value值，就是select框的value值-->
          <el-select v-model="assignform.rid" placeholder="请选择">
            <el-option
              v-for="item in options"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assignUserdialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>

export default {
  data () {
    return {
      // 查询参数
      query: '',
      // 当前页码
      pagenum: 1,
      // 每页显示条数
      pagesize: 2,
      userList: [],
      // 总条数
      total: 0,
      // G添加用户
      form: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户
      dialogVisible: false, // 控制对话框的显示与隐藏
      // rules 规则rules 属性传入约定的验证规则，并将 Form-Item 的 prop 属性设置为需校验的字段名即可
      rules: {
        username: [
          // required这是验证
          { required: true, message: '请输入用户名', trigger: ['blur', 'change'] },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: ['blur', 'change'] },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: ['blur', 'change'] }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
        ]
      },
      editVisible: false,
      // 控制修改的对话框显示
      // 修改的数据
      editform: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      assignVisible: false, // 控制分配的对话框显示
      assignform: {
        id: '', // 用户id
        username: '',
        rid: ''// 角色id

      },
      options: []
    }
  },
  // 创建
  created () {
    this.getUserList()
  },
  methods: {
    // 列表的渲染
    // async和await一起搭配使用的
    // async用于修饰一个函数，表明这个函数是异步
    // await用于等待一个成功的结果，只能用于async函数中
    // await一般用于等待的是一个promise对象的结果 只等待成功的结果，会阻塞async函数的执行，直到成功结果等到了为止
    // await只会等待成功的结果，如果失败了，会报错的，需要try catch
    async  getUserList () {
      const { data, meta } = await this.$axios.get('users', {
        params: {
          query: this.query,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        // 成功拿到数据存起来，准备渲染
        this.userList = data.users
        // C.1 总条数是分页里面的
        this.total = data.total
        // console.log(this.userList)
      } else {
        this.$message.error(meta.msg)
      }
      // 拿到data数据
    },
    // C2分页
    // 修改每页的条数
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      // 将当前页更新成第一页
      this.pagenum = 1
      // 重新渲染
      this.getUserList()
    },
    // 当前页变化时, 触发
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      // val 用户选择的当前页
      this.pagenum = val
      // 重新渲染
      this.getUserList()
    },
    // D删除
    async delUser (id) {
      // 如果有成功与失败 await需要用到try{}catch{}
      try {
        // 成功
        await this.$confirm('是否删除该文件, 是否继续?', '温馨提示', {
          type: 'warning'// 配置类型
        })
        const { meta } = await this.$axios.delete(`users/${id}`)
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          // 如果当前页只是一条，删除了仅有的一条后，当前页-1
          if (this.userList.length === 1 && this.pagenum > 1) {
            this.pagenum--
          }
          // 重新渲染当前页
          this.getUserList()
        } else {
          // 删除失败
          this.$message.error(meta.msg)
        }
      } catch (e) {
        //   // 是失败
        console.log(e)
      }
    },
    // 搜索按钮,搜索框需要绑定双向数据v-model，并且安装插件，插件在谷歌浏览器的的扩展程序里devtools插件
    searchUser () {
      //    // 发送搜索的ajax请求, 重新渲染的是当前页
      // 我们无法知道, 搜出来有多少页, 直接渲染当前页不合适的,很可能会请求到没有数据页码
      // 每次搜索之前, 将页码重置为第一页
      this.pagenum = 1
      this.getUserList()
    },
    // changeState(obj.row)修改用户状态
    async changeState (row) {
      // 当我点击的时候会弹出模态框，修改成功并且
      // const res去接收await后面的this.$axios.put(`users/${row.id}/state/${row.mg_state}
      // .then =>res就不需要了
      const { meta } = await this.$axios.put(`users/${row.id}/state/${row.mg_state}`)
      // const { meta } = res.data
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        // 如果
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 添加用户
    showAddDialog () {
      this.dialogVisible = true
    },
    async addUser () {
      // 点击确定按钮，提交表单数据，并且存到数据库里
      // 先发送ajax
      // 进行校验，如果校验成功，发送ajax请求
      // try {
      //   await this.$refs.form.validate()
      //   // 发送ajax请求

      //   const { meta } = await this.$axios.post('users', this.from)
      //   if (meta.status === 201) {
      //     this.$message.success('添加成功')
      //     // 关闭对话框
      //     this.dialogVisible = false
      //     // 添加完，显示到最后一页 16/5=>4页
      //     // this.total拿的是添加前的来算的
      //     this.total++
      //     this.pagenum = Math.ceil(this.total / this.pagesize)
      //     // 重新渲染
      //     this.getUserList()
      //   } else {
      //     this.$message.error(meta.msg)
      //   }
      // } catch (e) {
      //   console.log(e)
      // }
      try {
        await this.$refs.form.validate()
        // 发送ajax请求
        const { meta } = await this.$axios.post('users', this.form)
        if (meta.status === 201) {
          this.$message.success('添加成功')
          // 关闭对话框
          this.dialogVisible = false
          // 添加完, 显示到最后一页  16 / 5 => 4页
          // this.total 拿的是添加前的来算的
          this.total++
          this.pagenum = Math.ceil(this.total / this.pagesize)
          // 重新渲染
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    closeDialog () {
      // console.log('对话框关闭了')
      this.$refs.form.resetFields()
    },
    // 修改用戶
    showeditUser (row) {
      console.log(row)
      this.editVisible = true// 点击修改按钮时，显示对话框
      // 显示的同时需要回显, 只要将this.editForm中的值修改了, 就回显了
      this.editform.id = row.id
      this.editform.username = row.username
      this.editform.email = row.email
      this.editform.mobile = row.mobile
    },
    // 修改用户添加
    async editUserdialog () {
      try {
        //  // 先校验, 校验成功, 发送编辑的ajax
        await this.$refs.editform.validate()
        // 成功发送编辑的ajax
        const { id, email, mobile } = this.editform

        const { meta } = await this.$axios.put(`users/${id}`, { email, mobile })
        if (meta.status === 200) {
          console.log(meta)
          this.$message.success(meta.msg)
          // 成功之后关闭对话框
          this.editVisible = false
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 分配角色对话框显示
    async  assignroleDialog (row) {
      this.assignVisible = true
      // 这是回显
      this.assignform.username = row.username
      this.assignform.id = row.id

      // 如果后台真的没有给rid，就需要自己发送ajax请求，获取rid
      // 思路：根据用户id，发送ajax请求，获取到相关的用户信息，里面有当前用户的角色
      const resUser = await this.$axios.get(`users/${row.id}`)
      if (resUser.meta.status === 200) {
        // 拿到了当前用户相关的信息，新添加的用户没有角色的，默认会是-1，需要处理
        const rid = resUser.data.rid
        // 如果rid=-1,则返回一个空，如果不等于-1，就等于rid
        this.assignform.rid = rid === -1 ? '' : rid
      }
      // 在弹出的分配对话框中在角色列表中渲染获取
      const { meta, data } = await this.$axios.get(`roles`)
      if (meta.status === 200) {
        // 如果成功就把data的值赋给options
        this.options = data
        console.log(data)
        // this.$message.success(meta.msg)
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 点击分配角色对话框发送ajax请求
    async assignUserdialog () {
      const { id, rid } = this.assignform
      // 如果rid=空，报错
      if (rid === '') {
        this.$message.error('请选择角色')
        // 并且return
        return
      }

      //   //  // 先校验, 校验成功, 发送编辑的ajax
      const { meta } = await this.$axios.put(`users/${id}/role`, {
        rid
      })
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        // 并且关闭对话框
        this.assignVisible = false
        // 重新渲染
        this.getUserList()
      } else {
        this.$message.error(meta.msg)
      }
    }
  }
}

</script>
<style lang='scss' scoped>
.users {
  .el-breadcrumb {
    height: 30px;
  }
  //搜索
  .input-with-select {
    width: 300px;
    margin-right: 40px;
    margin-bottom: 15px;
    background-color: #fff;
  }
}
</style>
