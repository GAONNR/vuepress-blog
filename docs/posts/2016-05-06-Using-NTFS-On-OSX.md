---
layout: post
title: OS X에서 NTFS 사용하기 - OSXfuse, ntfs-3g
category: Setting
date: "2016-05-06"
---

OS X는 공식적으로 NTFS를 지원하지 않는다. 그러나 시중에 나와있는 외장
하드디스크들은 대부분 NTFS 포맷이므로, 대용량 자료들을 복사하기 위해서는 NTFS
지원이 필요한 것이 사실이다. 본인은 최근까지
[Mounty](http://enjoygineering.com/mounty/)라는 3rd-party 프로그램을 사용하고
있었으나, 매번 하드디스크를 연결할 때마다 Notification Popup이 떠서 번거롭기도
했고, 몇 번 하드디스크에 에러를 발생시키기도 해서 다른 프로그램을 찾던 도중,
OSXfuse와 ntfs-3g를 사용하여 NTFS로 디스크를 자동으로 mount하는 법을 발견하여
시도해 보기로 했다. 비록 초기 설정은 Mounty에 비해 번거롭고, Command Line을
사용하여 복잡해 보일 수도 있지만, 설정만 끝내면 그 이후론 별로 신경을 쓰지
않아도 되어서 깔끔하니 좋은 것 같다.

먼저 homebrew가 깔려 있다는 가정 하에 설명을 진행하겠다. 만약 homebrew가
깔려있지 않다면, 적절한 검색을 통해 찾아보길 권한다.

<!-- more -->

우선 다음 링크에서 [OSXfuse](https://github.com/osxfuse/osxfuse/releases)를
다운로드 받아 설치하자.

![](/images/Using_NTFS_on_OSX/01.png)

링크를 타고 들어가서, 조금 스크롤을 내리면 보이는 Downloads 항목에서
osxfuse-3.2.0.dmg 파일을 다운로드 받아 설치하면 된다.

이후 터미널을 켜고 다음과 같은 명령어를 입력하여 homebrew를 설치하자.

```
brew install homebrew/fuse/ntfs-3g
```

설치가 끝나면, 외장 하드디스크가 연결되었을 때 자동으로 mount하도록 설정을
해줘야 하는데, El Capitan 이후로는 시스템의 일부 영역이 Root라고 할지라도 수정을
할 수 없게 막혀 있다. 따라서 [이 포스트](http://macnews.tistory.com/3408)를
참고하여 Rootless를 해제하자. 부팅할 때 Cmd + R을 꾹 누르고 있으면 Recovery
모드로 진입하며, 상단의 메뉴 막대에서 유틸리티 - 터미널을 선택하고, 다음
명령어를 입력한다.

```
csrutil disable --without debug
```

이제 Rootless의 해제가 완료되었다. 다시 정상적으로 부팅한 후 터미널을 켜서
다음의 두 줄을 입력하자.

```
sudo mv /sbin/mount_ntfs /sbin/mount_ntfs.original
sudo ln -s /usr/local/sbin/mount_ntfs /sbin/mount_ntfs
```

이후 컴퓨터를 재부팅한 후 외장 하드디스크를 연결해 보면, 자동으로 NTFS로
mount되어 쓰기가 가능해진 것을 확인할 수 있다.

![](/images/Using_NTFS_on_OSX/02.png)

_이 포스트의 내용은 <a href="http://www.howtogeek.com/236055/how-to-write-to-ntfs-drives-on-a-mac/">이 링크</a>에서 일부를 참고하여 작성되었습니다._
