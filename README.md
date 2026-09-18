# Bamsanchaeg

> Markdown으로 학습 기록을 쌓고, 포트폴리오 write-up 과 컴포넌트 스터디 랩을 한곳에서 보여주는 `밤산책` 개인 아카이브입니다.

## 상태

- 단계: `개발 중`
- 운영 형태: 개인 GitHub Pages
- 최종 갱신일: `2026-09-18`

## 프로젝트 소개

공부한 내용을 메모 앱 여러 곳에 흩어 두지 않고, 다시 찾을 수 있는 하나의 기록으로 남기기 위한 사이트입니다. 세 영역으로 구성됩니다.

| 영역 | 주소 | 내용 |
|---|---|---|
| Notes | `/`, `/archive/` | `src/content/posts` 의 Markdown 학습 기록, 날짜순 |
| Portfolio | `/portfolio/` | `src/content/projects` 의 프로젝트 write-up — 문제 · 설계 · 결과 · 회고 |
| Labs | `/labs/…` | 동작하는 데모. `stripe-dev` 는 stripe.dev 를 분석해 뽑은 원리를 밤산책 디자인 시스템에 주차별로 적용하는 스터디 |

서버나 데이터베이스 없이 GitHub 저장소와 GitHub Pages만 사용합니다. 엔진은 Astro 입니다 ([ADR-0002](docs/decisions/0002-migrate-to-astro.md)). 사이트의 목적, 범위와 성공 기준은 [PROJECT.md](PROJECT.md), 구체적인 사용자 요구사항은 [제품 요구사항](docs/product/requirements.md)을 참고하세요.

## 빠른 시작

### 요구 도구

- Node.js 22.12 이상

```shell
npm install
npm run dev
```

브라우저에서 `http://localhost:4321`을 엽니다.

검증 명령:

```shell
npm run check && npm run build
```

자세한 과정과 문제 해결 방법은 [개발 환경 설정](docs/development/setup.md)을 참고하세요.

## 새 글 작성하기

`src/content/posts` 폴더에 `YYYY-MM-DD-slug.md` 형식으로 파일을 추가합니다. 날짜와 주소(`/log/YYYY/MM/DD/slug/`)는 파일명에서 읽습니다.

```markdown
---
title: "글 제목"
category: JavaScript
tags: [JavaScript, 기초]
---

여기에 Markdown으로 학습 내용을 작성합니다.
```

## 포트폴리오 항목 추가하기

`src/content/projects` 에 `slug.md` 를 추가합니다. front matter 는 카드에, 본문은 상세 페이지에 쓰입니다.

```markdown
---
title: "프로젝트 이름"
summary: "한 줄 요약"
period: "2026.09 – 진행중"
status: 진행중          # 진행중 | 완료 | 보류
stack: [Astro, React]
repo: https://github.com/bamsanchaeg/...
demo: /labs/...
order: 10               # 작을수록 위
---

## 왜 · 어떻게 · 결과 · 회고
```

## 데모 추가하기

- 빌드가 필요 없는 단일 HTML → `public/labs/<name>/index.html` (예: `miles-dot`)
- 컴포넌트·상태가 있는 것 → `src/pages/labs/<name>/` 페이지 + `src/components/<name>/` React island. 스타일은 자체 루트 클래스에 스코프해 블로그 본체와 섞이지 않게 합니다.

작업 브랜치에서 Pull Request를 만들면 CI가 사이트를 검증하고, `main`에 병합하면 CD가 GitHub Pages에 배포합니다.

## GitHub Pages 배포

1. 새 공개 저장소를 만들고 이 프로젝트의 파일을 최상위에 올립니다.
2. GitHub 사용자 사이트 저장소 이름을 `bamsanchaeg.github.io`로 지정합니다.
3. `Settings → Pages`에서 배포 소스를 `GitHub Actions`로 선택합니다.
4. `main`에 푸시하거나 Actions의 `Deploy site`를 수동 실행합니다.

현재 프로젝트의 공개 주소 설정 (`astro.config.mjs`):

```js
site: 'https://bamsanchaeg.github.io',
base: '/',
```

## 디렉터리 구조

```text
.
├── .github/workflows/          자동 빌드 검증과 Pages 배포
├── public/labs/                빌드 없는 정적 데모 (miles-dot)
├── src/
│   ├── content/posts/          Markdown 학습 기록
│   ├── content/projects/       포트폴리오 write-up
│   ├── content.config.ts       두 컬렉션의 front matter 스키마
│   ├── layouts/                Base · Post · Project · StripeDevLab
│   ├── components/             Header · Footer · PostList, stripe-dev/ React island
│   ├── pages/                  라우트 (index, archive, about, 404, portfolio, log/…, labs/…)
│   ├── styles/site.css         블로그 디자인 시스템
│   ├── styles/stripe-dev/      랩 전용 토큰 (.sd 스코프) · themes.json
│   └── lib/posts.ts            파일명 → 날짜·slug·URL
├── docs/                       제품·설계·개발·품질 문서, labs/ 레퍼런스 분석
└── astro.config.mjs            사이트 설정
```

## 디자인 파일

- [Figma — 밤산책 디자인 시스템](https://www.figma.com/design/rgWioHzV1jbcYJCFVmNSTo): `site.css` 의 토큰(Color Light/Dark · Spacing · 텍스트 스타일)과 컴포넌트 6종. 변수의 코드 신택스가 CSS 변수명과 1:1.

## 프로젝트 문서

- [프로젝트 정의](PROJECT.md)
- [문서 지도](docs/README.md)
- [기여 방법](CONTRIBUTING.md)
- [변경 이력](CHANGELOG.md)
- [로드맵](ROADMAP.md)
- [보안 정책](SECURITY.md)

## CI/CD 흐름

```text
작업 브랜치 → Pull Request → Validate site → main 병합 → Deploy site → GitHub Pages
```

- `validate.yml`: Pull Request와 `main` 푸시에서 `astro check` 와 `astro build` 를 실행합니다.
- `deploy.yml`: `main` 푸시에서 사이트를 빌드하고 Pages 산출물을 배포합니다.
- 두 워크플로 모두 Actions 화면에서 수동 실행할 수 있습니다.

운영 및 실패 복구 절차는 [GitHub Pages 운영 문서](docs/operations/runbook.md)를 참고하세요.

## 라이선스

개인 프로젝트 초안입니다. 공개 배포 전에 사용할 라이선스를 결정하고 `LICENSE` 파일을 추가하세요.
