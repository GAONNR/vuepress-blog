---
layout: post
title: vuepress로 블로그 만들기
category: Development
date: '2019-01-01'
---

예전부터 블로그 디자인이랑 엔진을 좀 바꾸고 싶었는데, 계속 생각만 하고 있다가 대학교 졸업 전 마지막 방학에서야 이루게 되었다.  
이전에는 쭉 Jekyll 엔진을 사용했었고, Lanyon을 조금 수정한 테마를 유지하고 있었는데, 아무래도 Jekyll의 기반인 Ruby 언어가 내가 다룰 줄 아는 언어가 아니기도 하고, Lanyon 테마 사용자도 너무 흔한 것 같아서 좀 유니크한 디자인을 갖고 싶었다. 웹 개발을 한 지 너무 오래되어서 감을 찾고 싶기도 했고.

새 블로그 엔진은 웬만하면 Javascript 기반으로 하고 싶었다. 그게 좀 더 힙해 보일 것 같으니까. Python 기반의 프레임워크도 있다면 써 봄직했는데 찾아보니까 별 게 없는 것 같아서 포기했다.  
아무래도 이 방면에선 Gatsby가 제일 유명하다길래 설치도 하고 도큐도 읽고 예시 실행도 해보면서 이걸 어떻게 써먹어야 할까 생각하고 있었는데, 당시 군인이었던 친구가 (어제 전역했다) vuepress라는 정적 사이트 생성 엔진이 있다는 걸 알려주었다. 안 그래도 Vue.js는 좋아하는 프레임워크였고, 또 친구가 쓴다고 하니 망설임없이 vuepress로 갈아타기로 결정했다.  
Vue 기반 정적 사이트 엔진으로 Nuxt.js라는 게 있다고도 하던데, 기회가 되면 그것도 써 보고는 싶다.

다른 프레임워크보다 Vue.js를 선호하는 이유는 일단 굉장히 떠오르고 있기도 하고, Vue 특유의 템플릿 방식이 (타 프레임워크에선 JSX를 많이 사용하는 것으로 알고 있다) 개발에 있어서 좀 더 직관적이라고 느껴서이기도 하다. Vue의 컴포넌트 파일은 이런 식으로 되어 있는데,

```html
<template>
  <div></div>
</template>

<script>
  export default {};
</script>

<style scoped></style>
```

HTML/CSS를 조금이라도 다뤄 봤다면 정말 익숙한 구조라, 적응과 이식에 드는 수고가 적은 편이라고 할 수 있겠다.

<!-- more -->

아무튼 vuepress를 선택하게 됐는데, 문제는 vuepress의 documentation이 좋은 편이 아니라는 것이었다. Vue.js는 documentation이 굉장히 잘 되어 있는 편인데, vuepress는 설명이 간략하거나, 빠져 있는 등 부족한 부분이 많아서 삽질을 좀 많이 해야 했다. 기존에 만들어진 vuepress의 블로그 테마들의 구조를 보면서 어찌저찌 만들 수 있었는데, 혹시나 다음에 또 헤메지 않게 여기에 기록을 해 두려고 한다.

#### vuepress 기본 구조 만들기

