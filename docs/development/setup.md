# 개발 환경 설정

이 문서는 저장소를 내려받은 뒤 로컬 확인과 빌드까지 진행하는 경로를 설명합니다. GitHub 웹에서 글만 작성할 경우 로컬 설정은 선택 사항입니다.

## 요구 도구

| 도구 | 버전 | 확인 명령 |
|---|---|---|
| Node.js | 22.12 이상 | `node --version` |
| npm | Node 동봉 버전 | `npm --version` |

## 최초 설정과 실행

```shell
npm install
npm run dev
```

- 로컬 주소: `http://localhost:4321`
- 종료: 실행한 터미널에서 `Ctrl+C`

## 검증

```shell
npm run check   # 템플릿 타입과 front matter 스키마 검사
npm run build   # dist/ 에 정적 사이트 생성
npm run preview # 빌드 결과를 로컬에서 확인
```

생성 결과는 `dist/`에 저장되며 Git에는 포함하지 않습니다.

## 디렉터리 안내

| 경로 | 역할 |
|---|---|
| `src/content/posts/` | 학습 기록. 파일명 `YYYY-MM-DD-slug.md` |
| `src/content/projects/` | 포트폴리오 write-up. 파일명이 곧 URL slug |
| `src/content.config.ts` | 두 컬렉션의 front matter 스키마 |
| `src/pages/` | 라우트. 파일 경로가 URL |
| `src/pages/labs/stripe-dev/` | stripe.dev 스터디 — 목차, 주차 페이지(블로그 셸), `reference/` 원본 재현 전시(`.sd` 셸) |
| `src/components/ui/` | 원자 컴포넌트 Chip · Button · SectionLabel. Figma 컴포넌트와 이름·변형 1:1 |
| `src/components/stripe-dev/` | 분석 전시의 12테마 스위처 island |
| `src/styles/site.css` | 블로그 디자인 시스템 |
| `src/styles/stripe-dev/` | 분석 전시 전용 stripe 토큰 (`.sd` 루트에 스코프) |
| `src/styles/lab.css` | 스터디 주차 페이지의 전시 컴포넌트 (블로그 토큰 사용) |
| `public/labs/` | 빌드가 필요 없는 정적 데모 (예: `miles-dot`) |
| `docs/labs/` | 스터디 레퍼런스 분석 문서 |

## 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| 새 글이 빌드에서 실패 | front matter 가 스키마와 다름 | `npm run check` 오류 메시지의 필드 확인 (`title` 필수) |
| 새 글이 보이지 않음 | 파일명 형식이 다름 | `YYYY-MM-DD-slug.md` 형식 확인, 또는 `date:` 를 front matter 에 명시 |
| 글 주소가 예상과 다름 | 날짜·slug 는 파일명에서 읽음 | `src/lib/posts.ts` 의 `postMeta` 참고 |
| 랩 테마가 블로그에 번짐 | `.sd` 밖에서 `--sd-*` 변수를 참조 | 랩 스타일은 `src/styles/stripe-dev/` 안에서만, 셀렉터는 `.sd` 로 시작 |
