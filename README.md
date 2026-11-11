# StoryWeaver

React + Vite로 만든 한국어 이야기 책장 PWA입니다.

## 실행

```sh
npm install
cp .env.example .env.local
npm run dev
```

`.env.local`에 Firebase 웹 앱 설정을 입력하세요. Vite는 빌드 시 환경변수를 포함하므로 배포 환경에서 설정한 후 다시 빌드해야 합니다. 관리자 SDK 비밀 키는 사용하지 않습니다.

## Google 로그인

1. Firebase Console → Authentication → Sign-in method에서 Google을 활성화합니다.
2. Authentication → Settings → Authorized domains에 서비스 도메인을 추가합니다. 로컬 개발 시 `localhost`도 등록합니다.
3. `.env.example`의 `VITE_FIREBASE_*` 값을 설정합니다.

로그인은 Firebase Authentication을 사용합니다. 책과 이미지는 IndexedDB에 먼저 저장되고, 로그인 상태에서는 Cloud Firestore의 계정 전용 경로에 동기화됩니다. 로그인하면 이 기기의 게스트 책도 계정 서재에 합칩니다. **다른 기기에서 보려면 원래 작성한 기기에서 로그인하고 ‘계정 동기화 완료’를 확인해야 합니다.** 서버 연결 또는 보안 규칙 오류 시 ‘기기 저장 · 동기화 실패’로 표시하며, 저장이 서버에 완료된 것처럼 표시하지 않습니다. 책 내보내기로 JSON 백업도 다운로드할 수 있습니다.

## 사용

- 새 책 만들기 → 제목, 표지 색상, 선택적 스타일 참고 이미지 → 1 또는 2페이지 → 집필
- 편집 화면의 ‘이 장면 → 단면 / 펼침’으로 장면마다 판형을 정합니다. 단면은 182 × 254mm (182:254), 펼침은 358 × 254mm (358:254)입니다. 펼침도 분리된 두 페이지가 아닌 넓은 한 장의 캔버스입니다.
- 단면에서는 왼쪽·오른쪽에 각각 이미지를 넣습니다. ‘이미지 2장 업로드’로 두 파일을 동시에 선택하면 선택 순서대로 왼쪽·오른쪽에 배치합니다. 각 이미지 아래에 설명을 입력합니다.
- 펼침에서는 이미지 한 장이 좌우 면 전체를 차지하고, 그 아래에 설명을 입력합니다. 처음 펼침으로 바꾸면 왼쪽 이미지를 넓혀 사용합니다. 펼침용 이미지를 따로 변경할 수 있으며, 단면으로 돌아가도 좌우 이미지는 유지됩니다.
- 이미지 교체·삭제는 각 면에서 독립적으로 처리하고, 형식이 잘못된 파일이 포함된 두 장 업로드는 기존 이미지를 부분적으로 덮어쓰지 않습니다.
- 장면별 체크 버튼으로 완료 여부를 저장합니다. 완료된 장면은 dot에도 표시됩니다. 글·이미지 또는 페이지 구성을 수정하면 해당 장면을 작성 중으로 되돌립니다.
- 각 페이지에 글과 이미지를 입력하면 기기에 자동 저장되고, 로그인 계정으로 동기화합니다.
- 다음 장 추가 버튼 또는 모바일에서 화면을 왼쪽으로 밀어 계속 작성합니다.
- 서재에서 책을 누르면 집필을 이어갑니다.
- 참고 이미지는 스타일을 위한 자료이며 이미지를 자동 생성하지는 않습니다.

## 빌드와 PWA

```sh
npm run build
npm run preview
```

`dist`를 HTTPS 정적 호스팅에 배포하세요. manifest, 192/512px 앱 아이콘, 서비스 워커가 포함되어 있습니다. 최초 온라인 방문 후 캐시된 앱을 오프라인에서 사용할 수 있습니다. 브라우저가 설치 이벤트를 제공하면 상단에 설치 버튼이 표시됩니다. iOS는 Safari 공유 메뉴 → 홈 화면에 추가를 사용합니다. 오프라인에서는 Google 로그인할 수 없습니다.

## GitHub Actions 자동 배포

`main`에 push하면 `.github/workflows/deploy.yml`이 빌드하고 GitHub Pages에 배포합니다.

서비스 주소: https://sohn0356-git.github.io/StoryWeaver/

Repository Settings → Pages → Source는 **GitHub Actions**로 설정합니다. Firebase 설정은 Settings → Secrets and variables → Actions에서 `.env.example`과 같은 이름의 Repository secrets 또는 Variables로 등록합니다. `github-pages` Environment의 Secrets 또는 Variables도 지원하며 빌드와 배포 작업 모두 해당 환경을 사용합니다. 둘 다 있으면 Secrets가 우선합니다. 값을 변경한 뒤 Actions에서 배포 워크플로를 다시 실행하세요.

