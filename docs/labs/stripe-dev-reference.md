# stripe.dev 디자인 레퍼런스 분석

> 수집일: 2026-09-18 · 출처: https://stripe.dev (Next.js/Turbopack, CSS Modules)
> 구현: `src/styles/stripe-dev/tokens.css` (`.sd` 스코프 CSS 변수 + 타이포 스케일 + 그리드), `src/styles/stripe-dev/themes.json` (12개 테마 원본 토큰) · 라이브: `/labs/stripe-dev/`

---

## 1. 컨셉 한 줄 요약

**"개발자 허브를 90년대 데스크톱/터미널처럼"** — 회색 종이 바탕(`#e8e8e8`)에 잉크색 텍스트(`#1e1e1e`), 포인트 컬러는 라임(`#c4e817`) 단 하나. 장식 대신 **점선 테두리·모노스페이스 소문자캡션·`[B]` 단축키 표기·드래그 가능한 윈도우 프레임** 같은 OS 메타포로 개성을 만든다. 색을 거의 안 쓰기 때문에 hover 시 **배경이 통째로 라임색으로 반전**되는 인터랙션이 유일하고 강한 피드백.

핵심 규칙 4가지:
1. **단색 + 액센트 1개.** 모든 상태 변화는 `highlightColor`로 배경 채우기 + `invertedTextColor`로 글자 반전.
2. **얇고 가벼운 타이포.** 본문/제목 모두 `font-weight: 300`, 큰 제목은 `letter-spacing: -.06em ~ -.07em`, `line-height: 80~100%`.
3. **선은 0.5px 실선 또는 1px 점선(dotted).** 그림자·라운드 카드 없음. 버튼만 `border-radius: 99px` 필 형태.
4. **24열 서브그리드.** 모든 섹션이 `grid-template-columns: subgrid`로 상위 그리드 열에 정렬.

---

## 2. 레이아웃 시스템

| 항목 | 값 |
|---|---|
| 컨테이너 | `max-width: 1728px`, 좌우 패딩 `12px` |
| 그리드 열 | 모바일 **8열** → `≥760px` **16열** → `≥960px` **24열** |
| 섹션 | `grid-column: 1/-1; grid-template-columns: subgrid` (자식이 부모 열에 그대로 정렬) |
| 브레이크포인트 | `600 / 760 / 960 / 1440 / 1728` px (+ `pointer:fine`으로 hover 분기) |
| 섹션 간격 | `margin-top: 100px` (모바일) / `160px` (≥760px), 섹션 내부 `row-gap: 36 → 56px` |
| 고정 요소 | Nav `position: fixed; top: 0` / TOC `position: sticky; top: var(--stickyOffset: 60px)` |

> hover 스타일은 전부 `@media (pointer: fine)` 안에만 선언 — 터치 기기에서 sticky hover 방지.

---

## 3. 타이포그래피

폰트: **Söhne (sohne-var, variable)** + **Söhne Mono**. 둘 다 유료(Klim Type) → 대체: Inter / Geist Sans + JetBrains Mono / Geist Mono.

| 클래스 | 크기 | weight | tracking | line-height | 용도 |
|---|---|---|---|---|---|
| `.text-hero` | `calc(12.28vw + 32px)` | 300 | -.07em | 80% | 히어로 "Welcome to Stripe Dot" |
| `SectionTitle` | `calc(4.48vw + 36.5px)` → 114px@1728 | 300 | -.06em | 84% | 섹션 대제목 `Featured(20)` |
| `.text-lg` | `calc(1.72vw + 13.3px)` | 300 | -.06em | 95% | 히어로 서브타이틀 |
| `.text-md` | `calc(1.89vw + 12.6px)` | 300 | -.04em | 100% | 카드 제목 (`b`는 500) |
| `.text-sm` | `calc(.52vw + 12px)` | 300 | -.03em | 100% | 카드 본문 |
| `.text-xs` | 14px | 300 | -.03em | 100% | 필터 옵션 |
| `.text-smallcaps` | 12px **mono, uppercase** | 300 | -.012em | — | 라벨/태그/날짜/캡션 |

블로그 본문(article body): h2 48px(-2.88px) · h3 36px · h4 28px · h5 20px(400) · h6 18px(400) · p/li 16px 300 lh 130% · 인라인 code 16px mono, bg `navButtonBG`, radius 3px · 코드블록 `codeBG` + 1px `codeBorderColor` radius 4px.

**"섹션 카운터" 패턴**: 제목 옆 위첨자 `(20)` → `SectionTitle__superText`, `calc(.6vw + 9.7px)`, `counterColor`.

---

## 4. 컬러 토큰 (theme = default)

