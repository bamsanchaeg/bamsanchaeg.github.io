# 테스트 전략

이 사이트는 서버 로직이 없는 정적 Astro 프로젝트이므로 빌드 검증과 핵심 탐색의 수동 확인에 집중합니다.

## 자동 검증

| 검증 | 대상 | 실행 시점 |
|---|---|---|
| `astro check` | 템플릿 타입, content collection front matter 스키마 | 모든 push와 pull request |
| `astro build` | 라우트 생성, 링크된 컴포넌트·스타일 해석 | 모든 push와 pull request |
| Pages 산출물 빌드 | GitHub Pages 업로드 대상 | `main` push와 수동 배포 |

```shell
npm run check && npm run build
```

## 배포 전 수동 확인

- 홈에서 최신 게시물 제목을 선택할 수 있다.
- ARCHIVE에서 모든 게시물에 접근할 수 있고, 주소가 `/log/YYYY/MM/DD/slug/` 형식이다.
- PORTFOLIO 카드에서 상세와 Demo·Repo 링크가 열린다.
- `/labs/stripe-dev/` 에서 테마를 바꾸면 랩 안의 색만 바뀌고, 블로그 페이지로 돌아와도 영향이 없다.
- ABOUT과 RSS(`/feed.xml`) 링크가 열린다.
- 직접 존재하지 않는 주소에서 404 페이지가 표시된다.
- 320px 화면과 200% 확대에서 핵심 내용을 읽고 이동할 수 있다.
- 키보드만으로 본문 바로가기와 메뉴를 사용할 수 있다.

댓글이나 입력 폼 같은 동작이 추가되면 자동화된 브라우저 테스트 도입을 다시 검토합니다.

## CI/CD 품질 게이트

- Pull Request의 `Build Astro`가 실패하면 병합하지 않습니다.
- Pages 배포는 산출물 빌드가 성공한 경우에만 실행됩니다.
- 배포 실패 시 같은 커밋의 재실행보다 실패 원인을 수정한 새 커밋을 우선합니다.