Firebase Authentication의 승인된 도메인에 `sohn0356-git.github.io`를 추가해야 Google 로그인이 가능합니다. Firebase 환경변수가 없으면 서재는 게스트 모드로 동작합니다.

## 모바일과 업데이트

모바일 하단 메뉴에서 내 서재, 새 이야기, 앱 설치 안내, 업데이트를 사용할 수 있습니다. 모바일도 책을 펼친 형태로 표시합니다. 단면은 182:254인 좌우 면 두 장, 펼침은 358:254인 넓은 한 장으로 표시하며 설명은 항상 이미지 아래에 둡니다. 그림과 텍스트는 항상 함께 표시되며 보기 전환 버튼은 없습니다. 이전·다음 버튼과 장면별 dot pagination은 하단에 고정됩니다. 단면·펼침 모두 스와이프하거나 이전·다음 버튼으로 장면을 넘깁니다. dot을 누르면 해당 장면으로 바로 이동합니다. 데스크톱에서는 선택한 1·2페이지 구성을 유지합니다. iOS safe area와 standalone 화면을 지원합니다.

`업데이트`는 StoryWeaver 앱 캐시와 서비스 워커만 갱신합니다. 계정별 책과 이미지가 저장된 IndexedDB는 삭제하지 않습니다. 새 서비스 워커가 적용되면 열린 화면을 새 버전으로 갱신합니다. 이전 버전의 Firebase 설정 안내가 계속 나오면 인터넷에 연결한 상태로 사이트를 다시 열어 최신 버전을 받으세요.


## Firestore 최초 설정 (필수)

Firebase Authentication 환경변수만으로는 데이터베이스가 만들어지지 않습니다.

1. [Firebase Console → Firestore Database](https://console.firebase.google.com/project/storyweaver-b896c/firestore)에서 `(default)` 데이터베이스를 생성합니다. 테스트 모드 대신 프로덕션 모드를 사용합니다.
2. Firestore의 **Rules** 탭에 저장소의 `firestore.rules` 전체 내용을 붙여넣고 **게시**합니다. 규칙은 로그인한 사용자 본인의 `/users/{uid}/books`와 하위 데이터만 허용합니다.
3. 앱에서 로그인하고 **다시 연결**을 누릅니다. 기존 책이 있는 기기에서 **계정 동기화 완료**를 확인한 뒤 다른 기기에서 같은 Google 계정으로 접속합니다.

관리 권한이 있는 로컬 환경에서는 `npx firebase-tools deploy --only firestore:rules --project storyweaver-b896c`로 규칙을 배포할 수도 있습니다. GitHub Pages 배포는 Firestore 데이터베이스 생성이나 규칙 게시를 대신하지 않습니다.

서버에는 책마다 JSON 조각을 먼저 올리고 마지막에 버전 포인터를 원자적으로 게시하여 이미지가 있어도 Firestore 문서 용량 제한을 넘지 않도록 했습니다. 서버의 이전 저장 버전은 유지합니다. 여러 기기에서 같은 책을 동시에 수정하면 `updated` 시각이 더 최신인 책이 우선합니다. 실시간 공동 편집 방식은 아닙니다.

## 검증

```sh
npm test
npx firebase-tools emulators:exec --only firestore --project demo-storyweaver 'node --test tests/cloud-emulator.test.mjs'
```

두 번째 명령은 Java 21 이상이 필요하며 실제 프로젝트 대신 로컬 에뮬레이터에서 두 클라이언트 동기화와 다른 계정의 접근 차단을 검사합니다.

## 책장 탐색과 순서

긴 제목은 표지 아래에서 전체 내용을 줄바꿈하여 표시합니다. 모바일은 한 책장에 최대 4권, 큰 화면은 최대 8권을 놓고 좌우 스와이프·화살표·dot으로 다른 책장을 탐색합니다.

책을 0.5초간 길게 누른 뒤 원하는 책 위치로 끌어 놓으면 순서가 바뀝니다. 끌면서 책장 가장자리에서 잠시 기다리면 앞뒤 책장으로 이동해 다른 책장의 책과도 순서를 바꿀 수 있습니다. 일반 탭은 책을 열고, 스와이프는 순서 변경 없이 책장만 넘깁니다. 키보드는 책에 초점을 두고 Alt+왼쪽/오른쪽 방향키로 이동할 수 있습니다.

변경된 순서는 기기에 자동 저장되고, 로그인 상태에서는 책 데이터의 `shelfOrder` 값으로 계정에도 동기화됩니다.
