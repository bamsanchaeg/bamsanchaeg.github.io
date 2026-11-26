# Cabinet

> 성균관대 재즈 동아리 **Groov**를 위한 픽셀 게임. 캠퍼스를 걸으며 곡을 추천하고 보관하고, 잼 세션과 공연을 함께 꾸린다.

- 주소: https://bamsanchaeg.github.io/
- 무엇을 왜 만드는지: [PROJECT.md](PROJECT.md)

## 할 수 있는 것

- **추천곡과 내 방** — 곡을 추천하고, 상자와 책장으로 꾸민 내 방에 보관한다
- **잼 세션** — 곡과 파트를 미리 적고 빈자리를 신청하거나 초대한다. 낫컴플리트 무대에서 연주해 본다
- **광장** — 금잔디광장 게시판에서 공지와 공연 소식을 보고, 지난 공연을 다시 찾는다
- **편지와 초대장** — 부원끼리 편지를 주고받고, 공연 초대장과 가입 초대장을 보낸다

- **배경음악** — 동아리방과 각자의 방, 캠퍼스 지도에서 서로 다른 곡이 흐르고, 낫컴플리트에서는 조용하다. 위쪽 ♪ 버튼으로 끈다

가입한 뒤 동아리 리더가 승인한 부원만 글을 보고 쓸 수 있다.

## 조작

방향키·클릭 이동, Shift 스쿠터, Enter 조사, R 푸른방, M 지도, C 아카이브, P 광장, L 우편함

## 직접 실행

```bash
python3 -m http.server 8477 --bind 127.0.0.1 --directory prototype
```

브라우저에서 `http://localhost:8477/village.html`을 연다.

`prototype/village.html`은 `prototype/src`를 묶어 만드는 파일이다. 직접 고치지 말고 `src`를 고친 뒤 `python3 tools/build_skku.py`로 다시 묶는다.

## 출처

지도 © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors
