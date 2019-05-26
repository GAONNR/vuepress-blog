---
layout: post
title: Blizzard API를 활용한 개인방송용 스타크래프트2 MMR 표시기 제작 - 스타우터(sc2outer)
category: Development
date: '2019-05-27'
---

> 현재 작성 중인 포스트입니다.

![sc2outer example](https://raw.githubusercontent.com/GAONNR/sc2outer/master/readme/1.gif)

- [사용법(Dcinside 우주전쟁 마이너 갤러리)](https://gall.dcinside.com/m/sc2/228095)
- [Github Repository](https://github.com/GAONNR/sc2outer)
- [실제 서비스 페이지](https://sc2outer.app:3000/)

예전에 친구한테 이런 제안을 받은 적이 있다.

> 롤의 티어 표시기처럼 스타2도 개인방송용 플러그인이 있으면 좋지 않을까?

마침 나도 취미로 트위치에 방송을 송출하고 있기도 했고, 대충 찾아보니 OBS나 Xplit의 브라우저 기능을 활용해서 웹 기술로 만들 수 있는 것 같아 흥미가 생겼었다.

<!-- more -->

그래서 대충 머릿속으로 구상을 시작했는데, 어차피 유저의 MMR이나 전적은 블리자드가 API를 열어 제공해 줄 테니 내가 해 줄 건 데이터에 모양을 이쁘게 넣어 주는 것밖에 없을 것 같았다.
'그러면 그냥 정적 사이트 하나만 만들면 되는 거 아니야? 정적 사이트면 깃허브 페이지로도 배포할 수 있고, 서버비도 안 드니까 이득일 거 같은데?'라고 생각하고, 블리자드 API Documentation을 찾아갔는데, 쓰는 사람이 별로 없는 건지 서버가 응답이 없어 한동안 들어가지지 않았다(솔직히 여기서 좀 불안했다). 매일 접속이 되는지 체크해보기를 4일 정도 하니 접속이 가능했다. 블리자드 서버 관리팀 쪽에서 내 접속 리퀘스트를 보고 열어줬는지, 아니면 인터넷 제공 업체의 문제였는지는 아직도 모르겠다.

사용법을 천천히 읽어봤더니, 사용자의 정보를 검색하기 위해서는 사용자의 고유 UID를 알아야 했다.
이걸 알 방법은 따로 없고(배틀코드와는 다르고, SC2 profile URL에 뜨는 숫자와도 다르다.), Blizzard OAuth API에 로그인 정보를 입력하고 직접 받아 와야 하는 데이터라,
제대로 쓰려면 내 앱을 등록하고 private한 credential을 발급받는 절차가 필요했다. 여기서 정적 페이지로 서빙하려는 계획이 날아갔다.
정적 페이지로 구현하려면 모든 걸 client(브라우저)단에서 구현해야 하는데, 그럼 내가 발급받은 private token도 사용자에게 공개되어 버리니까. 괜히 누가 와서 뜯어 봤다가 내 토큰을 악용할 수도 있으니, 이를 숨기기 위해서 서버에서 credential을 가지고 정보를 얻어오는 게 필요했다.

그래도 아직 Vue로 프론트 쪽에 집중하고 싶은 미련을 못 버려서, OAuth 로그인을 서버에서 처리하고 프론트 단에서 나머지를 죄다 처리할 수 없나 한참을 찾아봤는데, 아무래도 없는 것 같았다.
Blizzard OAuth 쪽에서 아직 클라이언트 단을 지원하지 않는 듯 했다...내가 못 찾은 걸 수도 있고. 아무튼 구글 같은 다른 곳들은 잘 지원하던데 조금 아쉬웠다.
내가 OAuth라는 개념이 대강 뭔지만 알고 있었지 작동 원리를 잘 모르고 있었어서, 이 부분에서 삽질을 하느라 전체 앱 개발 시간의 절반 이상을 까먹은 것 같다.

Front/Back 분리에 대한 미련을 버리고 나니, 블리자드 측에서 Express를 활용한 [OAuth 라이브러리](https://github.com/Blizzard/passport-bnet)와 예시를 제공하고 있어서 그 뒤는 생각보다 구현이 쉬웠다.
위 링크처럼 npm에서 `passport-bnet`을 설치하고, 다음과 같은 코드로 UID를 얻어낼 수 있었다.

```javascript
var BnetStrategy = require('passport-bnet').Strategy;
var BNET_ID = process.env.BNET_ID;
var BNET_SECRET = process.env.BNET_SECRET;

// Use the BnetStrategy within Passport.
passport.use(
  new BnetStrategy(
    {
      clientID: BNET_ID,
      clientSecret: BNET_SECRET,
      callbackURL: 'https://localhost:3000/auth/bnet/callback',
      region: 'us'
    },
    function(accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }
  )
);
```

```javascript
// routes
app.get('/auth/bnet', passport.authenticate('bnet'));

app.get(
  '/auth/bnet/callback',
  passport.authenticate('bnet', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/');
  }
);
```

위 두 코드는 `passport-bnet`의 가장 간단한 예제 코드이며, 이를 통해 req.user 파라미터에서 user의 기본적인 정보를 얻어낼 수 있다.
이 때, 블리자드의 정책에 의해, callbackURL을 블리자드 API의 앱 관리 페이지에 등록해 주어야 한다.
