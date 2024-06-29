#### Controller ➡️ Service ➡️ Repository  

UserService(상위모듈) 가 RepositoryService(하위모듈)에 의존하기 때문에
구현 방법 변화에 (ORM..)  상위모듈 수정 필요. 
(DIP 원칙 ⚠️ ☠️ )

#### 💡 Service ➡️ IRepository ⬅️  Repository  
" 하위모듈을 추상화 시키고, 추상화 시킨 객체를 의존하도록 변경 " 

서비스에서 필요한 Repository 를 추상 클래스로 정의 ***(IRepository)***
을 구현 -> ***Repository***
=> Service, Repository 둘다 추상 클래스에만 의존! 

" 하위모듈을 추상화 시키고, 추상화 시킨 객체를 의존하도록 변경 "  

 >효과: 상위모듈이 추상화된 하위모듈을 의존하면, 그 구현부에 상관없이 더욱 변화에 안전한 프로그램을 설계할 수 있음.



<img width="408" alt="image" src="https://github.com/piper-hyowon/nestjs-hexagonal-boilerplate/assets/158791917/c99b94fc-3aef-4413-b06a-f8c44e67883d">

#
#
#
#
#
### Hexagonal Architecture
##### ==  Ports and Adapters Architecture
1. Domain
2. Port
3. Adapter

### port
= contracts (usecase)
### adapter
 **bridge**  between the core application and the external concerns(APIs, DBs, UI..). 
#

- 주된 아이디어: 비즈니스 코드를 기술 코드로부터 분리
- + 기술측면이 비즈니스 측면에 의존하는지 확인
1. 비즈니스 측면이 비즈니스 목표를 달성하는데 사용하는 기술에 대한 우려 없이도 발전할 수 있도록 해야한다.
2. 비즈니스 코드에 피해를 주지 않고도 기술 코드를 변경할 수 있어야 한다.

#
├── ***domain***


│   ├── 도메인 모델


│   └── Enums...


├── ***port***


│   ├── IRepository


│   └── Service



├── ***adapter***


│   └── persistence (IRepository 를 구현)


│         └──── orm


 │   └── presenter


│         └──── http (controller)




![image](https://github.com/piper-hyowon/nestjs-hexagonal-boilerplate/assets/158791917/075e4aea-6a62-425f-8eb4-f89fd1c33fe3)

![image](https://github.com/piper-hyowon/nestjs-hexagonal-boilerplate/assets/158791917/07a5c952-96da-4570-9686-e09e5c6a1446)

(이미지 출처: https://www.linkedin.com/pulse/layered-architecture-vs-hexagonal-ahmed-al-sharu-jy3ef)


## Running the app

```bash
# development
$ docker-compose up -d
$ npm run start:local
```


## API Docuentation
- Swagger (http://localhost:8000/documentation)


#### 헥사고날 아키텍처를 채택한 기업들>
- 애드옌(Adyen)
- 알리바바(Alibaba)
- 넷플릭스(Netflix):
- 페이팔(PayPal)
- 라인
- 우아한형제들


#### Links
잘 설명: 
https://kisztof.medium.com/hexagonal-architecture-with-nest-js-and-typescript-f181cc7b6452
https://labyu.me/%ED%97%A5%EC%82%AC%EA%B3%A0%EB%82%A0-%EC%95%84%ED%82%A4%ED%85%8D%EC%B3%90-266e65342154
https://engineering.linecorp.com/ko/blog/port-and-adapter-architecture?source=post_page-----266e65342154--------------------------------

https://justwrite99.medium.com/%ED%81%B4%EB%A6%B0-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%ED%8C%8C%ED%8A%B81-%EB%8D%B0%EC%9D%B4%ED%84%B0%EB%B2%A0%EC%9D%B4%EC%8A%A4-vs-%EB%8F%84%EB%A9%94%EC%9D%B8-236c7008ac83

--

https://awesome-nestjs.com/resources/boilerplate.html
