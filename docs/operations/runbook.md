# GitHub Pages 운영

## 배포

### 최초 설정

1. 저장소 `Settings → Pages`에서 Source를 `GitHub Actions`로 선택합니다.
2. `Settings → Actions → General`에서 워크플로 실행이 허용되어 있는지 확인합니다.
3. 작업 브랜치를 푸시하고 Pull Request에서 `Build Jekyll` 검사가 성공하는지 확인합니다.

### 자동 배포

1. Pull Request를 `main`에 병합합니다.
2. `Validate site`가 소스 빌드를 다시 검증합니다.
3. `Deploy site`의 build 작업이 Pages 산출물을 생성합니다.
4. build 성공 후 deploy 작업이 `github-pages` 환경에 배포합니다.
5. Actions 실행 요약의 배포 URL에서 홈과 최신 게시물을 확인합니다.

### 수동 재배포

1. 저장소의 `Actions → Deploy site`로 이동합니다.
2. `Run workflow`에서 `main`을 선택합니다.
3. 실행 후 `Deploy GitHub Pages` 작업과 배포 URL을 확인합니다.

## 정상 판단 기준

- 사이트 주소가 HTTPS로 열린다.
- 최신 글이 홈과 ARCHIVE 양쪽에 표시된다.
- CSS가 적용되고 메뉴와 게시물 링크에 404가 발생하지 않는다.

## 되돌리기

문제가 생긴 커밋을 GitHub에서 `Revert`하거나, 이전 정상 파일 내용을 새 커밋으로 복원합니다. 저장소 기록을 강제로 덮어쓰지 않습니다.

## 자주 발생하는 상황

### 빌드 실패

- Actions 실패 로그에서 최초 오류 파일을 확인합니다.
- 최근 게시물의 front matter와 Liquid 문법을 우선 확인합니다.
- 수정 커밋 후 자동 검증과 Pages 배포가 끝날 때까지 기다립니다.

### 배포 작업이 시작되지 않음

- 변경이 `main` 브랜치에 반영됐는지 확인합니다.
- Pages의 Source가 `GitHub Actions`인지 확인합니다.
- Actions 실행 권한과 `github-pages` 환경의 승인 규칙을 확인합니다.

### 디자인 없이 텍스트만 표시됨

- 배포 주소에 저장소 하위 경로가 있는지 확인합니다.
- `_config.yml`의 `baseurl`을 `/<저장소명>`으로 설정합니다.

### 잘못된 글을 공개함

- 해당 파일을 삭제하는 새 커밋을 만듭니다.
- 비밀값이 포함됐다면 파일 삭제만으로 끝내지 말고 해당 값을 즉시 폐기·재발급합니다.

## 브랜치 보호 권장 설정

`main` 규칙에 Pull Request와 `Build Jekyll` 상태 검사 통과를 요구합니다. 강제 푸시는 차단하고, 긴급 복구도 `git revert`를 이용해 이력으로 남깁니다.