보통 이런 프레임워크는 기본 구조를 간편하게 만들 수 있게 CLI 명령어를 제공하는 경우가 많은데, 원래 없는 건지 검색을 못 한 건지는 모르겠으나 해당하는 명령어를 찾지 못했다. 그러던 중 [Yeoman](https://yeoman.io)이라는 툴을 알게 됐는데, generator 생성을 전문으로 하는, 매우 유용해보이는 툴이었다. 다행히 [generator-vuepress](https://github.com/amimaro/generator-vuepress)라는 Yeoman 전용 패키지가 있었고, 덕분에 다음과 같이 기본 뼈대를 만드는 것에 성공했다.

![vuepress basic structure](/images/vuepress-blog/basic-structure.png)

그 후에, 이전 블로그에서 썼었던 포스트 파일들을 posts 폴더를 만들어 그 안에 집어넣었다.

![paste posts](/images/vuepress-blog/paste-posts.png)

포스트들은 다음과 같은 YAML frontmatter 형식을 가지고 있다. `layout`은 내가 이 포스트를 띄울 때 사용할 레이아웃의 이름을 의미하고, `title`은 제목을, `date`는 쓴 날짜를 의미한다. `category`는 포스트의 카테고리를 의미하며, 모든 frontmatter는 이후 각각의 포스트, 전체 리스트와 홈 화면에 정보를 띄우는 데 사용될 것이다.

```markdown
---
layout: post
title: D3를 통한 차트 제작 스터디
category: Development
date: '2017-02-15'
---
```

#### 페이지 레이아웃 변경하기

블로그의 전체적인 Layout를 담당하는 Layout.vue는 기본적으로 다음과 같은 구조를 가지고 있다.

![default layout](/images/vuepress-blog/default-layout.png)

`<Content />` 태그 안에, README.md 파일을 HTML로 변환한 내용이 씌어지게 된다.
하지만 이 블로그에서 나는 총 네 개의 페이지 레이아웃(Home, 개별 포스트, 전체 포스트 리스트, About)을 제작할 것이므로, Layout.vue 파일 하나로는 구현이 번거로울 수밖에 없다. 따라서, 각각의 레이아웃에 대응하는 컴포넌트를 만들고, 마크다운 파일에서 지정한 레이아웃에 따라 해당하는 컴포넌트를 띄워 주는 것이 필요하다. 따라서, Layout.vue 파일을 다음과 같이 수정하였다.

![component layout](/images/vuepress-blog/component-layout.png)

`<component :is="$page.frontmatter.layout"/>` 구문을 통해, 마크다운 파일의 layout에 해당하는 컴포넌트를 띄울 수 있다. 예를 들어, `layout: post` 라면 `components/Post.vue`에 구현된 컴포넌트를 사용하게 되는 것이다.

스크린샷에서 보이는 것과 같이, 블로그의 레이아웃 구현에는 ElementUI 라이브러리를 사용하였다. 아무래도 Vue 전용으로 구현된 프레임워크를 사용하는 것이 빠른 개발에 도움이 많이 된다.

#### 포스트 리스트 불러오기

아까 posts폴더에 붙여놓은 포스트들의 정보는 `this.$site.pages` 변수를 이용하여 불러올 수 있다.

```javascript
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
      return posts;
    }
  }
};
```

위와 같은 코드를 이용하면, posts를 참조하는 것으로 모든 포스트들의 정보에 접근할 수 있다.
이후, 다음과 같은 코드를 이용하여 Home 화면에 모든 포스트들의 간략한 정보를 띄울 수 있었다.

```vue
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
```

여기서 post.excerpt는, 포스트의 마크다운 파일에 `<!-- more -->`이 존재할 경우, 이 태그 위에 쓰여 있는 모든 내용을 의미한다.
이 때 images 폴더를 `.vuepress/public`안으로 이동하였는데, excerpt 내용 안에 이미지가 존재하면 파싱 문제로 인해서 Home 화면에서 잘못된 이미지 경로를 사용하기 때문이었다.

#### 포스트 레이아웃 만들기

포스트 레이아웃은 좀 더 간단한데, 다음과 같이 적당한 정보를 넣고, `<Content/>` 태그를 집어넣어 포스트의 전체 내용을 표시할 수 있게 하면 된다.

```Vue
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
  </div>
</template>
```

#### 카테고리별로 포스트 분류하기

다음과 같은 소스 코드로 전체 포스트를 카테고리별로 분류할 수 있다. 나는 이 정보를 가지고 각각의 Category마다 Card를 만들어 그 안에 포스트의 링크들을 집어넣었다.

```javascript
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
```

#### Github pages로 배포하기

--- 2019.04.25 수정 ---
```
해당 방법보다는 새 포스트의 Surge로 배포하기를 참고하시는 걸 추천드립니다.
```

`vuepress build docs` 명령어를 사용하면 `.vuepress/dist` 폴더 안에 빌드된 프로젝트 파일들이 생성되는데 (평상시에는 `vuepress dev docs` 명령어로 실시간 프리뷰와 디버깅을 할 수 있다), Github에서 지원하는 subtree 기능을 통해 같은 레포지토리에서 dist 폴더만을 깃허브 페이지를 통해 배포할 수 있다.

Repository 안의 deploy.sh 파일을 제작하여 subtree push를 자동화하였다.

#### Surge로 배포하기

[포스트 링크](https://blog.g40n.xyz/posts/2019-04-25-deploy-with-surge.html)

#### 소스 코드

블로그를 만들면서 작성했던 모든 코드는 깃허브의 [내 Repository](https://github.com/GAONNR/vuepress-blog)에 올려 두었다. 직접 만든 테마도 적용이 되어 있는데, 시간이 된다면 이 테마를 깨끗하게 다듬어서 배포해 볼 생각이다. 물론 지금도 Repository를 내려받아 사적인 파일을 지운다면 테마로서 사용할 수는 있다.

#### Reference

- [How to create a custom VuePress theme with Vuetify](https://medium.com/vue-mastery/how-to-create-a-custom-vuepress-theme-with-vuetify-651b7d7e5092)
- [Creating a blog with Vuepress](https://medium.com/@adam.collier/creating-a-blog-with-vuepress-44ec0fed9718)
- [Vuepress documentation](https://v0.vuepress.vuejs.org/guide/custom-themes.html#app-level-enhancements)
- [Element UI](https://element.eleme.io/#/en-US)