주요 토큰만 발췌. 전체 45개 × 12테마는 `themes.json`.

| 역할 | 토큰 | 값 |
|---|---|---|
| 배경 | `backgroundColor` | `#e8e8e8` |
| 텍스트(제목/본문/리스트) | `headingTextColor` / `bodyTextColor` / `listItemText` | `#1e1e1e` |
| **액센트(유일)** | `highlightColor` / `tagHighlightColor` / `terminalHighlight` | `#c4e817` (라임) |
| 반전 텍스트 (hover 시) | `invertedTextColor` | `#1e1e1e` |
| 비활성 | `inactiveColor` / `filterTextInactive` | `#8d8d8d` / `#1e1e1e44` |
| 선 | `borderColor` (0.5px 실선) / `dottedBorderColor`, `tagBorderColor` (1px 점선) | `#1e1e1e` / `#1e1e1e44` |
| 버튼 | `buttonColor` (테두리·hover 배경) / `navButtonBG` | `#1e1e1e` / `#1e1e1e11` |
| 윈도우 프레임 | `windowFrameBG` / `windowBarText` | `#e9e9e9` / `#011627` |
| 터미널 | `terminalBackground` / `terminalTextPrimary` / `terminalTextSecondary` | `#1e1e1e` / `#e8e8e8` / `#cacaca` |
| 코드 | `codeBG` / `codeBorderColor` | `#f5f5f5` / `#d5d5d5` |

**투명도 계층 트릭**: 같은 잉크색에 알파만 바꿔 위계를 만든다 — `#1e1e1e`(100%) → `#1e1e1e44`(27%, 점선/비활성) → `#1e1e1e11`(7%, 버튼 배경). 테마를 바꿔도 위계가 유지되는 이유.

### 테마 12종
`default`, `paper`, `night-owl`(다크 기본), `omaha`(흰 배경+네이비), `web-rings`(검정+시안), `crt-red`/`crt-amber`/`crt-green`/`crt-mono`(단색 CRT), `90s-vibes`(Times New Roman + Win95 베벨 버튼), `valentines-day`, `st-patricks-day`.
→ 테마 전환은 `body[data-theme=…]` + JS가 45개 토큰을 `style`에 주입. **컴포넌트 CSS는 토큰만 참조**하므로 테마 추가 = 객체 하나 추가.

---

## 5. 컴포넌트 카탈로그 (CSS Module 이름 기준)

### 5-1. 네비게이션 `Nav` / `NavButton`
- `position: fixed; top: 0`, `padding: 12px`, `gap: 3px`, `max-width: 1728px` 중앙 정렬
- 버튼: `padding: 5px 8px`, `border-radius: 2px`, `background: navButtonBG` + **`backdrop-filter: blur(10px)`** (스크롤 시 유리 효과)
- 라벨 형식 **`[B] Blog`** — 대괄호 안이 키보드 단축키(`hotkey`, ≤959px에서 숨김), `text-smallcaps`
- hover: 배경 `highlightColor`, 글자 `invertedTextColor` / active: 배경 `buttonColor`, 글자 `backgroundColor`

### 5-2. 섹션 헤더 `TableHeader` (`/Featured Post`)
- `border-bottom: .5px solid sectionLabels`, `padding-bottom: 6px`, `text-smallcaps`
- 라벨 앞에 슬래시 `/` 접두사 — 파일 경로 메타포

### 5-3. 태그 `Tag`
- `border: 1px dotted tagBorderColor`, `border-radius: 3px`, `padding: 2px 5px 2.5px`, `text-smallcaps`, `white-space: nowrap`
- 링크형 hover: 배경 `tagHighlightColor`, 글자 반전

### 5-4. 버튼 `.buttonSm / .buttonMd / .buttonLg`
| | padding | radius | font |
|---|---|---|---|
| Sm | `6px 12px 8px` | 99px | 14px / 500 / -.42px |
| Md | `10px 12px 12px` | 99px | 14px / 500 |
| Lg | `10px 20px 12px`, height 76→160px@960 | **20px** | 24px / 500 / -.96px |
- 공통: `border: 1px solid buttonColor`, `background: transparent`, `width: 100%`, hover → 배경 `buttonColor`, 글자 `backgroundColor` (완전 반전), Lg만 `transition: all 80ms`
- `90s-vibes` 테마에선 Win95 베벨(`border: 2px outset`, `box-shadow: inset …` 4겹) 로 오버라이드

