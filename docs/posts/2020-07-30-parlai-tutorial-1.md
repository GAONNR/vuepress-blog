---
layout: post
title: ParlAI를 활용한 챗봇 제작 스터디 -- (1) 채팅 서비스가 어떻게 돌아가는지 알아보기
category: Natural Language Processing
date: "2020-07-20"
---

![parlai logo](https://parl.ai/docs/_static/img/parlai.png)

<iframe width="560" height="315" src="https://www.youtube.com/embed/rrI7tOhoVzA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

먼저 [ParlAI](https://github.com/facebookresearch/ParlAI)를 깃허브에서 클론하자. 해당 폴더의 [parlai/chat_service/tasks/overworld_demo](https://github.com/facebookresearch/ParlAI/blob/master/parlai/chat_service/tasks/overworld_demo/) 폴더를 들어가면 세 파일이 있는 걸 볼 수 있다.

`__init__.py`는 패키지 인식용 파일이므로 신경쓸 필요 없고, `config.yml`은 run할 때의 parameter를 묶어 놓은 파일이라고 생각하면 된다.
여기서 우리가 집중적으로 볼 건 `worlds.py`이다.

<!-- more -->

`worlds.py`를 보면, 맨 밑의 Overworld를 제외하면 세 개의 (OnboardWorld - World) 쌍이 짜여져 있음을 볼 수 있다.
Echo, OnboardData, Chat 이 세가지이다. 지금부터는 이 세 가지의 코드를 보면서, 이 코드가 어떻게 동작할지 예상해 볼 것이다.

## Echo

먼저 `MessengerEchoOnboardWorld` 클래스를 보자. 이 클래스는 밑의 `MessengerEchoTaskWorld`가 본격적으로 구동되기 전에 실행되는
일종의 작은 world이다.
이 `worlds.py` 안에 실행 순서를 지정해 주는 그런 스크립트는 없지만,
`config.yml`을 보면

```yml
tasks:
  echo: # must be the name returned by the overworld
    onboard_world: MessengerEchoOnboardWorld
    task_world: MessengerEchoTaskWorld
    timeout: 180
    agents_required: 1
# ...
task_name: overworld_demo
world_module: parlai.chat_service.tasks.overworld_demo.worlds
overworld: MessengerOverworld
```

이렇게 선언이 되어 있음을 알 수 있다.
overworld로 지정된 world의 parley 함수에서 `config.yml`에 지정된 task명을 반환하면,
ParlAI의 chat service core 함수들이 자동으로 해당 task의 onboard world를 수행하고, 그 이후 task world를 수행하는 식이다.

본래 내용으로 돌아와서, `MessengerEchoOnboardWorld`는 다음과 같이 구현되어 있다.

```python
class MessengerEchoOnboardWorld(OnboardWorld):
    """
    Example messenger onboarding world for Echo task, displays.

    onboarding worlds that only exist to send an introduction message.
    """

    @staticmethod
    def generate_world(opt, agents):
        return MessengerEchoOnboardWorld(opt=opt, agent=agents[0])

    def parley(self):
        self.agent.observe(
            {
                'id': 'Onboarding',
                'text': 'Welcome to the onboarding world for our echo bot. '
                'The next message you send will be echoed. Use [DONE] '
                'to finish the chat.',
            }
        )
        self.episodeDone = True
```

`generate_world` 함수는 `MessengerEchoTaskWorld`를 이야기할 때 다시 이야기하겠다.
`parley` 함수는 [이전 게시글](../2020-07-20-parlai-tutorial-0.html)에서 이야기한 대로
agent 간의 한 번의 상호작용을 정의한다.

보이는 바와 같이, agent(사람)에게 간단한 안내를 관찰시킨(보여준) 이후, episode가 끝났음을 알림으로써 해당 OnboardWorld의 역할은 종료된다.
일방적인 공지사항 전달이므로, agent의 act를 요구하지 않는다.

이제 그 밑에 있는 TaskWorld를 보도록 하자.

```python
class MessengerEchoTaskWorld(World):
    """
    Example one person world that uses only user input.
    """

    MAX_AGENTS = 1

    def __init__(self, opt, agent):
        self.agent = agent
        self.episodeDone = False

    @staticmethod
    def generate_world(opt, agents):
        return MessengerEchoTaskWorld(opt, agents[0])
```

`generate_world`부분부터 보는 것이 이해가 빠를 것 같다. 이 함수는 코어 함수로부터 opt, agents를 전달받아서
생성자(`__init__`)이 제대로 작동할 수 있게 전달해 주는 역할을 한다.
즉, 외부에서 새로운 MessengerEchoTaskWorld 객체를 만들 때, `MessengerEchoTaskWorld(parsed_arguments)`를
호출하는 것이 아니라, `MessengerEchoTaskWorld.generate_world(raw_arguments)`를 호출하여, argument 파싱의 자율성을 주었다고 보면 되겠다.
지금은 agent가 어차피 하나라서, agents의 첫 번째 원소를 `self.agent`에 등록하는 모습이다.

지금은 별로 의미가 없는 함수지만,
[parlai/chat_service/tasks/chatbot](https://github.com/facebookresearch/ParlAI/blob/master/parlai/chat_service/tasks/chatbot/)의 경우,

```python
class MessengerEchoTaskWorld(World):
# ...
    def __init__(self, opt, agent, bot):
        self.agent = agent
        self.episodeDone = False
        self.model = bot
        self.first_time = True

    @staticmethod
    def generate_world(opt, agents):
        if opt['models'] is None:
            raise RuntimeError("Model must be specified")
        return MessengerBotChatTaskWorld(
            opt,
            agents[0],
            create_agent_from_shared(
                opt['shared_bot_params'][MessengerBotChatTaskWorld.MODEL_KEY]
            ),
        )
```

이렇게 argument에서 model과 agent를 뽑아서 `__init__`함수에 올바르게 들어갈 수 있도록 하고 있다.

돌아와서, 이 `MessengerEchoTaskWorld`의 `parley` 함수는 다음과 같다:

```python
    def parley(self):
        a = self.agent.act()
        if a is not None:
            if '[DONE]' in a['text']:
                self.episodeDone = True
            else:
                a['id'] = 'World'
                self.agent.observe(a)
```

에이전트가 act하면(말하면), 그 메시지를 `a`라는 변수에 담는다.
만약 `a`의 텍스트에 `'[DONE]'`이 포함되어 있다면, 해당 World는 끝난다.
그게 아니라면, 받은 메시지 `a`를 그대로 agent에게 돌려준다.
이런 식으로 world 자체에 코드를 삽입하는 것으로, 간단히 에코 챗봇을 만들 수 있다.

ParlAI documentation에 따르면, 해당 챗봇은 이런 식으로 동작한다고 한다.

![ParlAI EchoBot](https://parl.ai/docs/_static/img/messenger-example.png)

## OnboardData

이번 task는 Onboard World에서 사용자로부터 데이터를 입력받아, 해당 데이터를 World에 전달하여 이용할 수 있도록 하는 task이다.
먼저 OnboardWorld를 보자.

```python
class MessengerOnboardDataOnboardWorld(OnboardWorld):
    """
    Example messenger onboarding that collects and returns data for use in the real task
    world.
    """

    def __init__(self, opt, agent):
        self.agent = agent
        self.episodeDone = False
        self.turn = 0
        self.data = {}
# ...
```

`agent`, `episodeDone`, `turn`, `data`가 추가된 것을 볼 수 있다.  
이어서,

```python
# ...
    def parley(self):
        if self.turn == 0:
            self.agent.observe(
                {
                    'id': 'Onboarding',
                    'text': 'Welcome to the onboarding world the onboarding '
                    'data demo.\nEnter your name.',
                }
            )
            a = self.agent.act()
            while a is None:
                a = self.agent.act()
            self.data['name'] = a['text']
            self.turn = self.turn + 1
        elif self.turn == 1:
            self.agent.observe(
                {'id': 'Onboarding', 'text': '\nEnter your favorite color.'}
            )
            a = self.agent.act()
            while a is None:
                a = self.agent.act()
            self.data['color'] = a['text']
            self.episodeDone = True
```

먼저 agent의 이름을 입력하기를 요구한다.
이름을 입력받았다는 생각이 들면, `self.data['name']`을 텍스트로 한다.
이후 턴을 증가시키고, 턴이 증가되면 좋아하는 색깔을 입력받는다.
마찬가지로 data의 color를 변화시키고, `episodeDone`을 참으로 하여 OnboardWorld를 끝낸다.

그렇다면 이 데이터를 어떻게 World에 전달할까? 놀랍게도 ParlAI가 알아서 해준다. 이제 World를 보자.

```python
class MessengerOnboardDataTaskWorld(World):
# ...
    def parley(self):
        name = self.agent.onboard_data['name']
        color = self.agent.onboard_data['color']
        self.agent.observe(
            {
                'id': 'World',
                'text': 'During onboarding, you said your name was {} and your '
                'favorite color was {}'.format(name, color),
            }
        )
        self.episodeDone = True
```

이런 식으로, `self.agent.onboard_data`안에 데이터가 저장된다.

## Chat

```yml
chat: # must be the name returned by the overworld
  onboard_world: MessengerChatOnboardWorld
  task_world: MessengerChatTaskWorld
  timeout: 180
  agents_required: 2
```

`config.yml`에 적힌 대로, 이번 task에는 에이전트가 두 개가 필요하다.

```python
class MessengerChatOnboardWorld(OnboardWorld):
    """
    Example messenger onboarding world for chat task, displays intro and explains
    instructions.
    """

    def __init__(self, opt, agent):
        self.agent = agent
        self.episodeDone = False
        self.turn = 0
        self.data = {}
# ...
    def parley(self):
        if self.turn == 0:
            self.agent.observe(
                {
                    'id': 'Onboarding',
                    'text': 'Welcome to the onboarding world free chat. '
                    'Enter your display name.',
                }
            )
            a = self.agent.act()
            while a is None:
                a = self.agent.act()
            self.data['user_name'] = a['text']
            self.turn = self.turn + 1
        elif self.turn == 1:
            self.agent.observe(
                {
                    'id': 'Onboarding',
                    'text': 'You will be matched with a random person. Say [DONE] '
                    'to end the chat.',
                }
            )
            self.episodeDone = True
```

기본적인 OnboardWorld의 구조는 앞선 task와 같다. 채팅을 위해 유저의 이름을 입력받는다.
그 이후,

```python
class MessengerChatTaskWorld(World):
    """
    Example one person world that lets two users chat.
    """

    MAX_AGENTS = 2

    def __init__(self, opt, agents):
        self.agents = agents
        self.episodeDone = False
# ...
    def parley(self):
            for x in [0, 1]:
                a = self.agents[x].act()
                if a is not None:
                    if '[DONE]' in a['text']:
                        self.agents[x - 1].observe(
                            {'id': 'World', 'text': 'The other agent has ended the chat.'}
                        )
                        self.episodeDone = True
                    else:
                        self.agents[x - 1].observe(a)
# ...
```

이전까지의 World와 다르게, `agent` 대신 `agents`를 생성자에서 받고 (에이전트가 두 개이므로)
각각의 agent가 다른 agent의 대화를 관찰하게 한다.

마지막으로 남은 Overworld의 구조는 이 포스트에서는 살펴보지 않을 예정인데,
기본적으로 parely함수에서 task 이름을 반환한다는 것만 제외하면 다른 것과 다를 바가 크게 없다.

지금까지 본 파일을 테스트해 보려면, `parlai/chat_service/services/messenger`로 들어가

```bash
python run.py --config-path ../../tasks/chatbot/config.yml
```

의 명령어를 입력해보면 테스트가 가능하다.

다음에는 echo bot을 직접 구현해 보려고 하는데, 이번처럼 World에서 자체적으로 echo를 하는 것이 아닌
echo agent를 추가해서 두 agent 간의 대화가 가능한 형식으로 해 보려고 한다.
