# ADR-0002: Jekyll에서 Astro로 전환

- 상태: Accepted
- 날짜: 2026-09-18
- 대체: [ADR-0001](0001-use-jekyll-github-pages.md) 의 "Jekyll 채택" 부분. GitHub Pages 채택은 유지.

## 맥락

사이트에 두 가지를 추가하려 한다.

1. **포트폴리오** — 프로젝트별 write-up 과 카드 목록
2. **컴포넌트 스터디 랩** — stripe.dev 디자인 시스템을 주차별로 다시 구현하는 React 컴포넌트 쇼케이스

Jekyll 은 1은 잘하지만 2를 못 한다. 빌드가 필요한 데모를 별도 저장소로 분리하면 툴체인(Ruby + Node)과
워크플로가 두 벌이 되고, 포트폴리오 글 안에서 실제 컴포넌트를 보여줄 수 없다.

ADR-0001 이 Jekyll 을 고른 근거는 "GitHub Pages 가 직접 지원"이었는데, 이미 Actions 기반 배포를 쓰고 있어
그 이점은 사라진 상태였다.

## 고려한 선택지

1. Jekyll 유지 + 스터디는 별도 저장소(자체 Pages) + 링크로 연결
2. Jekyll 유지 + `deploy.yml` 에 Vite 빌드 단계를 추가해 `_site/labs/` 에 합침
3. **Astro 로 전환** — Markdown 컬렉션 + React island 를 저장소 하나, 툴체인 하나로

## 결정

Astro 로 전환한다. 게시물은 content collection 으로 그대로 옮기고, 포트폴리오는 두 번째 컬렉션,
스터디 랩은 `src/pages/labs/` 아래 페이지 + React island 로 둔다.

## 결과

### 긍정적

- 저장소·워크플로·툴체인이 하나(Node). Ruby 의존성 제거.
- 포트폴리오 write-up(MDX) 안에 동작하는 컴포넌트를 임베드할 수 있다.
- 정적 페이지는 JS 0, 인터랙션 있는 컴포넌트만 hydrate.
- front matter 가 zod 스키마로 검증되어 잘못된 글이 빌드에서 걸린다.

### 부정적

- `package.json` 의존성 업데이트를 직접 관리해야 한다.
- 콘텐츠 사이트 도구이므로 스터디가 풀 SPA 로 커지면 island 모델이 답답할 수 있다.

### 유지한 것

- 게시물 URL `/log/:year/:month/:day/:title/`, `/archive/`, `/about/`, `/feed.xml`
- 파일명 관례 `YYYY-MM-DD-slug.md` (날짜를 파일명에서 읽는다)
- `assets/css/style.css` → `src/styles/site.css` 의 디자인 시스템 전부
- `miles-dot/` → `/labs/miles-dot/` (옛 주소는 301 리다이렉트)

### 후속 작업

- 첫 배포 후 게시물·RSS·리다이렉트 주소를 실제로 확인한다.
- 스터디 랩 2~5주차를 진행하며 포트폴리오 write-up 을 갱신한다.
