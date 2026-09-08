# 아키텍처 개요

- 상태: Approved
- 마지막 검토일: 2026-09-08

## 목표와 제약

- 우선순위: 작성 단순성 → 읽기 편의성 → 시각적 개성
- 배포 환경: GitHub Pages
- 런타임 제약: 방문자 요청 시 실행되는 서버 코드 없음
- 관련 요구사항: [제품 요구사항](../product/requirements.md)

## 시스템 흐름

```text
작성자 → Markdown/CSS 수정 → GitHub 저장소 → Jekyll 빌드 → GitHub Pages → 방문자
```

## 주요 구성요소

| 구성요소 | 책임 | 의존성 |
|---|---|---|
| `_posts` | 학습 기록과 메타데이터 보관 | Markdown, YAML front matter |
| `_layouts` | 공통 문서와 게시물 화면 구성 | Liquid |
| `_includes` | 헤더와 푸터 재사용 | Liquid |
| `assets` | 디자인과 선택적 상호작용 | CSS, JavaScript |
| `_config.yml` | URL, 플러그인, 빌드 규칙 정의 | Jekyll |
| GitHub Pages | 빌드 결과 공개 | GitHub 저장소 |

## 데이터 설계

각 게시물 Markdown 파일이 기준 데이터입니다. 제목, 날짜, 분류와 태그는 YAML front matter에 저장합니다. 별도의 데이터베이스, 마이그레이션, 개인정보 보존 절차가 없습니다.

## 보안 경계

사이트는 공개 읽기 전용 콘텐츠를 제공합니다. 인증과 권한은 GitHub 저장소 접근 권한이 담당합니다. 비밀정보는 사이트 파일에 포함하지 않습니다.

## 주요 결정

- [ADR-0001: GitHub Pages와 Jekyll 채택](../decisions/0001-use-jekyll-github-pages.md)

