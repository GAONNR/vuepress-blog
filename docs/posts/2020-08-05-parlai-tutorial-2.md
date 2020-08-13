---
layout: post
title: ParlAI를 활용한 챗봇 제작 스터디 -- (2) Echo 챗봇 짜기
category: Natural Language Processing
date: "2020-08-05"
---

> 이 글은 ParlAI 0.8.0 버전 기준으로 쓰여졌습니다. 이후 버전에서 변화되는 부분이 있을 수 있습니다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/NmJN0L2PdOk" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

이번 포스트에서는 Echo 챗봇을 구현해 볼 예정이다.
이전 포스트에서 간단한 에코 챗봇 코드를 봤지만, 그 코드의 경우 엄밀히 말하면 Agent - Agent 간 대화가 아닌
World - Agent 간 대화였기 때문에, 이번에는 한 말을 그대로 따라하는 Agent (이제부터 Echo Agent라 부르겠다)를 추가하여
코드의 확장성을 추구해 보려고 한다.

이 포스트는 ParlAI 도큐의 [Creating a New Task](https://parl.ai/docs/tutorial_task.html#creating-a-new-task-the-more-complete-way) 부분과,
[core.agents](https://parl.ai/docs/agents.html), [core.worlds](https://parl.ai/docs/worlds.html) 부분을 참고하면서 작성되었다.

<!-- more -->

새로운 Echo Task를 만들기 위해서는 parlai/tasks 경로 내에 폴더를 만들어야 한다.
(이 부분이 개인적으로 굉장히 맘에 안 드는 부분이다. 이러면 내 소스 부분만 깃으로 관리하기가 쉽지 않다)

...라고 쓰고 있다가 ParlAI Repo를 새로고침해보니 example_parlai_internal 이라는 폴더가 따로 생겼다.
`parlai_internal` 이라는 폴더를 만들어서 그 안에 커스텀 모델이나 태스크들을 집어넣어 관리할 수 있다고 한다.  
(.gitignore 파일에 parlai_internal을 추가해 놓았고, 이 안에서 새 git repo를 파던 뭐라던 하라고 한다)  
좀더 세련된 방법이 있을 수도 있을 것 같긴 한데, 일단은 이걸로 진행해 보자. 이게 다 ParlAI가 너무 현재진행형인 프로젝트라서 생긴 일이다.

그러니 일단 parlai_internal 폴더를 만들기로 하자. ParlAI를 클론한 폴더에 `parlai_internal` 폴더를 만들고,
안에 `__init__.py`를 만든다. (빈 파일이어도 좋다)

이후, 안에 `agents`와 `tasks`폴더를 만들고 마찬가지로 `__init__.py`를 넣어 둔다. (그래야 parlai가 찾을 수 있다)  
앞으로 만드는 모든 폴더 안에는 인식을 위해 `__init__.py`를 만들어야 함을 명심하자.

`tasks` 폴더 안에는 `echobot`이란 이름의 폴더를 만들자.

원래 data가 필요한 task의 경우에는 `build.py`를 만들어서 데이터를 다운로드하게 하는 것 같은데,
여기서 우리가 만들 건 그냥 단순한 에코 봇이므로 일단 스킵해 보자.

먼저 World를 만들어 보려고 하는데, 사실 API를 보면 우리에게 필요한 World가 있다....
`DialogPartnerWorld`라는 친구인데, [코드](https://github.com/facebookresearch/ParlAI/blob/a7c600ed674d7a6021ea6244b5d09814d2e05093/parlai/core/worlds.py#L309-L430)를 보면

> Simple world for two agents communicating synchronously.

라고 되어 있다. 하지만 이걸 쓰면 좀 날로 먹는 것 같기도 하고 어차피 튜토리얼이니까 구현을 처음부터 해 보자.  
먼저 task 폴더 안에 `worlds.py` 파일을 만들고 World를 임포트하자. 그리고 `EchoBotWorld` 클래스를 정의해 주자.

```python
from parlai.core.worlds import World

class EchoBotWorld(World):
    def __init__(self, opt, agents=None):
        super().__init__(opt)
        self.agents = agents
```

World를 상속받으므로 World의 생성자를 수동으로 실행시켜 주는 것이 좋다.
여러 개의 Agent를 받으므로 self.agents에 argument로 받는 agent들의 목록을 저장한다.

이제 `parley`함수를 구현할 차례다. 그냥 단순하게, agent 0 (Human Agent)가 말하고(act), agent 1이 이를 관측한다(observe).

```python
    def parley(self):
        human = self.agents[0]
        bot = self.agents[1]

        human_act = human.act()
        bot.observe(human_act)
        bot_act = bot.act()
        human.observe(bot_act)
```

그럼 이제 `worlds.py`는 끝. 같은 폴더(task) 폴더에 `agents.py`를 만들어 준다.
이 파일에 echo agent가 들어가겠구나 싶겠지만 그건 아니다.  
echo agent는 따로 있는 agents 폴더 안에 구현할 거고, 이 파일은 다른 파일이다.
Documentation에 의하면 모든 task는 반드시 DefaultTeacher나 그를 상속하는 class가 구현된 `agents.py`가 필요하기 때문이다.

tasks/interactive 의 코드를 참조해서, 다음과 같이 입력하고 끝내자.

```python
class DefaultTeacher:
    # Dummy class.
    pass
```

이제 다시, 언급된 agents 폴더에 echo라는 이름의 폴더를 만들자. `echo.py`를 만들고, 안에 Agent를 임포트하자. (`__init__.py`는 필수)

```python
from parlai.core.agents import Agent


class EchoAgent(Agent):
    def __init__(self, opt):
        super().__init__(opt)
        self.id = self.__class__.__name__
        self.heard = None
```

이 때, Agent 이름은 반드시 (폴더 이름 + Agent)의 형식이어야 한다...고 한다.
이후, Agent에 필수적인 observe 함수와 act 함수를 구현하자.

```python
    def observe(self, observation):
        self.heard = observation['text']
        return observation

    def act(self):
        return {
            'id': self.id,
            'text': self.heard
        }
```

observe 함수에서는 observation의 text를 따와 `self.heard`에 저장하고,
act 함수에서는 저장한 self.heard를 그대로 메시지로서 되돌려준다.

이제 에코 봇을 다 짰다! 남은 건 실행하는 일 뿐이다.

먼저, ParlAI 폴더로 가서 `pip install .`을 입력해 주자. 실험 결과, 어떤 변동 사항이 있을 때마다 번거롭지만 이 작업을 해줘야 하는 것 같다.

우리의 agent와 task를 시험해 보기 위해, parlai의 interactive script를 실행하자.

```bash
parlai interactive -t internal:echobot -m internal:echo
```

이 명령어는 tasks 폴더의 echobot을 task로써 삼고, agents 폴더의 echo를 모델로서 삼겠다는 뜻이다.
이제 다음과 같은 멋진 화면을 볼 수 있다.

![Echobot Screeshot](/images/parlai-tutorial/echobot.png)

([DONE]을 입력하면 꺼진다고 나오지만, 사실 그 부분을 구현을 하지 않았기 때문에 에러가 난다. 웬만하면 Ctrl+C로 종료시켜 주자.)

오늘 포스트와 함께 진행한 코드는 https://github.com/GAONNR/ParlAI-tutorial 에 올려두었으니 (미래의 내가) 잘 참고하면 좋겠다.

_솔직히 글을 쓰면서도 이게 될까 긴가민가 했는데 진짜로 이게 돼서 굉장히 기분이 좋다._ 이 정도까지 했으니 이제 응용만 남았다.
다음 포스트부터는 내가 직접 딥 러닝이 필요한 Task와 함께 TorchAgent를 작성해서, 조금 더 스마트한 챗봇을 짜 보려고 한다.
