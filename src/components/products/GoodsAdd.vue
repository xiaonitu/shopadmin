<template>
  <div class="goods-add">
    <!-- 步骤 -->
    <el-steps :active="active" finish-status="success">
      <el-step title="步骤1" description="基本信息"></el-step>
      <el-step title="步骤2" description="图片商品"></el-step>
      <el-step title="步骤3" description="商品内容"></el-step>
    </el-steps>
    <!-- tabl -->
    <el-tabs v-model="activeTab" tab-position="left" @tab-click="handleClick">
      <el-tab-pane label="基本信息" name="0">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="商品名称">
            <el-input v-model="form.good_name" placeholder="请输入商品名称"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="form.good_price" placeholder="请输入商品价格"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="form.good_weight" placeholder="请输入商品重量"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="form.good_number" placeholder="请输入商品数量"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <!-- 级联 -->
            <el-cascader v-model="form.good_cat" :options="options" :props="props"></el-cascader>
          </el-form-item>
        </el-form>
        <el-button @click="next" type="primary">下一步</el-button>
      </el-tab-pane>
      <el-tab-pane label="图片商品" name="1">
        <!-- action 后台提交文件的地址 -->
        <!-- el-upload 不走 axios, 内部帮我们发送的请求,
             1. 需要将路径写全了
             文件上传路径是有统一的路径
              list-type="picture-card"文件列表的类型
        2. 需要在headers中带上token-->
        <el-upload
          action="http://localhost:8888/api/private/v1/upload"
          list-type="picture-card"
          multiple
          name="file"
          :headers="headers"
          :on-success="handleSuccess"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-button @click="next" type="primary">下一步</el-button>
      </el-tab-pane>
      <el-tab-pane label="商品内容" name="2">
        <quill-editor v-model="form.goods_introduce"></quill-editor>
        <el-button type="primary" @click="addGoods">添加</el-button>
      </el-tab-pane>
    </el-tabs>
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt />
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      active: 0,
      form: {
        goods_name: '',
        goods_cat: [], // 存放选中的分类id
        goods_price: '',
        goods_number: '',
        gooods_weight: '',
        goods_introduce: '',
        pic: []// 存放所有选中的用于上传的图片地址, 数组里面包着对象的格式 [ { pic: 'xxx' }]
      },
      options: [],
      // 级联菜单配置
      props: {
        value: 'cat_id', // 选中的id值，数组
        label: 'cat_name', // 显示的级联文本
        children: 'children'// 子代展开
      },
      headers: {
        Authorization: localStorage.getItem('token')
      },
      dialogVisible: false,
      dialogImageUrl: '',
      activeTab: '0'
    }
  },
  async created () {
    // 发送ajax获取三级的分类数据, 用于添加商品
    const { meta, data } = await this.$axios.get('categories?type=3')
    if (meta.status === 200) {
      this.options = data
      console.log(data)
    } else {
      this.$message.error(meta.msg)
    }
  },
  methods: {
    // 拿到是字符串，需要的是数字 tab栏标签页
    handleClick (tab) {
      this.active = +tab.index
    },
    // 下一步
    next () {
      // 控制步骤条，往下走一步
      this.active++
      // 控制tab栏，切换到下一个
      this.activeTab = this.active + ''
    },
    // 拿到成功的东西 on-success
    // handleSuccess (response, file, fileList) {
    //   const { meta, data } = response
    //   if (meta.status === 200) {
    //     this.form.pics.push({
    //       pic: data.tmp_path
    //     })
    //   } else {
    //     this.$messages.error(meta.msg)
    //   }
    // },
    handleSuccess (response, file, fileList) {
      // console.log(response)  后台返回的内容
      // console.log(file)
      // console.log(fileList)
      const { meta, data } = response
      if (meta.status === 200) {
        this.form.pics.push({
          pic: data.tmp_path
        })
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 图片上传
    // 图片的删除处理
    handleRemove (file, fileList) {
      // 根据file的名字，从pics中将对应的pic删除
      console.log(file, fileList)
      const path = file.response.data.tmp_path
      this.form.pics = this.form.pics.filter(item => item.pic !== path)
    },

    // 点击预览问题
    // 预览
    handlePictureCardPreview (file) {
      // 将点击预览的图片路径, 给到了 dialogImageUrl
      this.dialogImageUrl = file.url
      // 将对话框显示了
      this.dialogVisible = true
    },
    async addGoods () {
      const { meta } = await this.$axios.post('goods', {
        ...this.form,
        // 如果有重复的属性, 后添加会覆盖前面的
        goods_cat: this.form.goods_cat.join(',')
      })
      if (meta.status === 201) {
        this.$message.success(meta.msg)
        this.$router.push('/goods')
      } else {
        this.$message.error(meta.msg)
      }
    }
  }

}
</script>

<style lang='scss' scoped>
.quill-editor {
  background: #fff;
  ::v-deep .ql-editor {
    min-height: 400px;
  }
}
</style>
