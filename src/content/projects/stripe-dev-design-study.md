---
title: "stripe.dev 디자인 시스템 스터디"
summary: "Stripe 개발자 허브의 CSS·테마 토큰을 추출해 원리를 뽑고, 밤산책 자체 디자인 시스템에 주차별로 적용한다."
period: "2026.09 – 진행중"
status: 진행중
stack: [Astro, React, TypeScript, CSS Subgrid]
repo: https://github.com/bamsanchaeg/bamsanchaeg.github.io
demo: /labs/stripe-dev/
order: 10
---

## 왜

디자인 시스템을 "예쁘게 보이는 것"이 아니라 **토큰 → 원자 → 조합 → 페이지**의 의존 순서로 이해하고 싶었다.
stripe.dev 는 색을 거의 쓰지 않는 대신(잉크 + 액센트 라임 하나) 점선·모노스페이스 캡션·윈도우 프레임 같은
OS 메타포로 개성을 만드는 사이트라, 토큰이 얼마나 적어도 되는지 배우기에 좋은 표본이었다.

## 어떻게 분석했나

브라우저 대신 HTML·CSS·JS 번들을 직접 내려받아 파싱했다. 그 덕에 스크린샷으로는 얻을 수 없는
**테마 객체 원본(12개 테마 × 45개 토큰)** 을 Next.js 청크에서 그대로 꺼낼 수 있었다.
분석 결과는 [레퍼런스 문서](https://github.com/bamsanchaeg/bamsanchaeg.github.io/blob/main/docs/labs/stripe-dev-reference.md)에 정리했다.

핵심 발견 세 가지:

1. **액센트는 하나.** 모든 hover 는 "배경을 라임으로 반전"이고, 선은 0.5px 실선 아니면 1px 점선뿐이다.
2. **알파 계층.** `#1e1e1e` → `#1e1e1e44` → `#1e1e1e11` 처럼 같은 잉크색에 알파만 바꿔 위계를 만든다. 테마마다 이 세 단계를 실제 hex 로 다시 정의해 배경이 바뀌어도 위계가 유지된다.
3. **컴포넌트 CSS 는 토큰만 참조.** JS 가 `data-theme` 에 45개 변수를 주입하므로 테마 추가 = 객체 하나.

## 방향 전환 — 재현에서 적용으로

처음엔 원본을 그대로 다시 짜는 걸 1주차로 잡았다. 만들고 보니 폰트만 바꾼 **클론**이었고,
포트폴리오로는 "따라 만들 수 있다" 이상을 말해주지 못했다. 그래서 구조를 바꿨다.

- 재현본은 [분석 전시](/labs/stripe-dev/reference/)로 격하해 표본으로만 남긴다 (`.sd` 루트에 격리, 원본 12개 테마 전환 가능).
- 본 트랙은 **밤산책의 실제 디자인 시스템에 원리를 적용**하는 것으로. 매주 산출물 = 이 사이트의 실제 페이지 변화.

원리 다섯 중 **셋을 채택, 둘을 기각**했다. 채택: 액센트 하나 + hover 반전 · 알파 계층으로 위계 · 토큰만 참조하는 컴포넌트.
기각: OS 메타포(글 사이트의 본문과 경쟁) · 24열 subgrid와 유동 타이포(단일 칼럼 한글 본문엔 과함).
근거는 [스터디 목차](/labs/stripe-dev/)에 정리했다.

## 주차별 진행

| 주차 | 범위 | 상태 |
|---|---|---|
| [1주차](/labs/stripe-dev/week-1/) | 원색 4개 + 파생 토큰으로 `site.css` 리팩터링, 액센트 반전 hover, 다크 모드 토글 | 완료 |
| [2주차](/labs/stripe-dev/week-2/) | `.status` / `.text-button` / `.github-link` / `.section-label` → Chip · Button · SectionLabel 컴포넌트, Figma 와 이름·변형 1:1 | 완료 |
| 3주차 | 글 목록 · 아카이브 · 카테고리 필터 (데스크톱 세로 / 모바일 가로 칩) | 예정 |
| 4주차 | 포트폴리오 카드 · 헤더 정비 | 예정 |
| 5주차 | 홈 재구성 · 회고 | 예정 |

## 1주차 결과

- 고정 색 변수 10개 → **원색 4개** (`--ink`, `--accent`, `--canvas`, `--surface`) + `color-mix()` 파생 6개.
- 하드코딩 색 7곳 → 0. 다크 모드는 원색 4개만 재정의하는 **12줄**로 끝났고 컴포넌트 CSS 는 한 줄도 안 바꿨다.
- 보조 텍스트 `ink 66%` 는 라이트·다크 양쪽에서 AA 4.5:1 을 만족하도록 알파를 정했다.
- 리스트 행 hover 는 원본의 완전 반전 대신 `accent-soft` 배경 반전 — 글 사이트의 톤에 맞춘 조정.
- Figma 변수는 `color-mix()` 를 표현할 수 없어 파생 6개는 모드별 해석값으로 넣었다. 그 과정에서 대비를 재계산하다가 `accent-ink`(accent 72%)가 칩 위에서 4.1:1 로 AA 미달인 걸 발견 → 55% 로 조정(5.2:1). 디자인 도구로 옮기는 작업이 코드의 버그를 잡아준 경우.

## 2주차 결과

- 흩어진 클래스 4개 → Astro 컴포넌트 3개 (`Chip`, `Button`, `SectionLabel`). 사용처 12곳 교체, 옛 클래스 삭제.
- Figma 변형 이름 = prop 이름. `Style=Outline` → `variant="outline"`, `Kind=진행중` → `kind="진행중"`. 예외는 State — 코드에선 `:hover`.
- 카테고리 칩이 `.post-meta span:first-child` 라는 암묵적 셀렉터에 의존하던 것을 명시적 `<Chip>` 으로. 마크업 순서가 바뀌어도 깨지지 않는다.

## 설계 결정

- **격리.** 분석 전시의 stripe 토큰은 `.sd` 루트에만 스코프한다. 본체 `:root` 에 `--sd-*` 가 새지 않는다.
- **JS 최소.** 다크 토글은 boolean 하나라 React 없이 인라인 스크립트. 분석 전시의 12테마 스위처만 React island.
- **Figma 동기화.** 토큰(원색 4 + 파생 6, Light/Dark 모드)과 컴포넌트 6종을 [Figma 파일](https://www.figma.com/design/rgWioHzV1jbcYJCFVmNSTo)의 변수·컴포넌트로 같이 관리한다. 변수마다 `var(--…)` 코드 신택스가 붙어 있어 Dev Mode 에서 CSS 변수명이 그대로 보인다.

## 회고

(주차가 끝날 때마다 갱신)
