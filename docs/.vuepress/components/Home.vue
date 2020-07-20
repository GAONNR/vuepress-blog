<template>
  <div v-if="postsForPage.length" class="posts">
    <el-row class="post" v-for="post in postsForPage" :key="post.path">
      <el-card>
        <div slot="header" class="clearfix">
          <router-link :to="post.path" class="post-link">
            <div>
              <img v-if="post.frontmatter.image" :src="$withBase(post.frontmatter.image)" alt>
            </div>
            {{ post.frontmatter.title }}
            <br>
            <span class="post-date">{{ post.frontmatter.date }}</span>
          </router-link>
        </div>
        <div v-html="post.excerpt"></div>
        <router-link :to="post.path">Read more....</router-link>
      </el-card>
    </el-row>

    <br>
    <el-row type="flex" class="row-bg" justify="center">
      <el-button-group style="display: block; width: 80%;">
        <el-button
          type="primary"
          icon="el-icon-arrow-left"
          style="width: 50%; height: 48px;"
          v-on:click="increasePageNum(-1)"
        >Previous Page</el-button>
        <el-button type="primary" style="width: 50%; height: 48px;" v-on:click="increasePageNum(1)">
          Next Page
          <i class="el-icon-arrow-right el-icon-right"></i>
        </el-button>
      </el-button-group>
    </el-row>
  </div>
</template>

<script>
export default {
  props: ['page'],
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
      this.postLength = posts.length;
      return posts;
    },
    postsForPage() {
      let postIndex = this.pageNum * this.postPerPage;
      return this.posts.slice(postIndex, postIndex + this.postPerPage);
    }
  },
  methods: {
    increasePageNum(amount) {
      this.pageNum += amount;
      if (this.pageNum < 0) {
        this.pageNum = 0;
      } else if (
        this.pageNum >= Math.round(this.postLength / this.postPerPage)
      ) {
        this.pageNum = Math.round(this.postLength / this.postPerPage) - 1;
      }
      console.log(this.pageNum);
    }
  },
  data() {
    return {
      pageNum: 0,
      postLength: 0,
      postPerPage: 5
    };
  }
};
</script>

<style scoped></style>
