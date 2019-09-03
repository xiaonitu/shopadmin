<template>
  <div class="goods">
    <el-button class="addBtn" type="success" plain @click="goAdd">添加分类</el-button>
    <!-- 表格 -->
    <el-table :data="goodsList">
      <el-table-column type="index" :index="indexMethod"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name"></el-table-column>
      <el-table-column label="商品价格" prop="goods_price"></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight"></el-table-column>
      <el-table-column label="创建时间">
        <template v-slot:default="{row}">
          <!-- {{ msg | 过滤器名字 }} -->
          {{row.add_time|time}}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="{row}">
          <el-button type="primary" plain size="small" icon="el-icon-edit"></el-button>
          <el-button type="danger" plain size="small" icon="el-icon-delete"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[4,5,15,5]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data () {
    return {
      goodsList: [],
      pagenum: 1,
      pagesize: 4,
      total: 0
    }
  },
  created () {
    this.getgoodsList()
  },
  methods: {
    async getgoodsList () {
      const { meta, data } = await this.$axios.get('goods',
        {
          params: {
            pagenum: this.pagenum,
            pagesize: this.pagesize
          }
        })
      if (meta.status === 200) {
        this.goodsList = data.goods
        // 记录总条数
        this.total = data.total
      } else {
        this.$message.error(meta.msg)
      }
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagenum = 1
      this.pagesize = val
      this.getgoodsList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getgoodsList()
    },
    indexMethod (index) {
      // 从下标0开始,      当前商品页数           当前每页显示的条数
      return index + 1 + (this.pagenum - 1) * this.pagesize
    },
    goAdd () {
      this.$router.push('/goods-add')
    }
  }
}
</script>

<style lang="scss" scoped>
.goods {
  .addBtn {
    margin-bottom: 10px;
  }
}
</style>
