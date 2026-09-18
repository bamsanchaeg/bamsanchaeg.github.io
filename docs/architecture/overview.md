# 아키텍처 개요

- 상태: Approved
- 마지막 검토일: 2026-09-18

## 목표와 제약

- 우선순위: 작성 단순성 → 읽기 편의성 → 시각적 개성
- 배포 환경: GitHub Pages
- 런타임 제약: 방문자 요청 시 실행되는 서버 코드 없음
- 관련 요구사항: [제품 요구사항](../product/requirements.md)

## 시스템 흐름

```text
작성자 → Markdown/컴포넌트 수정 → GitHub 저장소 → Astro 빌드 → GitHub Pages → 방문자
```

## 주요 구성요소

| 구성요소 | 책임 | 의존성 |
|---|---|---|
| `src/content/posts` | 학습 기록과 메타데이터 보관 | Markdown, YAML front matter |
| `src/content/projects` | 포트폴리오 write-up 과 카드 메타데이터 | Markdown/MDX |
| `src/content.config.ts` | 두 컬렉션의 스키마 (빌드 시 검증) | zod |
| `src/layouts`, `src/components` | 공통 셸, 게시물·프로젝트 화면 | Astro |
| `src/pages` | 라우트. `log/[year]/[month]/[day]/[slug]` 가 Jekyll 퍼머링크를 재현 | Astro |
| `src/pages/labs/stripe-dev` + `src/components/stripe-dev` | 컴포넌트 스터디 랩. 상태가 있는 것만 React island | Astro, React |
| `src/styles/site.css` | 블로그 디자인 시스템 | CSS |
| `src/styles/stripe-dev` | 랩 전용 토큰. `.sd` 루트에 스코프해 본체와 격리 | CSS |
| `public/labs` | 빌드 없는 정적 데모 | HTML |
| `astro.config.mjs` | site URL, 통합(mdx, react), 출력 형식 | Astro |
| GitHub Pages | 빌드 결과 공개 | GitHub 저장소 |

## 데이터 설계

각 게시물·프로젝트 Markdown 파일이 기준 데이터입니다. 제목, 분류와 태그는 YAML front matter에, 게시물 날짜는 파일명에 저장합니다. 별도의 데이터베이스, 마이그레이션, 개인정보 보존 절차가 없습니다.

## 보안 경계

사이트는 공개 읽기 전용 콘텐츠를 제공합니다. 인증과 권한은 GitHub 저장소 접근 권한이 담당합니다. 비밀정보는 사이트 파일에 포함하지 않습니다.

## 주요 결정

- [ADR-0001: GitHub Pages와 Jekyll 채택](../decisions/0001-use-jekyll-github-pages.md) — Jekyll 부분은 0002 로 대체
- [ADR-0002: Jekyll에서 Astro로 전환](../decisions/0002-migrate-to-astro.md)

