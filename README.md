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

커밋하면 GitHub Pages가 사이트를 다시 빌드합니다.

## GitHub Pages 배포

1. 새 공개 저장소를 만들고 이 프로젝트의 파일을 최상위에 올립니다.
2. GitHub 사용자 사이트 저장소 이름을 `bamsanchaeg.github.io`로 지정합니다.
3. `Settings → Pages → Deploy from a branch`를 선택합니다.
4. `main` 브랜치와 `/(root)`를 선택하고 저장합니다.

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

## 라이선스

개인 프로젝트 초안입니다. 공개 배포 전에 사용할 라이선스를 결정하고 `LICENSE` 파일을 추가하세요.