### 5-5. 피처드 카드 `FeaturedPost` + `Art` (윈도우 프레임)
- 12열 span, 이미지 1~7열 / 카피 7~12열, `gap: 20px`, 두 카드 사이 `.5px dashed` 세로 구분선(`separator:before`)
- **`Art` = 드래그 가능한 OS 창**: `aspect-ratio: 302/252`, `border: 1px solid artStroke`, `cursor: grab`, 상단 `Chrome` 타이틀바 `height: 20px` + `[ Fig. 1 ]` 캡션(8px mono) + `10x` 뱃지, 마운트 시 `.3s fadein`
- 제목 hover 시 **형광펜 효과**: `background-image: linear-gradient(transparent var(--overlap), highlightColor var(--overlap))` — 글자 아래쪽만 채워 마커펜처럼 보임. `--overlap: calc(3px + .3vw)`
- CTA `More posts →` = `.buttonSm`, 화살표 svg `calc(.33vw + 11.5px)`

### 5-6. 통계 마퀴 `StatisticsTicker`
- `animation: 25s linear infinite` translateX, 항목 3세트 복제로 무한 루프, hover 시 `animation-play-state: paused`
- 항목: `border-right: 1px dotted`, `padding: 0 12px`, 숫자는 `Tag` 스타일

### 5-7. 필터 `Directory` + `Filter` (사이드 패널)
- `Directory__toggle` 버튼 (`Type ▾`, `Topic ▾`) + 셰브론 `rotate(-90deg → 0)`, `transition .3s cubic-bezier(.19,1,.22,1)`
- 옵션 리스트: `border-left: 1px dotted`, `margin-left: 7px`, `padding-left: 12px`, `gap: 8px`, 픽셀 체크박스 아이콘 15×14 `image-rendering: pixelated`, 비활성 `opacity: .4`
- 옵션 텍스트 `text-xs`, 비활성 `filterTextInactive`, 활성 = 라임 배경 반전, 카운트 `(6)` 붙임
- **모바일(≤959px)**: 세로 리스트 → 가로 스크롤 칩 (`overflow-x: auto`, 스크롤바 숨김, 양끝 `mask-image` 페이드), 체크박스 숨김, 토글에 `border-right: 1px dotted`

### 5-8. 피드 리스트 `ListItem` / `FeedListItem` / `AccordionListItem`
- 행: `border-bottom: .5px solid borderColor`, `padding: 10px 0`, subgrid — 날짜(1~3열, smallcaps) · 제목(3~14열, ellipsis) · 타입(15~17열) · 토글(-2/-1)
- **행 전체 hover → 라임 배경** + 모든 자식 `color: invertedTextColor`, 화살표 `opacity 0→1 .15s`
- 아코디언 열림: 제목 `white-space: normal`, `+` 아이콘의 세로선 `scale(0)` (→ `−`), `transition .6s cubic-bezier(.19,1,.22,1)`

### 5-9. 라우터 섹션 `RouterSection` / `RouterObjective` (Get started 목차)
- 좌 1~7열 **sticky TOC** (`top: 60px`, ≥960px만 표시) / 우 8~25열 리스트
- 각 objective: 제목·본문(1~8열) + 메인 CTA `.buttonSm`(1~5열) + 링크 리스트(9열~끝), 하단 `.5px solid`, `padding-bottom: 28px`
- 링크 행: `padding: 12px 0`, `border-bottom: 1px dotted`, hover 라임 반전, 우측 화살표 아이콘
- `SquareIcon` 8×8 정사각형 불릿 (`background: squareTextColor`)

### 5-10. 도움말 `GetHelpTopic`
- 12열 span, 4행 grid (`auto 1fr auto auto`), `row-gap: 24px`, 예시 링크 리스트 `1px dotted` 구분

### 5-11. 콘솔 `Console` (터미널 이스터에그)
- `viewport` 전체 화면 `100dvh` 오버레이, `frame` = 창 (`windowFrameBG`, `1px solid windowBarText`, `padding 8px 4px 4px`)
- 모드 2종: `modeFloat` (560×490, 우하단 12px) / `modeBottom` (100% × 350px 하단 고정)
- 내부 `terminal`: `terminalBackground`, `radius 4px`, `padding 10px`; 상단바 12px 아이콘 버튼(닫기/플로트)

### 5-12. 푸터 `Footer` + `EndlessFooter`
- `border-top: .5px solid`, `margin-top: 100→160px`, 5행 grid(`auto 164px auto 164px auto`)
- 배경 아이콘 8개를 3열씩 배치(`grid-column: 1/4, 4/7 …`), 마지막은 `translate(50%)`로 반쯤 잘리게
- 좌 1~6열 Docs 설명+버튼, 우 19~23열 Social/Resources 링크(`Tag` 스타일, `gap: 2px`), 하단 `© 2026 Stripe, Inc.` / Privacy·Legal
- `EndlessFooter`: `height: 200vh` + `position: fixed` 캔버스 — 스크롤 끝에서 배경 아트가 계속 이어지는 효과

