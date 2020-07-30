---
layout: post
title: ParlAI를 활용한 챗봇 제작 스터디 -- (0) ParlAI가 무엇인지 알아보기
category: Development
date: "2020-07-20"
---

![parlai logo](https://parl.ai/docs/_static/img/parlai.png)

<iframe width="560" height="315" src="https://www.youtube.com/embed/rw2D82M9bBI" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

> 떠오르는 대로 막 적은 포스트입니다.

## ParlAI란?

[ParlAI](https://parl.ai)는 Facebook에서 만든 챗봇 개발용 프레임워크이다.
챗봇 개발에 필요한 대부분의 기능 및 환경을 제공하는데, 현재 개발이 활발히 진행되고 있는 프레임워크라 앞으로의 성장 가능성이 높아 보인다.
머지않아 챗봇 개발을 할 때 Pytorch나 Tensorflow마냥 일단 깔고 보는 라이브러리가 될 수도 있을 것 같다.
다만 워낙 개발이 활발하다 보니 Docs를 보다가도 계속 새로고침을 해 줘야 최신 내용이 반영된 결과를 볼 수 있다.
이 글도 업데이트를 계속 해줘야 될 것 같은데, 솔직히 귀찮아서 할 것 같지는 않다.

나는 처음에 Pytorch를 접근하는 느낌으로 ParlAI를 접근하려고 했다가 굉장히 애먹었다.
전체적인 프레임워크의 스타일이 _Pythonic_ 하다기 보다는 깐깐한 _OOP_ 느낌이다.
(사실 파이써닉한게 뭔지 잘 모름)

<!-- more -->

다른 사람들은 모르겠지만 나는 프론트를 좀 했었다 보니 좀 상호작용할 수 있는 채팅으로부터 Top-down으로 프레임워크를 이해하는 게 마음에 들어서,
ParlAI Docs에 있는 Using Chat Services부터 정리를 시작해 보려고 한다. (쓰고 보니 이 파트는 다음 포스트부터 다룰 것 같다)

먼저 [Intro to ParlAI](https://parl.ai/docs/tutorial_basic.html)를 보면서 ParlAI에 어떤 개념이 있는지부터 보고 시작하자.

## Core Concepts

일단 다음의 4가지 코어 콘셉트가 있다. 기본적으론 이렇고, 하려는 Task나 프로젝트에 따라서 개념이 더 추가될 수 있는 것 같다.

- Agents
- Messages
- Teachers
- Worlds

### Agents

에이전트는 ParlAI에서 대화를 나누는 무언가이다. 봇이거나, 사람일 수도 있다.
뉴럴 넷을 트레이닝시켜서 에이전트로 만들 수도 있고, 데이터셋을 읽게 시킬 수도 있고, 사람한테 말을 하라고 시킬 수도 있고,
아무튼간에 메시지를 보내거나 상호작용을 할 수만 있으면 전부 다 에이전트...라고 보면 될 것 같다.

에이전트를 구현할 때는 필수적으로 두 개의 method를 구현해 주어야 한다.

첫 번째는 `observe(self, observation)`인데, 다른 에이전트의 action의 결과를 observation으로 받아 agent의 내부 state를 업데이트하는 역할을 한다.  
두 번째는 `act(self)`로, 에이전트가 취할 action을 정한다. 만약 데이터셋을 읽어주는 에이전트라면, 이 에이전트의 act 함수는 다음 example batch를 보여주는 역할을 할 수 있을 것이고, 만약 뉴럴넷 에이전트라면 act함수에서 트레이닝을 하거나 evaluation을 할 수도 있을 것이다.

### Messages

메시지는 말 그대로 메시지다. 메시지는 agent의 observe function에 전달되고, 또한 act function으로부터 반환된다.
기본적으로 파이썬의 딕셔너리 구조를 가지고 있고, agent끼리의 커뮤니케이션에 사용된다.

메시지에는 보통 text랑 speaker의 id가 들어가고, 한 episode가 끝났다는 것을 알려주는 인디케이터가 들어갈 수도 있고,
supervised 학습을 위해 label이 들어갈 수도 있으며, 강화학습을 위한 reward가 들어갈 수도 있다. 아무튼 대화의 목적에 따라 들어가는 건 마음대로다.
Image description task라면 이미지를 같이 첨부할 수도 있다.

### Teachers

Teacher는 조금 특별한 에이전트이다. `act`와 `observe` 함수를 구현해야 하는 것은 동일하지만, `report`함수를 추가적으로 구현하여야 하며,
이 함수는 현재 상황에 대한 트래킹이 가능하도록 도운다. 예를 들어, 몇 번의 질문을 했는지, 그리고 그 중 몇 번을 올바르게 답했는지를 반환할 수 있다.
Dataset과 Task는 이 Teacher의 subclasss를 구현하여, 필요한 데이터를 다운로드하거나, 읽거나, 일부를 보여줄 수 있게 한다.

### Worlds

World는 에이전트들이 상호 작용하는 환경이다. World 구현에는 `parley` 함수가 필수적이다(ParlAI의 발음; 프랑스어로 대화? 라는 뜻이라고 한다).
`parley` 함수에는 한 번의 상호작용을 정의해 주어야 한다. 예를 들어, `DialogPartnerWorld`라는 task는 teacher와 student 에이전트의 대화로 이루어지는데,
이 경우의 parley 함수는 다음과 같다:

```python
query = teacher.act() # teacher가 act한 결과(메시지)를 받아옴
student.observe(query) # student가 teacher의 메시지를 관찰함: student의 내부 state가 변함
reply = student.act() # student가 바뀐 inner state를 바탕으로 답변을 보냄
teacher.observe(reply) # teacher가 student의 답변을 관찰하고 내부 state를 변화시킴
```

### Advanced Worlds

이 부분은 공부를 하면서 업데이트해야할 부분인데, 월드의 확장 개념을 만듦으로써 더 다채로운 Task를 만들 수 있는 것 같다.
이 분류에 속하는지는 모르겠지만, [3개의 separate task들을 OnboardWorld를 이용하여 연결한 코드](https://github.com/facebookresearch/ParlAI/blob/master/parlai/chat_service/tasks/overworld_demo/worlds.py)가 있는데, 복잡한 task를 만들 때 참고하기 좋은 개념인 것 같다.

다음 포스트부터는 위에서 언급한 기본적인 채팅 서비스 구현을 따라가 보면서, 최종적으로 나만의 새로운 Task를 만들어 보려고 한다.

<!--
* World
  * OnboardWorld
    World가 본격적으로 시작되기 전 호출할 수 있는 World.
* Agent
* Task
  * Teacher
* Project

3개의 separate task들을 overworld를 이용하여 연결한 코드 -- [Overworld Demo](https://github.com/facebookresearch/ParlAI/blob/master/parlai/chat_service/tasks/overworld_demo/worlds.py)
>
