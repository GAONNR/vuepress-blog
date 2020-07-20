---
layout: post
title: vimrc 설정하기 - 기본 설정 및 Plugin
category: Development
date: "2016-03-15"
---

동아리에서 새로 판 서버에다 지금까지 로컬에서 썼던 `.vimrc`파일을 옮기려다가 mv대신 rm을 써서 날려먹었다.

어디 백업해 놓은 것도 없었기 때문에 어쩔 수 없이 새로 작성하는 겸, 내가 사용하는 설정을 정리해서 올리기로 했다.

_이 글은 OS X (El Capitan) 기준으로 작성되었습니다._

먼저 root폴더에다 (일반적으로, 터미널을 켜면 바로 나오는 폴더이다) `.vimrc` 파일을 생성하자. `vim .vimrc` 명령어로 쉽게 생성할 수 있다.
그 후 원하는 세팅을 적은 다음 저장하면, vim에 즉각 반영된다.

<!-- more -->

우선 기본 세팅들. 각 세팅들이 무슨 역할을 하는지는 옆의 주석을 통해 알 수 있다.

    set hlsearch " 검색어 하이라이팅
    set nu " 줄번호
    set autoindent " 자동 들여쓰기
    set scrolloff=2
    set wildmode=longest,list
    set ts=4 "tag select
    set sts=4 "st select
    set sw=1 " 스크롤바 너비
    set autowrite " 다른 파일로 넘어갈 때 자동 저장
    set autoread " 작업 중인 파일 외부에서 변경됬을 경우 자동으로 불러옴
    set cindent " C언어 자동 들여쓰기
    set bs=eol,start,indent
    set history=256
    set laststatus=2 " 상태바 표시 항상
    "set paste " 붙여넣기 계단현상 없애기
    set shiftwidth=4 " 자동 들여쓰기 너비 설정
    set showmatch " 일치하는 괄호 하이라이팅
    set smartcase " 검색시 대소문자 구별
    set smarttab
    set smartindent
    set softtabstop=4
    set tabstop=4
    set ruler " 현재 커서 위치 표시
    set incsearch
    set statusline=\ %<%l:%v\ [%P]%=%a\ %h%m%r\ %F\
    " 마지막으로 수정된 곳에 커서를 위치함
    au BufReadPost *
    \ if line("'\"") > 0 && line("'\"") <= line("$") |
    \ exe "norm g`\"" |
    \ endif
    " 파일 인코딩을 한국어로
    if $LANG[0]=='k' && $LANG[1]=='o'
      set fileencoding=korea
    endif
    " 구문 강조 사용
    if has("syntax")
      syntax on
    endif
    " 컬러 스킴 사용
    colorscheme Tomorrow-Night-Eighties

_위 세팅들은 구글 검색을 통해 <a href="https://medium.com/sunhyoups-story/vim-%EC%97%90%EB%94%94%ED%84%B0-%EC%9D%B4%EC%81%98%EA%B2%8C-%EC%82%AC%EC%9A%A9%ED%95%98%EA%B8%B0-5b6b8d546017#.sg39ixinw">이선협 님의 블로그</a>에서 가져온 것입니다._

vim의 colorscheme은 [이곳](http://cocopon.me/app/vim-color-gallery/)에서 내려받을 수 있다. 마음의 드는 테마를 내려받아 `.vim/colors` 폴더에 복사하자. vimrc에서 설정할 colorscheme의 이름을 입력하면 된다. 본인은 Tomorrow-Night-Eighties colorscheme을 사용중이다.
set paste의 경우 주석처리가 되어 있는데, set paste를 활성화하면 자동 들여쓰기가 안 되는 경우가 생기니 유의해서 주석을 해제해 사용하도록 하자.

이후에는 vim을 다른 화려한 IDE나 Text Editor 못지않게 만들어 줄 수 있는 여러 플러그인을 설치할 수 있다.
vim의 플러그인은 Vundle을 통해 관리된다. 터미널에 다음의 코드를 입력해서 Vundle을 설치하자.

    git clone https://github.com/gmarik/Vundle.vim.git ~/.vim/bundle/Vundle.vim

OS X 유저이고, XCode를 설치한 상태라면 git이 설치되어 있을 것이다. 만약 git이 설치되어 있지 않다고 뜨면 앱스토어에서 XCode를 설치해주자.
그 후, 아래의 코드를 vimrc 파일에 붙여넣는다.

    set nocompatible
    filetype off
    set rtp+=~/.vim/bundle/Vundle.vim
    call vundle#begin()
      Plugin 'gmarik/Vundle.vim' "required
      Plugin 'tpope/vim-fugitive' "required
      Plugin 'scrooloose/nerdtree'
      Plugin 'AutoComplPop'
    call vundle#end()
    filetype plugin indent on " Put your non-Plugin stuff after this line

_위 코드는 <a href="http://seohakim.blogspot.kr/2015/02/mac-vim.html">Seoha Kim 님의 블로그</a>에서 일부를 참조하였습니다._

여기서 , `call vundle#begin`과 `call vundle#end`사이의 공간에 원하는 플러그인을 입력하고 설치하면 된다. 다만, Vundle.vim과 vim-fugitive는 필수적인 플러그인이므로 건드리지 말자.
입력한 플러그인을 설치하기 위해서는,

    :w
    :source %
    :PluginInstall

을 vim에 차례로 입력해줘야 한다.

위에서 보이다시피 내가 설치한 Plugin은 우선적으로 두 가지로, NERDTree라는 파일 탐색기 플러그인과, AutoComplPop이라는 자동완성 단어를 팝업으로 띄워 보여주는 플러그인이다. NERDTree는 :NERDTree를 입력하면 실행되며, vimrc 수정을 통해 단축키를 지정할 수 있다. AutoComplPop은 여타 텍스트 에디터처럼, 코딩 중에 단어를 입력하면 추천하는 자동완성을 작은 팝업으로 보여준다.

이때 NERDTree의 경우 vim을 실행할 때마다 :NERDTree를 입력하거나 단축키를 눌러 줘야 실행되는 번거로움이 있는데, vim의 function과 autocmd 기능을 이용해 vim을 실행하면 NERDTree가 자동으로 켜지게끔 만들 수 있다.

vimrc에 다음과 같은 코드를 입력하자.

    function! StartUp()
      NERDTree
      wincmd p
    endfunction

    autocmd VimEnter * call StartUp()

autocmd는 vim이 실행되면 StartUp함수를 호출하여 안에 적힌 내용을 실행한다. NERDTree를 먼저 입력하여 NERDTree를 실행하며, wincmd p를 입력하여 커서를 NERDTree에서 vim으로 전환한다. 다시 NERDTree로 커서를 이동시키고 싶다면 vim에 다시금 :wincmd p를 입력하면 된다.

여기까지 정리한 vimrc 파일은 본인의 [Github](https://github.com/GAONNR/Dotfiles)에 올려 두었다. 본 글에서는 두 개의 플러그인만 소개하였으나, 다른 유용한 플러그인들이 많으므로 별도로 검색하고 이용해 보길 권한다.
