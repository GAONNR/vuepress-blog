<template>
  <div v-if="posts.length" class="posts">
    <el-row class="post" v-for="post in posts" :key="post.path">
      <el-card>
        <div slot="header" class="clearfix">
          <router-link :to="post.path" class="post-link">
            <div>
              <img
                v-if="post.frontmatter.image"
                :src="$withBase(post.frontmatter.image)"
                alt
              />
            </div>
            {{ post.frontmatter.title }} <br />
            <span class="post-date">{{ post.frontmatter.date }}</span>
          </router-link>
        </div>
        <div v-html="post.excerpt"></div>
        <router-link :to="post.path">Read more....</router-link>
      </el-card>
    </el-row>
  </div>
</template>

<script>
export default {
  props: ["page"],
  computed: {
    posts() {
      let currentPage = this.page ? this.page : this.$page.path;
      let posts = this.$site.pages
        .filter(x => {
          return x.path.match(new RegExp(`(${currentPage})(?=.*html)`));
        })
        .sort((a, b) => {
          return new Date(b.frontmatter.date) - new Date(a.frontmatter.date);
        });
      return posts;
    }
  }
};
</script>

<style scoped></style>
