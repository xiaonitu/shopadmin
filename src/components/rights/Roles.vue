<template>
  <div class="roles">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加角色 -->
    <el-button @click="showAddDialog" class="addbtn" type="success" plain size="small">添加用户</el-button>
    <!-- 列表 -->
    <template>
      <!-- row表示遍历rowList的一项 ，就是一个角色-->
      <!-- row.children 就是全部的一级权限 -->
      <!-- <el-tag v-for="item in row.children" :key="item.id">{{ item.authName }}</el-tag> -->
      <!-- 渲染一级权限的行, 有多少个一级, 就有多少行 -->
      <el-table :data="rolesList">
        <el-table-column type="expand">
          <template v-slot:default="{row}">
            <el-row class="l1" v-for="l1 in row.children" :key="l1.id">
              <el-col :span="4">
                <!-- @close="delRoleRights(row, l1.id)"是删除事件 -->
                <el-tag @close="delRoleRights(row, l1.id)" closable>{{l1.authName}}</el-tag>
                <!-- <el-button type="primary" plain size="small"></el-button> -->
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <el-col :span="20">
                <el-row class="l2" v-for="l2 in l1.children" :key="l2.id">
                  <el-col :span="4">
                    <el-tag
                      @close="delRoleRights(row, l2.id)"
                      type="success"
                      closable
                    >{{l2.authName}}</el-tag>
                    <i class="el-icon-arrow-right"></i>
                    <!-- <el-button type="success" plain size="small"></el-button> -->
                  </el-col>
                  <el-col :span="20">
                    <!-- <el-button type="warning" plain size="small"></el-button> -->
                    <el-tag
                      type="warning"
                      @close="delRoleRights(row, l3.id)"
                      class="l3"
                      v-for="l3 in l2.children"
                      :key="l3.id"
                      closable
                    >{{l3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" width="50px"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="描述"></el-table-column>
        <el-table-column prop="address" label="操作">
          <template v-slot:default="{ row }">
            <el-button
              type="primary"
              plain
              size="small"
              icon="el-icon-edit"
              @click="showEditDialog(row)"
            ></el-button>
            <el-button
              @click="delRole(row.id)"
              icon="el-icon-delete"
              size="small"
              type="danger"
              plain
            ></el-button>
            <el-button
              icon="el-icon-check"
              type="success"
              size="small"
              plain
              @click="showAssignDialog(row)"
            >分配权限</el-button>
            <!-- 点击分配权限弹出模态框 -->
          </template>
        </el-table-column>
      </el-table>
    </template>
    <!-- 分配权限弹出框 -->
    <el-dialog title="分配权限" :visible.sync="assignVisible" width="40%">
      <el-tree
        :data="data"
        :props="defaultProps"
        show-checkbox
        default-expand-all
        ref="tree"
        node-key="id"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assiginVisible = false">取 消</el-button>
        <el-button type="primary" @click="assiginRights">分配</el-button>
      </span>
    </el-dialog>
    <!-- 添加角色 -->
    <!-- :visible.sync="addRoleVisible"控制显示和隐藏 -->
    <el-dialog :title="dialogtitle" :visible.sync="addRoleVisible" width="50%">
      <!-- :model是传值 父传子   ：rules校验  ref="获取dom元素"-->
      <el-form :model="form" :rules="rules" ref="form" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="form.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rolesList: [],

      // item: [], // 是el-tag删除标签里的
      // 分配权限弹框，刚开始显示
      roleId: '',
      assignVisible: false,
      data: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 添加角色// 树状
      addRoleVisible: false,
      form: {
        roleName: '',
        roleDesc: '',
        roleId: ''
      },
      rules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: ['blur', 'change'] }
        ],
        roleDesc: [
          { required: true, message: '角色描述不能为空', trigger: ['blur', 'change'] }
        ]
      },
      // 添加默认值
      dialogtitle: '添加角色'
    }
  },
  created () {
    this.getrolesList()
  },
  methods: {
    // 这一步是渲染列表
    async getrolesList () {
      const { data, meta } = await this.$axios.get('roles')
      if (meta.status === 200) {
        // 获取数据，获取到的数据存到rolesList中
        this.rolesList = data
        // console.log(data)
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 删除角色的指定权限
    async delRoleRights (row, rightId) {
      const { data, meta } = await this.$axios.delete(`roles/${row.id}/rights/${rightId}`)
      // 开始渲染
      // console.log(data)
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        //  // 重新渲染 this.getRoleList() 如果整个重新渲染, 不太好
        // 其实只需要重新渲染 删除权限的当前角色 即可
        row.children = data
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 分配权限
    async showAssignDialog (row) {
      this.roleId = row.id
      // console.log(row) row.children 就是对应的所有一级权限
      this.assignVisible = true
      // 角色授权
      const { data, meta } = await this.$axios.get('rights/tree')
      if (meta.status === 200) {
        this.data = data
        // this.$message.success(meta.msg)
        // console.log(data)
        // 将该角色已有的权限, 进行回显
        // 可以根据tree组件的方法, 进行设置需要选中的节点
        // 设置了一级权限, 将来二级和三级都会被全选, 如果设置了二级权限, 三级会被全选
        // 这里: 应该将所有的三级id, 拿出来设置即可
        // this.$refs.tree.setCheckedKeys([101])
        // getCheckedKeys()全选，getHalfCheckedKeys()半选

        // row.children 所有的一级
        // 回显
        const ids = []
        row.children.forEach(l1 => {
          l1.children.forEach(l2 => {
            l2.children.forEach(l3 => {
              ids.push(l3.id)
            })
          })
        })
        this.$refs.tree.setCheckedKeys(ids)
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 分配权限
    async  assiginRights () {
      // 全选的id要获取到，勾选的id也要获取到
      const ids = this.$refs.tree.getCheckedKeys()// 全选的id获取
      const halfs = this.$refs.tree.getHalfCheckedKeys()// 半选
      const rids = [...ids, ...halfs].join(',')

      const { meta } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids })
      if (meta.status === 200) {
        this.$message.success(meta.msg)
        // 关闭对话框
        this.assignVisible = false
        this.getrolesList()
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 删除角色
    async delRole (id, e) {
      if (e.target.nodeName === 'BUTTON') {
        e.target.blur()
      } else {
        e.target.parentNode.blur()
      }
      try {
        await this.$confirm('你确定要删除该角色', '温馨提示', {
          type: 'warning'
        })
        const { meta } = await this.$axios.delete(`roles/${id}`)
        if (meta.status === 200) {
          // 如果成功
          this.$message.success(meta.msg)
          // 重新渲染
          this.getrolesList()
        } else {
          this.$$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 添加角色
    showAddDialog (row) {
      this.dialogtitle = '添加角色'
      this.addRoleVisible = true
      this.$nextTick(() => {
        // 进行数据的回显
        this.form.id = row.id
        this.form.roleDesc = row.roleDesc
        this.form.roleName = row.roleName
      })
    },
    // 修改角色
    showEditDialog (row) {
      this.dialogtitle = '修改角色'
      this.addRoleVisible = true// 将对话框只能是出来，vue中的dom是异步的，不会立即根性
      // 数据回显，数据回显就是在表单中出现所点击的内容，并且在原内容上修改
      this.$nextTick(() => {
        // 在显示完对话框之后，在立即回显
        // 对于修改来说，还需要回显数据
        this.form.id = row.id
        this.form.roleName = row.roleName
        this.form.roleDesc = row.roleDesc
      })
    },
    closeDialog () {
      // 将表单内容和状态，都重置为初始状态(是对话框第一次展示状态)
      this.$refs.form.resetFields()
      this.form.id = ''
    },
    async addRole () {
      // 发送请求前，校验
      try {
        // await this.$refs.form.validata()
        // form.validate()表单校验
        await this.$refs.form.validate()
        // 只要能够到这里，说明校验成功
        const isAdd = this.dialogtitle === '添加角色'
        // 根据 isAdd 发送对应的 ajax请求
        // 分析不同: 请求路径, 请求方式, 请求参数(一样的, 多的id传在了地址中)
        const url = isAdd ? 'roles' : `roles/${this.form.id}`
        const method = isAdd ? 'post' : 'put'
        // 根据isAdd发送对应的ajax请求
        // 分析不同：请求路径，请求方式，请求参数
        const { meta } = await this.$axios[method](url, this.form)
        if (meta.status === 200 || meta.status === 201) {
          this.$message('恭喜，操作成功')
          // 关闭对话框
          this.addRoleVisible = false
          // 重新渲染
          this.getrolesList()
        }
      } catch (e) {
        console.log(e)
      }
    }
  }

}

</script>

<style lang="scss" scoped>
.roles {
  .el-breadcrumb {
    height: 30px;
  }
  .addbtn {
    margin-bottom: 10px;
  }
  .l1 {
    margin-bottom: 5px;
  }
  .l2 {
    margin-bottom: 5px;
  }
  .l3 {
    margin-bottom: 5px;
    margin-right: 5px;
  }
}
</style>
