<template>
  <div v-if="Object.keys(postsByCategory).length" class="posts">
    <el-row class="post" v-for="category in Object.keys(postsByCategory)" :key="category">
      <el-card>
        <div slot="header" class="clearfix">
          <span class="post-link">{{ category }}</span>
          <span class="post-date">category</span>
        </div>
        <li v-for="post in postsByCategory[category]">
          <router-link :to="post.path">{{ post.frontmatter.title }}</router-link>
          <span class="post-date">{{ post.frontmatter.date }}</span>
        </li>
      </el-card>
    </el-row>
  </div>
</template>

<script>
export default {
  props: ['page'],
  computed: {
    postsByCategory() {
      let currentPage = this.page ? this.page : this.$page.path;
      let posts = this.$site.pages
        .filter(x => {
          return x.path.match(new RegExp(`(${currentPage})(?=.*html)`));
        })
        .sort((a, b) => {
          return new Date(b.frontmatter.date) - new Date(a.frontmatter.date);
        });
      let postsByCategory = {};
      posts.forEach(post => {
        let cat = post.frontmatter.category;
        if (cat in postsByCategory) {
          postsByCategory[cat].push(post);
        } else {
          postsByCategory[cat] = [post];
        }
      });
      return postsByCategory;
    }
  }
};
</script>

<style scoped>
</style>