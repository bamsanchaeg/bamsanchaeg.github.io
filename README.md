# Bamsanchaeg

> Markdown으로 학습 기록을 쌓고, 2000년대 개인 홈페이지와 텍스트 게시판 감성으로 보여주는 `밤산책` 개인 아카이브입니다.

## 상태

- 단계: `개발 중`
- 운영 형태: 개인 GitHub Pages
- 최종 갱신일: `2026-09-08`

## 프로젝트 소개

공부한 내용을 메모 앱 여러 곳에 흩어 두지 않고, 다시 찾을 수 있는 하나의 기록으로 남기기 위한 사이트입니다. 글 작성자는 `_posts`에 Markdown 파일을 추가하고, 방문자는 홈과 아카이브에서 날짜순으로 기록을 탐색합니다.

서버나 데이터베이스 없이 GitHub 저장소와 GitHub Pages만 사용합니다. 사이트의 목적, 범위와 성공 기준은 [PROJECT.md](PROJECT.md), 구체적인 사용자 요구사항은 [제품 요구사항](docs/product/requirements.md)을 참고하세요.

## 빠른 시작

### 요구 도구

- Ruby 3.3
- Bundler

```shell
bundle install
bundle exec jekyll serve --livereload
```

브라우저에서 `http://127.0.0.1:4000`을 엽니다.

검증 명령:

```shell
bundle exec jekyll build --strict_front_matter
```

자세한 과정과 문제 해결 방법은 [개발 환경 설정](docs/development/setup.md)을 참고하세요.

## 새 글 작성하기

`_posts` 폴더에 `YYYY-MM-DD-title.md` 형식으로 파일을 추가합니다.

```markdown
---
title: "글 제목"
category: JavaScript
tags: [JavaScript, 기초]
---

여기에 Markdown으로 학습 내용을 작성합니다.
```

작업 브랜치에서 Pull Request를 만들면 CI가 사이트를 검증하고, `main`에 병합하면 CD가 GitHub Pages에 배포합니다.

## GitHub Pages 배포

1. 새 공개 저장소를 만들고 이 프로젝트의 파일을 최상위에 올립니다.
2. GitHub 사용자 사이트 저장소 이름을 `bamsanchaeg.github.io`로 지정합니다.
3. `Settings → Pages`에서 배포 소스를 `GitHub Actions`로 선택합니다.
4. `main`에 푸시하거나 Actions의 `Deploy site`를 수동 실행합니다.

현재 프로젝트의 공개 주소 설정:

```yaml
url: "https://bamsanchaeg.github.io"
baseurl: ""
```

## 디렉터리 구조

```text
.
├── .github/workflows/       자동 빌드 검증
├── _includes/               공통 헤더와 푸터
├── _layouts/                기본 및 게시물 레이아웃
├── _posts/                  Markdown 학습 기록
├── assets/                  CSS와 JavaScript
├── docs/                    제품·설계·개발·품질 문서
├── 404.html                 오류 페이지
├── about.md                 프로필 페이지
├── archive.html             전체 글 목록
├── index.html               홈 화면
└── _config.yml              Jekyll 사이트 설정
```

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

- `validate.yml`: Pull Request와 `main` 푸시에서 엄격한 Jekyll 빌드를 실행합니다.
- `deploy.yml`: `main` 푸시에서 사이트를 빌드하고 Pages 산출물을 배포합니다.
- 두 워크플로 모두 Actions 화면에서 수동 실행할 수 있습니다.

운영 및 실패 복구 절차는 [GitHub Pages 운영 문서](docs/operations/runbook.md)를 참고하세요.

## 라이선스

개인 프로젝트 초안입니다. 공개 배포 전에 사용할 라이선스를 결정하고 `LICENSE` 파일을 추가하세요.
