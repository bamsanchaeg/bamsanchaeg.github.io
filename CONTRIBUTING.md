# 기여 가이드

## 콘텐츠 수정

1. `_posts`에 `YYYY-MM-DD-title.md` 형식의 파일을 추가합니다.
2. `title`, `category`, `tags`를 front matter에 작성합니다.
3. 코드 예제는 직접 실행한 결과를 기준으로 기록합니다.
4. 내부 링크와 이미지 경로는 프로젝트 사이트의 `baseurl`에서도 작동하도록 `relative_url` 사용을 우선합니다.

## 코드 수정

- 레이아웃 변경은 `_layouts`와 `_includes`의 책임을 먼저 확인합니다.
- 색상, 간격, 타이포그래피는 `assets/css/style.css`의 공통 변수를 재사용합니다.
- JavaScript 없이도 글을 읽고 이동할 수 있어야 합니다.
- 사용자 관점의 변경은 `CHANGELOG.md`에 기록합니다.

## 커밋 예시

```text
content: CSS Grid 학습 기록 추가
feat: 카테고리별 글 목록 추가
fix: 프로젝트 사이트의 상대 경로 수정
docs: 배포 절차 보완
```

## 완료 전 확인

```shell
bundle exec jekyll build --strict_front_matter
```

- 새 글이 홈과 아카이브에 표시되는지 확인합니다.
- 게시물, 메뉴, CSS와 JavaScript 링크가 정상인지 확인합니다.
- 비밀값이나 개인 연락처가 포함되지 않았는지 확인합니다.

