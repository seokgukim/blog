---
title: "Jump to Ruby"
date: "2024-10-25"
tags: ["ruby", "development"]
---

### Ruby를 배워보자

개인적으로 도전해볼 만한 요소를 찾아, 취미로 **Ruby(언어)** 를 배우면서 알게 된 내용들을 정리하고자 합니다.

알만툴로 익숙한 RPG Maker 시리즈에서 채택하는 언어이며, 간혹 재미있는 문법이나 기능들에 대해 듣긴 하지만 하지만 실제로 써보려고 하는건 처음입니다.

### Ruby란?

[Ruby](https://www.ruby-lang.org/)(이하 **루비**)는 그 제작자 **유키히로 마츠모토(마츠)** 가 그가 좋아하던 언어들로부터 특징을 가져와 고안한 함수형, 명령형 언어입니다.

Python처럼 객체지향적인 언어이고, 자주 비교되는 면이 있습니다.

### 특징

루비의 특징을 설명하기 위해, 루비 공식 페이지로부터 몇 가지 내용들을 살펴봤습니다.

- **모든 것은 객체**

루비에서는 모든 것이 객체라고 합니다.  
이 말을 보다 구체적으로 설명하자면, 다음의 코드를 봅니다.

```rb
5.times { print "Ruby를 배워봐요! 사랑해요 루비!" }
```

대부분의 언어에서 숫자나 다른 원시 타입들은 객체로 취급되지 않는 반면에 루비의 경우 저런 식으로 프로퍼티와 메소드를 가진 객체로써 취급하고 있습니다.(신기하네...)

- **상속은 단 한번만**

정말 특이하게도, 루비에서는 클래스에 대해 단일 상속만이 제공된다고 합니다.

이를 보완하는 방법으로 모듈 개념을 도입해 특정 메소드를 **믹스인** 하는 방법으로 클래스에 추가하는 방식을 택했다고 합니다.

```rb
class MyArray
  include Enumerable
end
```

위 코드는 `MyArray` 클래스에 `Enumerable` 모듈에 포함된 함수를 추가해줍니다.

- **변수**

변수를 선언하기 위한`int` `let` 등의 키워드가 없습니다.  
파이썬처럼 그냥 쓰면 되는 모양입니다만, 관례적으로 구분을 위해서 자주 사용하는 구문은 있다고 합니다.

```rb
var #지역변수
@var #인스턴스 변수
$var #전역변수
```

그리고 자기 참조를 위한 `self.`의 경우도 대개 생략이 가능한 특징도 있습니다.

---

스크립트 언어, 객체지향이라는 점은 그냥 파이썬에 비교해도 되겠고, 모든 대상을 객체로 보는 점은 제가 써 본 언어 중에선 루아랑 비슷합니다.(거긴 테이블이지만)

간단한 특징을 알아봤으니, 깔아봅시다.

### 환경 구성

패키지 매니저가 있는 경우 간단히 설치할 수 있습니다. 본인 환경에 맞는 버전을 설치합니다.

<sub>설치 가이드 페이지 (<https://www.ruby-lang.org/en/documentation/installation/>)</sub>

설치가 되었다면, `gem install` 명령어를 이용해 젬(루비 패키지)들을 설치해줍시다.

```bash
sudo gem install ruby-debug-ide
sudo gem install debase -v0.2.5.beta2 -- --with-cflags="-Wno-incompatible-function-pointer-types"
```

설치가 완료된 후, 본인의 에디터의 디버거와 연결할 수 있습니다. 저의 경우, VS Code 디버거와 연결했습니다.

```json
{
  "name": "Ruby: Debug Local File",
  "type": "Ruby",
  "request": "launch",
  "program": "${file}",
},
```

위 내용을 `.vscode` 폴더의 `launch.json`에 추가해줍니다.

이제 디버깅을 할 수 있습니다!

환경 세팅 이후 본격적인 코드 작성은 다음에 해봅시다...

> 참고
>
> 루비 공식  
> <https://www.ruby-lang.org/ko/>  
> VS Code 통합  
> <https://code.visualstudio.com/docs/languages/ruby>
