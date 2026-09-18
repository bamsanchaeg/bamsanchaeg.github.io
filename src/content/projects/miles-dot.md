---
title: "마일스 데이비스 도트 낙서"
summary: "45초 안에 재즈 아티스트를 도트로 그리고, 픽셀화한 원본과 선 기반으로 비교해 점수를 매기는 미니 게임."
period: "2026.09"
status: 완료
stack: [Vanilla JS, Canvas]
repo: https://github.com/bamsanchaeg/bamsanchaeg.github.io/tree/main/public/labs/miles-dot
demo: /labs/miles-dot/
order: 20
---

## 무엇

단일 HTML 파일로 만든 캔버스 게임. 참조 사진을 픽셀화하고, 플레이어가 45초 동안 그린 도트를
윤곽선 기준으로 비교해 유사도를 채점한다. 사진별 명예의 전당과 윤곽 민감도 조절이 있다.

## 배운 것

- 이미지 픽셀화 단계와 비교 단계를 분리하면 채점 기준을 바꿔도 렌더링을 다시 짤 필요가 없다.
- 빌드 도구 없이도 `public/labs/` 에 두면 사이트 배포에 그대로 실린다 — 원파일 장난감은 이 경로로.
- 한 파일 540줄이던 것을 HTML · CSS · JS(ES module)로 나누고 Airbnb 스타일 가이드로 다시 썼다. 흩어진 전역 변수 12개를 `state` 객체 하나로 모으니 "누가 이 값을 바꾸는가" 가 grep 한 번에 보인다. `no-bitwise` 는 해시·난수 두 함수에서만 예외.
