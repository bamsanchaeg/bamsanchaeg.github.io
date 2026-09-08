---
title: "CSS Grid로 게시판 레이아웃 정리하기"
category: CSS
tags: [CSS, Grid, 반응형]
---

게시물 번호, 제목, 날짜처럼 열의 관계가 중요한 화면에는 Grid가 잘 어울린다.

```css
.post-row {
  display: grid;
  grid-template-columns: 3rem 1fr 5rem;
  gap: 1rem;
}
```

화면이 좁아지면 번호를 숨기고 날짜를 제목 아래로 옮기는 식으로 읽는 순서를 유지할 수 있다.

## 기억할 점

고정 폭은 최소한으로 쓰고, 핵심 내용이 들어가는 제목 열에 `1fr`을 배정한다.

