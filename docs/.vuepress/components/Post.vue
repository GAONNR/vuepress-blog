<template>
  <div class="posts">
    <el-row class="post">
      <el-card>
        <div slot="header" class="clearfix">
          <router-link :to="$page.path" class="post-link">
            <div>
              <img v-if="$page.frontmatter.image" :src="$withBase($page.frontmatter.image)" alt>
            </div>
            {{ $page.frontmatter.title }}
            <br>
            <span class="post-date">{{ $page.frontmatter.date }}</span>
          </router-link>
        </div>
        <Content/>
      </el-card>
    </el-row>
    <disqus/>
  </div>
</template>

<script>
export default {};
</script>

<style scoped></style>
