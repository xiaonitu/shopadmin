<template>
  <div class="rights">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 列表 -->
    <template>
      <el-table :data="listData">
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column label="层级">
          <template v-slot:default="{row}">
            <p v-if="row.level === '0'">一级</p>
            <p v-if="row.level === '1'">二级</p>
            <p v-if="row.level === '2'">三级</p>
          </template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script>
export default {
  data () {
    return {
      listData: []
    }
  },
  created () {
    this.getRightList()
  },
  methods: {
    async getRightList () { // 获取数据
      const { meta, data } = await this.$axios.get('rights/list')
      // const { meta, data } = await this.$axios.get('rights/list')
      if (meta.status === 200) {
        // 拿到数据存起来准备渲染
        this.listData = data
        console.log(data)
      } else {
        this.$message.error(meta.msg)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.rights {
  .el-breadcrumb {
    height: 45px;
  }
}
</style>
