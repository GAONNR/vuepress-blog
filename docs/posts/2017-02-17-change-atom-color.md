---
layout: post
title: Atom 에디터의 배경 색 변경
category: Development
date: "2017-02-17"
---

나는 주 텍스트 에디터로 Github에서 만든 [Atom](https://atom.io)을 사용 중이다.<br>
많은 텍스트 에디터 중 굳이 Atom을 사용하는 것은 Emmet, Beautify 등 좋은 플러그인이 많기 때문이기도 하지만, 아무래도 [atom-material-ui](https://atom.io/themes/atom-material-ui)와 [atom-material-syntax](https://atom.io/themes/atom-material-syntax)를 설치한 이후의 에디터 레이아웃이 맘에 드는 것이 크다.<br>
이 테마는 Google의 Material 디자인을 기반으로 해서 보기 좋은 편이지만, 인턴을 하면서 한 가지 불편함을 느끼게 됐는데, 그것은 에디터의 배경 색이 Blue Grey 계통이라는 것이었다. 물론 Blue Grey가 깔끔해 보이기에는 좋지만, 아무래도 일반적인 Grey에 비해 푸른색 계열의 색이 섞여 들어가므로, 장시간 작업 시에 눈이 피로해지는 일이 종종 있었다.

이를 해결하기 위해 많은 syntax를 조사해 보았지만, 맘에 드는 것을 찾을 수 없어 직접 config파일에서 배경색을 수정하기로 했다. Atom의 Preferences 메뉴에서 config 폴더를 연 후, `packages/atom-material-syntax/styles/colors.less`에 접근하여 배경색을 수정할 수 있었다. 이때 색 변경은 메터리얼 디자인 공식 페이지의 [컬러 가이드](https://material.io/guidelines/style/color.html) Grey 계열을 참고하였다.

<!-- more -->

![](/images/atom-color/compare-colors.png)

아래의 값들이 수정 이전의 색, 그리고 위의 값들이 수정 이후의 색이다. 전체적으로 Blue Grey계열의 색을 Grey계열로 변경하였다.

![](/images/atom-color/current-interface.png)

색 적용이 완료된 모습이다. 변경 전에 비해 전체적으로 눈의 피로가 줄어듦을 느낄 수 있었다.
