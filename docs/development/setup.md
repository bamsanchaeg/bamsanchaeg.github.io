# 개발 환경 설정

이 문서는 저장소를 내려받은 뒤 로컬 확인과 빌드까지 진행하는 경로를 설명합니다. GitHub 웹에서 글만 작성할 경우 로컬 설정은 선택 사항입니다.

## 요구 도구

| 도구 | 버전 | 확인 명령 |
|---|---|---|
| Ruby | 3.3 | `ruby --version` |
| Bundler | Ruby 환경 호환 버전 | `bundle --version` |

## 최초 설정과 실행

```shell
bundle install
bundle exec jekyll serve --livereload
```

- 로컬 주소: `http://127.0.0.1:4000`
- 종료: 실행한 터미널에서 `Ctrl+C`

## 검증

```shell
bundle exec jekyll build --strict_front_matter
```

생성 결과는 `_site`에 저장되며 Git에는 포함하지 않습니다.

## 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| CSS 또는 링크가 404 | `baseurl`이 저장소 이름과 다름 | `_config.yml`의 `baseurl` 확인 |
| 새 글이 보이지 않음 | 파일명 날짜가 미래이거나 형식이 다름 | `YYYY-MM-DD-title.md` 형식과 날짜 확인 |
| front matter 오류 | 구분선 또는 YAML 문법 오류 | 문서 시작과 끝의 `---` 및 들여쓰기 확인 |
| 로컬 주소가 배포와 다름 | 프로젝트 사이트 경로 적용 안 됨 | `bundle exec jekyll serve --baseurl /저장소명` 사용 |

