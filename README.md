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

로그인은 Firebase Authentication을 사용합니다. 책과 이미지의 저장은 계정별 IndexedDB로 **현재 브라우저에만** 보관합니다. 기기 간 동기화는 구현하지 않았습니다. 로그인 전 게스트 서재와 로그인 계정의 서재는 분리됩니다. 책의 내보내기로 JSON 백업을 다운로드할 수 있습니다.

## 사용

- 새 책 만들기 → 제목, 표지 색상, 선택적 스타일 참고 이미지 → 1 또는 2페이지 → 집필
- 각 페이지에 글과 이미지를 입력하면 자동 저장됩니다.
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
