# 변경 이력

주요 사용자 관점의 변경을 기록합니다.

## [Unreleased]

### Added

- 포트폴리오 컬렉션(`src/content/projects`)과 `/portfolio/` 카드·상세 페이지
- stripe.dev 디자인 시스템 스터디 `/labs/stripe-dev/` — 원리 채택/기각 목차, 1주차(밤산책 토큰 리팩터링), `reference/` 원본 분석 전시
- 라이트/다크 테마 토글 (헤더). 시스템 설정을 따르고 선택은 localStorage 에 저장
- 레퍼런스 분석 문서 `docs/labs/stripe-dev-reference.md`
- 헤더 메뉴에 Portfolio 추가
- 원자 컴포넌트 `Chip` · `Button` · `SectionLabel` (`src/components/ui/`) — Figma 컴포넌트와 1:1, 스터디 2주차
- 글 목록·아카이브·포트폴리오 카드 hover 를 액센트 배경 반전으로 통일

### Changed

- `labs/miles-dot` 을 HTML · `styles.css` · `miles-dot.js`(ES module) 로 분리하고 Airbnb JavaScript/CSS 스타일 가이드로 재작성 (`eslint-config-airbnb-base` 0 errors). 상태를 `state` 객체 하나로 모으고 기능별 주석 추가
- 페이지 제목(h1) 크기 축소 — intro 60px·page 52px·post 44px 상한. Figma 텍스트 스타일 동기화
- `site.css` 색 토큰을 원색 4개(`--ink`, `--accent`, `--canvas`, `--surface`) + `color-mix()` 파생으로 재구성. 하드코딩 색 제거
- 사이트 엔진을 Jekyll에서 Astro로 전환 (ADR-0002). 게시물 주소·RSS 주소는 그대로.
- `miles-dot/` 을 `/labs/miles-dot/` 으로 이동 (옛 주소는 301)
- CI/CD 워크플로를 Node 기반(`astro check` + `astro build`, `withastro/action`)으로 교체

### Removed

- Ruby, Bundler, Jekyll 설정 파일


- 프로젝트 문서 체계와 자동 빌드 검증
- Pull Request와 `main` 푸시를 검증하는 CI 워크플로
- `main` 변경을 GitHub Pages에 게시하는 CD 워크플로
- 수동 재배포와 배포 실패 대응 절차

### Changed

- 사이트 이름을 `Bamsanchaeg`, 설명을 `밤산책`으로 변경
- GitHub Pages 주소와 프로필 링크를 `bamsanchaeg` 계정에 맞게 설정
- 전체 서체를 Noto Sans KR로 변경하고 최대 굵기를 600으로 제한
- 강한 남색·형광색·두꺼운 그림자를 저채도 회색 팔레트와 얇은 선으로 변경
- 프로필 사진, 상태 표시, 메모, 바로가기 등 장식성 요소를 제거
- 홈과 글 목록을 짧은 문장, 넓은 여백, 올리브 포인트 중심의 에디토리얼 구조로 재설계

## [0.1.0] - 2026-09-08

### Added

- 게시판형 홈과 전체 글 아카이브
- Markdown 기반 샘플 학습 기록 3개
- 프로필, RSS, 404 페이지
- 모바일 반응형 레이아웃과 본문 바로가기
