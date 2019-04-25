<template>
  <el-container style="max-width: 900px; margin: 0px auto;">
    <link href="https://fonts.googleapis.com/css?family=Jura" rel="stylesheet">
    <el-header class="blog-header" height="100px">
      <h1>{{ $site.title }}</h1>
    </el-header>

    <el-menu
      :router="true"
      :default-active="activeIndex"
      class="el-menu-demo"
      background-color="#f9fafc"
      type="flex"
      justify="center"
    >
      <el-row type="flex" justify="center">
        <el-col :xs="6" :md="4">
          <el-menu-item index="/">Home</el-menu-item>
        </el-col>
        <el-col :xs="6" :md="4">
          <el-menu-item index="/posts/">Posts</el-menu-item>
        </el-col>
        <el-col :xs="6" :md="4">
          <el-menu-item index="/about/">About</el-menu-item>
        </el-col>
      </el-row>
    </el-menu>

    <el-main>
      <component :is="$page.frontmatter.layout"/>
    </el-main>
  </el-container>
</template>

<script>
import Vue from "vue";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import locale from "element-ui/lib/locale/lang/ko";
import Prism from "prismjs";

Vue.use(ElementUI, { locale });
Vue.use(Prism);

export default {
  data() {
    return {};
  },
  computed: {
    activeIndex() {
      return this.page ? this.page : this.$page.path;
    }
  }
};
</script>

<style src="prism-themes/themes/prism-a11y-dark.css"></style>
<style src="../public/less/style.less" lang="less"></style>
<style scoped>
</style>