### 5-13. 히어로 `Hero`
- `margin-top: 64px`, 제목 1~15열, 서브타이틀 3행/1~15열 `padding-top: 50px`, 우측 21열~ `GlobeIcon` (`--iconWidth` 63→88px 유동)
- 배경에 `BackgroundIcon`(`+` 십자 아이콘) 격자 — `backgroundIconColor`

---

## 6. 인터랙션/모션 요약

| 패턴 | 값 |
|---|---|
| hover 반전 | `background: highlightColor; color: invertedTextColor` (transition 없음 — 즉각) |
| 링크 hover | `border-bottom 1px solid` + 배경 라임, `transition: background-color .1s linear` |
| 셰브론/아코디언 | `cubic-bezier(.19,1,.22,1)` (easeOutExpo) `.3s` / `.6s` |
| 화살표 페이드 | `opacity .15s linear` |
| 카드 등장 | `fadein .3s forwards` |
| 마퀴 | `25s linear infinite`, hover pause |
| 큰 버튼 | `transition: all 80ms ease-in-out` |
| 접근성 | `@media (prefers-reduced-motion: reduce)` 분기 존재, `.srOnly` h1 |

---

## 7. 주차별 컴포넌트 작업 제안

컴포넌트 의존 순서(토큰 → 원자 → 조합 → 페이지)로 5주 구성. 각 주 산출물이 다음 주의 재료가 됩니다.

| 주차 | 테마 | 만들 것 | 완료 기준 |
|---|---|---|---|
| **1주차** | 파운데이션 | `tokens.css` 적용, 폰트 대체(Inter+JetBrains Mono), 24열 subgrid 레이아웃, 타이포 7단계, 테마 스위처(`data-theme` + 최소 default/night-owl) | 빈 페이지에서 테마 토글 시 모든 색이 바뀜, 그리드 오버레이로 열 정렬 확인 |
| **2주차** | 원자 컴포넌트 | `Tag`, `Button(Sm/Md/Lg)`, `TableHeader`(`/라벨`), `SquareIcon`, `NavButton`(`[B] 라벨` + hotkey) | 각 컴포넌트 hover/active/visited 반전 동작, 스토리북 또는 데모 페이지 |
| **3주차** | 리스트 & 필터 | `ListItem`/`FeedListItem`(행 hover 반전, 아코디언 `+/−`), `Directory`+`Filter`(데스크톱 세로 / 모바일 가로 칩 마스크), `SectionTitle` + 카운터 | 필터 클릭 → 리스트 카운트 갱신, 959px 경계에서 레이아웃 전환 |
| **4주차** | 조합 컴포넌트 | `Nav`(fixed + blur + 키보드 단축키), `FeaturedPost` + `Art` 윈도우 프레임(드래그, `[Fig.n]`), 형광펜 hover, `StatisticsTicker` 마퀴 | 키보드 `B/E/D` 로 네비 이동, 마퀴 hover pause, 카드 hover 시 제목 형광펜 |
| **5주차** | 페이지 & 마감 | `Hero` + `BackgroundIcon` 격자, `RouterSection`(sticky TOC), `Footer`/`EndlessFooter`, (선택) `Console` 터미널 창, `prefers-reduced-motion` 대응 | 홈 1페이지 완성, Lighthouse 접근성 90+, 모션 감소 설정 시 애니메이션 정지 |

**선택 확장**: `90s-vibes`처럼 폰트·버튼 베벨까지 갈아엎는 "풀 테마" 1종 추가 (테마 시스템이 토큰 이상을 커버하는지 검증).

---

## 8. 적용 시 주의

- **Söhne 폰트는 사용 불가** (상용 라이선스). 유동 폰트 크기 `calc(a·vw + b)` 공식은 그대로 쓰되 대체 폰트에 맞춰 tracking을 약 +0.01em 완화 권장.
- 액센트 `#c4e817` 위 `#1e1e1e` 텍스트 대비 ≈ 11:1 (AAA). 다크 테마(night-owl) 반전 텍스트는 `invertedTextColor: #011627` on `#AAE87B` ≈ 12:1.
- `subgrid`는 Safari 16+/Chrome 117+ — 구형 브라우저 지원이 필요하면 섹션마다 grid 재선언 폴백.
- 알파 계층(`#1e1e1e44`, `#1e1e1e11`)은 **배경이 바뀌면 같이 바뀌므로** 테마마다 실제 hex를 따로 정의한 원본 방식을 따를 것 (themes.json 참고).
