---
layout: post
title: Surge로 Static Site 배포하기
category: Development
date: '2019-04-25'
---

이전에 vuepress로 만든 블로그를 github pages를 이용하여 배포하는 방법을 올린 적이 있는데, 매번 빌드 된 사이트를 커밋하려면 기존 커밋과 충돌이 나 불편함이 있었다.  
그러던 중, [Surge](https://surge.sh/)라는 static site 호스팅 서비스를 알게 되어 적용해 보기로 했다.

<!-- more -->

적용 방법은 아주 쉽다. `npm install -g surge` 후, 배포하려는 폴더에 들어가서 (내 블로그의 경우에는 docs/.vuepress/dist) `surge` 명령어를 입력하면 된다.
그러면 자동으로 회원가입이 진행되고, 배포하려는 도메인을 입력하면 된다.
이 도메인은 기본적으로 `*.surge.sh` 형식을 띄고 있는데, Custom domain을 적용하기 위해서는 [다음과 같은 절차](https://surge.sh/help/adding-a-custom-domain)를 수행한 후, deploy시 custom domain을 입력하면 된다.

서비스가 매우 간편하고 직관적이어서, static page를 배포하는 데는 아주 좋은 서비스인 것 같다.
