<template>
  <div class="categories">
    <el-button class="addbtn" type="success" size="small" plain @click="addcategory">添加分类</el-button>
    <!-- 表格 -->
    <el-table
      element-loading-text="拼命加载中"
      v-loading="loading"
      :data="categoryData"
      style="width: 100%"
      row-key="cat_id"
      :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
    >
      <el-table-column prop="cat_name" label="分类名称"></el-table-column>
      <el-table-column prop="cat_name" label="是否有效"></el-table-column>
      <el-table-column prop="cat_level" label="层级"></el-table-column>
      <el-table-column label="操作">
        <el-button plain type="primary" icon="el-icon-edit" size="small"></el-button>
        <el-button plain type="danger" icon="el-icon-edit" size="small"></el-button>
      </el-table-column>
    </el-table>
    <!-- 分页  :current-page=""当前页   :page-size="pagesize"显示的条数 -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[4, 5, 6,4]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
    <!-- 添加分类对话框 -->
    <!-- :visible.sync="dialogVisible"对话框的显示与隐藏
    ref获取dom中的元素 :model 父传子-->
    <el-dialog title="添加分类" :visible.sync="adddialogVisible" width="50%">
      <el-form :model="Form" :rules="rules" ref="Form" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="Form.cat_name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父级名称" prop="cat_pid">
          <!-- :options="options"是传入的数据 -->
          <el-cascader clearable v-model="Form.cat_pid" :options="options" :props="props"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addVisible">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 空数据
      categoryData: [
      ],
      loading: true,
      // 当前页码
      pagenum: 1,
      // 显示的条数
      pagesize: 5,
      // 总页数
      total: 0,
      // 添加分类的对话框，可见性控制
      adddialogVisible: false,
      Form: {
        cat_pid: '', // 一开始就拿到id
        cat_name: '',
        cat_level: ''
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }
        ] },
      options: [],
      props: {
        checkStrictly: true, // 可以只选中一级
        value: 'cat_id', // 用于提交的 id
        label: 'cat_name', // 用于展示的文本
        children: 'children'
      }

    }
  },
  created () {
    this.getcategroyList()
  },
  methods: {
    async getcategroyList () {
      this.loading = true
      // get和delect是需要在params里传参的
      const { data, meta } = await this.$axios.get('categories', {
        params: {
          pagenum: this.pagenum,
          pagesize: this.pagesize,
          type: 3
        }
      })
      if (meta.status === 200) {
        // this.$message.success('meta.msg')
        // 把data的值赋给catagoryData
        this.categoryData = data.result
        this.total = data.total
        console.log(data)
      }
      this.loading = false
    },
    // 分页
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getcategroyList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getcategroyList()
    },
    // 添加对话框
    async addcategory () {
      this.adddialogVisible = true
      const { meta, data } = await this.$axios.get(`categories?type=2`)
      if (meta.status === 200) {
        this.options = data
        console.log(data)
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 添加对话框确认
    async addVisible () {
      try {
        // 表单校验
        await this.$refs.Form.validate()
        const { meta } = await this.$axios.post('categories', {
          // 拿到选中的最后一项的id，就是父级id
          // 如果没有选，拿不到最后一项，给默认值0，如果给的是0，就没有父级
          // cat_pid: this.Form.cat_pid[this.Form.cat_pid.length - 1] || 0,
          cat_pid: this.Form.cat_pid[this.Form.cat_pid.length - 1] || 0,
          // 分类名称
          cat_name: this.Form.cat_name,
          // 当前级别
          cat_level: this.Form.cat_pid.length
        })
        if (meta.status === 201) {
          this.$message.success(meta.msg)
          // 关闭模态框，重新渲染
          this.adddialogVisible = false
          this.getcategroyList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    closeDialog () {
      // 表单重置
      this.$refs.Form.resetFields()
    }
  }
}

</script>

<style lang="scss" scoped>
.categories {
  .addbtn {
    margin-bottom: 10px;
  }
}
</style>
