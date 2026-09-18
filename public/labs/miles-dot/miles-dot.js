/**
 * 재즈 아티스트 도트 낙서
 *
 * 45초 안에 참조 사진의 실루엣을 분필로 그리면, 그림을 N×N 도트로 줄여 참조 사진의
 * 윤곽선과 비교해 점수를 매기는 미니 게임. 서버 없이 localStorage 만 쓴다.
 *
 * 구성 (의존 순서대로):
 *   1. 상수 · DOM 헬퍼
 *   2. 기본 그림 (사진이 없을 때의 폴백 · 예시 낙서)
 *   3. 픽셀화 — 캔버스를 격자로 줄이는 세 가지 방법
 *   4. 격자 → 화면
 *   5. 비교 · 채점
 *   6. 상태
 *   7. 점수판 · 명예의 전당 렌더
 *   8. 참조 사진 관리
 *   9. 그림판
 *  10. 라운드 · 타이머
 *  11. 부팅
 *
 * 스타일: Airbnb JavaScript Style Guide (ES modules, const/let, 화살표 함수, 세미콜론,
 * 2칸 들여쓰기, 템플릿 리터럴, `+= 1`, 비트 연산은 해시·난수 두 곳만 예외로 허용).
 */

/* ------------------------------------------------------------------------
 * 1. 상수 · DOM 헬퍼
 * ---------------------------------------------------------------------- */

/** 그림판·참조 캔버스의 내부 해상도(px). CSS 로 늘려 보여준다. */
const CANVAS_SIZE = 480;
/** 기본 참조 사진 경로. 같은 폴더의 ref.jpg. */
const DEFAULT_REF = 'ref.jpg';
const DEFAULT_ARTIST = '마일스 데이비스';
/** 분필색. 그림판의 선 색이자 도트 팔레트의 가장 밝은 단계. */
const CHALK = '#f2f4f7';
/** 도트 명암 단계 수. */
const LEVELS = 8;
/** 라운드 제한 시간(초). */
const ROUND_SECONDS = 45;
/** 되돌리기 스택 최대 깊이. ImageData 하나가 480×480×4 바이트라 무한정 쌓지 않는다. */
const UNDO_LIMIT = 30;
/** 명예의 전당 표시 인원. */
const BOARD_SIZE = 10;

/** localStorage 키. 버전 접미사는 저장 형식이 바뀔 때 올린다. */
const STORAGE = {
  ref: 'miles-dot-ref-v1',
  artist: 'miles-dot-artist-v1',
  boardPrefix: 'miles-dot-board-v5:',
};

/** 8단계 명암 팔레트. 검정(0) → 분필색(7) 을 선형 보간. */
const CHALK_RGB = [242, 244, 247];
const LEVEL_RGB = Array.from({ length: LEVELS }, (_, level) => (
  CHALK_RGB.map((channel) => Math.round((channel * level) / (LEVELS - 1)))
));

/** id 로 요소 찾기. 이 파일 안에서만 쓰는 축약. */
const $ = (id) => document.getElementById(id);

/** size×size 오프스크린 캔버스. */
function createCanvas(size) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * 시드 고정 난수 생성기 (LCG). 예시 낙서의 "손 떨림" 을 매번 똑같이 재현하려고 쓴다.
 * 32비트 정수 산술이 필요해 이 함수에서만 비트 연산을 허용한다.
 */
function createRandom(seed) {
  /* eslint-disable no-bitwise */
  let x = (seed >>> 0) || 1;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 4294967296;
  };
  /* eslint-enable no-bitwise */
}

/**
 * 격자(0/1 또는 0~7)의 FNV-1a 해시. 참조 사진마다 명예의 전당을 따로 두기 위한 키.
 * 같은 사진을 다시 올리면 같은 해시가 나와 기록이 이어진다.
 */
function hashGrid(grid) {
  /* eslint-disable no-bitwise */
  let hash = 2166136261;
  for (let i = 0; i < grid.length; i += 1) {
    hash ^= grid[i];
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16);
  /* eslint-enable no-bitwise */
}

/* ------------------------------------------------------------------------
 * 2. 기본 그림
 *    사진을 못 불러올 때의 폴백이자, 시작 전 무대에 보여주는 "예시 낙서" 의 원본.
 *    좌표는 ref.jpg 의 구도를 따라 손으로 찍은 것.
 * ---------------------------------------------------------------------- */

/**
 * 트럼펫을 든 인물을 선으로 그린다.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} [options]
 * @param {number} [options.seed=1]   손 떨림 난수 시드
 * @param {number} [options.jitter=0] 각 점을 흔드는 최대 px. 0 이면 정확한 선
 * @param {number} [options.width=5]  기본 선 굵기
 * @param {number} [options.dx=0]     x 이동
 * @param {number} [options.dy=0]     y 이동
 * @param {number} [options.scale=1]  배율
 */
function drawFigure(ctx, options = {}) {
  const {
    seed = 1, jitter = 0, width = 5, dx = 0, dy = 0, scale = 1,
  } = options;
  const random = createRandom(seed);
  const jitterPoint = ([x, y]) => [
    x + (random() - 0.5) * 2 * jitter,
    y + (random() - 0.5) * 2 * jitter,
  ];
  const stroke = (points, close = false, lineWidth = width) => {
    const path = points.map(jitterPoint);
    ctx.beginPath();
    ctx.moveTo(path[0][0], path[0][1]);
    path.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    if (close) ctx.closePath();
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  };
  const ellipse = (x, y, rx, ry) => {
    const [cx, cy] = jitterPoint([x, y]);
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.lineWidth = width;
    ctx.stroke();
  };

  ctx.save();
  ctx.translate(dx, dy);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#000';
  ctx.fillRect(-CANVAS_SIZE, -CANVAS_SIZE, CANVAS_SIZE * 3, CANVAS_SIZE * 3);
  ctx.strokeStyle = CHALK;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // 머리
  ellipse(361, 44, 23, 23);
  stroke([[343, 30], [358, 20], [380, 24], [388, 44]]); // 머리카락 경계
  stroke([[347, 34], [340, 44], [343, 55], [338, 63], [344, 72], [352, 75]]); // 옆얼굴
  stroke([[338, 53], [356, 51]], false, 3); // 안경
  ellipse(346, 53, 5, 4);
  ellipse(379, 50, 5, 6); // 귀

  // 목 · 민소매
  stroke([[352, 72], [350, 86]]);
  stroke([[378, 84], [386, 116]]);
  stroke([[333, 119], [352, 111], [369, 127], [391, 111], [409, 119]]); // 목선 · 어깨끈
  stroke([[352, 111], [356, 86]]);
  stroke([[391, 111], [386, 90]]);
  stroke([[333, 119], [321, 207]]); // 옆선
  stroke([[409, 119], [405, 199]]);
  stroke([[321, 207], [405, 199]]); // 밑단
  stroke([[333, 207], [331, 235], [336, 258]], false, 3); // 늘어진 끈

  // 팔
  stroke([[389, 119], [322, 142], [289, 92]], false, 9); // 앞팔 (굵게)
  stroke([[395, 132], [344, 164], [306, 118]]); // 뒷팔
  ellipse(289, 92, 12, 12); // 손
  ellipse(301, 101, 11, 11);

  // 트럼펫
  stroke([[345, 76], [212, 96]], false, 7);
  stroke([[300, 96], [222, 108]], false, 3);
  [262, 274, 286].forEach((x) => stroke([[x, 74], [x, 104]], false, 4)); // 밸브
  ellipse(203, 99, 22, 18); // 벨

  // 바지 · 발
  stroke([[321, 199], [298, 262], [266, 300], [241, 334], [258, 420], [269, 470]]);
  stroke([[409, 203], [400, 258], [374, 298], [352, 340], [340, 400], [331, 470]]);
  stroke([[300, 262], [352, 338]], false, 3); // 주름
  stroke([[262, 330], [290, 400], [300, 468]], false, 3);
  stroke([[269, 470], [262, 479], [337, 479], [331, 470]]); // 발

  ctx.restore();
}

/** 정확한 선의 기본 그림. 사진이 없을 때 참조로 쓴다. */
const baseFigure = createCanvas(CANVAS_SIZE);
drawFigure(baseFigure.getContext('2d'));

/** 예시 낙서: 같은 인물을 살짝 어긋나게, 흔들리는 선으로. 시작 전 무대에 보여준다. */
function createSampleDoodle() {
  const canvas = createCanvas(CANVAS_SIZE);
  drawFigure(canvas.getContext('2d'), {
    jitter: 3, seed: 5, dx: -9, dy: 6, scale: 0.985, width: 6,
  });
  return canvas;
}

/* ------------------------------------------------------------------------
 * 3. 픽셀화
 *
 *    480×480 캔버스(사진 또는 내 그림)를 N×N(기본 48×48) 격자로 줄이는 과정.
 *    "픽셀화" 란 여러 픽셀을 한 칸으로 합치는 일이고, 여기서는 세 가지 결과물을 만든다.
 *
 *      toToneGrid  사진 → 8단계 명암 격자    (화면에 보여주는 도트)
 *      toEdgeGrid  사진 → 윤곽선 격자 (0/1)  (채점 기준)
 *      toInkGrid   내 그림 → 선 격자 (0/1)   (채점 대상)
 *
 *    셋 다 toGray() 로 시작한다. toGray() 가 "축소 + 흑백화" 를 맡고, 각 함수는
 *    그 결과를 어떻게 이진화/양자화할지만 다르다.
 * ---------------------------------------------------------------------- */

/**
 * 어떤 캔버스든 size×size 밝기 배열(0~255)로 바꾼다.
 *
 * - 축소: drawImage 로 두 번에 나눠 줄인다 (480 → 256 → size). 한 번에 480→48 로 줄이면
 *   브라우저가 픽셀 대부분을 건너뛰어(샘플링) 선이 끊긴다. imageSmoothingQuality='high'
 *   와 2단계 축소를 쓰면 여러 픽셀의 평균이 한 칸에 담긴다.
 * - 흑백화: 눈의 감도에 맞춘 가중 평균 Y = 0.299R + 0.587G + 0.114B (ITU-R BT.601).
 * - 결과: 길이 size² 의 Float32Array. 인덱스 i = y * size + x.
 */
function toGray(source, size) {
  const mid = createCanvas(256);
  const midCtx = mid.getContext('2d');
  midCtx.fillStyle = '#000';
  midCtx.fillRect(0, 0, 256, 256);
  midCtx.imageSmoothingEnabled = true;
  midCtx.imageSmoothingQuality = 'high';
  midCtx.drawImage(source, 0, 0, 256, 256); // 1단계 축소

  const out = createCanvas(size);
  const outCtx = out.getContext('2d');
  outCtx.fillStyle = '#000';
  outCtx.fillRect(0, 0, size, size);
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = 'high';
  outCtx.drawImage(mid, 0, 0, size, size); // 2단계 축소

  const { data } = outCtx.getImageData(0, 0, size, size); // [R,G,B,A, R,G,B,A, ...]
  const gray = new Float32Array(size * size);
  for (let i = 0; i < size * size; i += 1) {
    gray[i] = (data[i * 4] * 299 + data[i * 4 + 1] * 587 + data[i * 4 + 2] * 114) / 1000;
  }
  return gray;
}

/**
 * 내 그림(검은 무대 + 흰 분필)을 "선이 있는 칸 = 1" 로 이진화.
 * 임계값 60: 한 칸(480/48 = 10px)에 분필이 1/4 쯤만 걸쳐도 평균 밝기가 60 을 넘는다.
 * → 선이 칸 경계를 지나가도 끊기지 않고, 흐릿한 지우개 자국은 0 으로 떨어진다.
 */
function toInkGrid(source, size) {
  const gray = toGray(source, size);
  const out = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i += 1) {
    out[i] = gray[i] >= 60 ? 1 : 0;
  }
  return out;
}

/**
 * 사진에서 윤곽선만 뽑아 size×size 격자(0/1)로 만든다. 채점의 기준.
 * 사진에는 "선" 이 없으므로 밝기가 급격히 바뀌는 곳(인물과 배경의 경계)을 선으로 간주한다.
 *
 * 1) 2size×2size 로 축소 — 두 배 해상도에서 경계를 찾고 나중에 합친다.
 * 2) 3×3 평균 블러 — 필름 입자·JPEG 잡티가 가짜 경계로 잡히는 걸 막는다.
 * 3) 소벨(Sobel) 필터 — 가로 변화 gx, 세로 변화 gy. 크기 = √(gx² + gy²).
 *        gx 커널          gy 커널
 *       -1  0 +1         -1 -2 -1
 *       -2  0 +2          0  0  0
 *       -1  0 +1         +1 +2 +1
 * 4) 백분위 임계값 — 절대값 대신 상위 몇 % 만 남긴다. 어두운 사진이든 밝은 사진이든
 *    비슷한 양의 선이 나오게 하려는 것. sensitivity(0~1)에 따라 상위 4%~18%.
 *    Math.max(30, …) 은 거의 단색인 사진에서 노이즈까지 선으로 잡히는 걸 막는 하한.
 * 5) 2×2 max pooling — 2size 격자의 네 칸 중 하나라도 경계면 size 격자의 그 칸을 1 로.
 *
 * @param {HTMLCanvasElement} source
 * @param {number} size         결과 격자 한 변
 * @param {number} sensitivity  윤곽 민감도 0~1 (슬라이더)
 */
function toEdgeGrid(source, size, sensitivity) {
  const doubled = size * 2;
  const gray = toGray(source, doubled);

  // 2) 3×3 평균 블러
  const blurred = new Float32Array(doubled * doubled);
  for (let y = 0; y < doubled; y += 1) {
    for (let x = 0; x < doubled; x += 1) {
      let sum = 0;
      let count = 0;
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dx = -1; dx <= 1; dx += 1) {
          const yy = y + dy;
          const xx = x + dx;
          if (yy >= 0 && yy < doubled && xx >= 0 && xx < doubled) {
            sum += gray[yy * doubled + xx];
            count += 1;
          }
        }
      }
      blurred[y * doubled + x] = sum / count;
    }
  }

  // 3) 소벨 필터
  const at = (y, x) => blurred[y * doubled + x];
  const magnitude = new Float32Array(doubled * doubled);
  for (let y = 1; y < doubled - 1; y += 1) {
    for (let x = 1; x < doubled - 1; x += 1) {
      const gx = -at(y - 1, x - 1) - 2 * at(y, x - 1) - at(y + 1, x - 1)
        + at(y - 1, x + 1) + 2 * at(y, x + 1) + at(y + 1, x + 1);
      const gy = -at(y - 1, x - 1) - 2 * at(y - 1, x) - at(y - 1, x + 1)
        + at(y + 1, x - 1) + 2 * at(y + 1, x) + at(y + 1, x + 1);
      magnitude[y * doubled + x] = Math.hypot(gx, gy);
    }
  }

  // 4) 백분위 임계값
  const percentile = 0.96 - sensitivity * 0.14;
  const sorted = Array.from(magnitude).sort((a, b) => a - b);
  const threshold = Math.max(30, sorted[Math.floor(sorted.length * percentile)]);

  // 5) 2×2 max pooling
  const out = new Uint8Array(size * size);
  for (let y = 0; y < doubled; y += 1) {
    for (let x = 0; x < doubled; x += 1) {
      if (magnitude[y * doubled + x] >= threshold) {
        out[Math.floor(y / 2) * size + Math.floor(x / 2)] = 1;
      }
    }
  }
  return out;
}

/**
 * 사진을 size×size, 8단계 명암으로 양자화. 화면에 보여주는 도트 그림.
 * 밝기 0~255 를 32 씩 끊어 0~7 단계로 (256 / 8 = 32). 채점에는 쓰지 않는다.
 */
function toToneGrid(source, size) {
  const gray = toGray(source, size);
  const out = new Uint8Array(size * size);
  for (let i = 0; i < size * size; i += 1) {
    out[i] = Math.min(LEVELS - 1, Math.floor(gray[i] / 32));
  }
  return out;
}

/* ------------------------------------------------------------------------
 * 4. 격자 → 화면
 *    캔버스 자체를 size×size 로 만들고 CSS(image-rendering: pixelated)로 확대한다.
 *    한 칸 = 캔버스의 1px 이고, 브라우저가 보간 없이 네모난 도트로 키워 준다.
 * ---------------------------------------------------------------------- */

/** 8단계 격자 → 검정~분필색 팔레트로 칠한다. */
function paintTones(canvas, grid, size) {
  const target = canvas;
  target.width = size;
  target.height = size;
  const ctx = target.getContext('2d');
  const image = ctx.createImageData(size, size);
  for (let i = 0; i < size * size; i += 1) {
    const [r, g, b] = LEVEL_RGB[grid[i]];
    image.data[i * 4] = r;
    image.data[i * 4 + 1] = g;
    image.data[i * 4 + 2] = b;
    image.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
}

/** 0/1 격자 → 검정 바탕에 분필색 점. */
function paintGrid(canvas, grid, size, color = CHALK) {
  const target = canvas;
  target.width = size;
  target.height = size;
  const ctx = target.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = color;
  for (let i = 0; i < size * size; i += 1) {
    if (grid[i]) ctx.fillRect(i % size, Math.floor(i / size), 1, 1);
  }
}

/* ------------------------------------------------------------------------
 * 5. 비교 · 채점
 *    두 격자(내 선, 기준 윤곽 — 모두 0/1)를 칸 단위로 맞춰 본다.
 *
 *    - dilate: 1 을 상하좌우·대각 한 칸씩 부풀린다 → "한 칸 오차는 봐준다" 의 구현.
 *    - 정밀도 P = 내 선 중 (부풀린) 기준 위에 놓인 비율 → 엉뚱한 곳에 그리면 떨어진다.
 *    - 재현율 R = 기준 윤곽 중 (부풀린) 내 선이 덮은 비율 → 덜 그리면 떨어진다.
 *    - 윤곽 점수 = 2PR / (P + R) (조화평균, F1). 둘 중 하나만 높아선 안 된다.
 *    - 배치 점수 = 8×8 구역별 선 개수 벡터의 코사인 유사도. 전체적인 위치 분포.
 *    - 총점 = (0.8·윤곽 + 0.2·배치)^1.25 × 100. 지수 1.25 가 중간 점수를 눌러 변별력을 키운다.
 * ---------------------------------------------------------------------- */

/** 격자의 1 을 8방향 한 칸씩 부풀린다. */
function dilate(grid, size) {
  const out = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (grid[y * size + x]) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy >= 0 && yy < size && xx >= 0 && xx < size) out[yy * size + xx] = 1;
          }
        }
      }
    }
  }
  return out;
}

/** 8×8 구역별 선 개수 히스토그램. */
function density(grid, size) {
  const regions = 8;
  const cell = size / regions;
  const histogram = new Float64Array(regions * regions);
  for (let i = 0; i < size * size; i += 1) {
    if (grid[i]) {
      const row = Math.floor(Math.floor(i / size) / cell);
      const col = Math.floor((i % size) / cell);
      histogram[row * regions + col] += 1;
    }
  }
  return histogram;
}

/** 두 벡터의 코사인 유사도 (0~1). 둘 중 하나가 영벡터면 0. */
function cosine(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

/**
 * 내 선 격자와 기준 윤곽 격자를 비교한다.
 * @returns {{shape:number, layout:number, total:number, mark:Uint8Array}}
 *   mark[i] = 1: 기준에 없는 내 선(여긴 없어도 돼요) · 2: 내가 못 덮은 기준(여길 그려 보세요)
 */
function compare(inkGrid, refGrid, size) {
  const inkDilated = dilate(inkGrid, size);
  const refDilated = dilate(refGrid, size);
  const mark = new Uint8Array(size * size);
  let inkCount = 0;
  let refCount = 0;
  let hit = 0;
  let covered = 0;
  for (let i = 0; i < size * size; i += 1) {
    if (inkGrid[i]) {
      inkCount += 1;
      if (refDilated[i]) hit += 1;
      else mark[i] = 1;
    }
    if (refGrid[i]) {
      refCount += 1;
      if (inkDilated[i]) covered += 1;
      else mark[i] = 2;
    }
  }
  // 거의 안 그렸으면 0점 — 점 하나로 정밀도 100% 를 받는 편법 방지
  if (inkCount < refCount * 0.03) {
    return {
      shape: 0, layout: 0, total: 0, mark,
    };
  }
  const precision = hit / inkCount;
  const recall = covered / refCount;
  const shape = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const layout = cosine(density(inkGrid, size), density(refGrid, size));
  const total = Math.round(100 * (0.8 * shape + 0.2 * layout) ** 1.25);
  return {
    shape, layout, total, mark,
  };
}

/** 총점에 따른 한 줄 평. */
function verdictFor(total, artist) {
  if (total >= 85) return `대단해요! ${artist} 본인도 깜짝 놀라겠는걸요!`;
  if (total >= 70) return '훌륭해요! 무대 조명이 당신을 비추고 있어요.';
  if (total >= 55) return '좋아요! 연주 소리가 들리기 시작했어요.';
  if (total >= 40) return '괜찮아요! 형태가 잡히고 있어요. 조금만 더!';
  if (total >= 25) return '포기하지 마세요! 실루엣이 보일락 말락 해요.';
  return '무대가 비어 있어요. 분필을 들어 볼까요?';
}

/* ------------------------------------------------------------------------
 * 6. 상태
 *    흩어진 전역 대신 한 객체에 모은다. 값을 바꾸는 곳이 어디인지 grep 하기 쉽다.
 * ---------------------------------------------------------------------- */

const state = {
  // 참조 사진
  gridSize: 48, // N — 도트 한 변
  fit: 'contain', // 'contain' | 'cover'
  sensitivity: 0.5, // 윤곽 민감도 0~1
  refImage: null, // HTMLImageElement | null
  refKind: 'silhouette', // 'upload' | 'file' | 'silhouette'
  refGrid: null, // 채점 기준 (0/1)
  refHash: '', // 명예의 전당 키
  artist: DEFAULT_ARTIST,

  // 그림판
  tone: 1, // 1 = 분필, 0 = 지우개
  brushSize: 7,
  drawing: false,
  lastPoint: null,
  undoStack: [],
  frameQueued: false, // requestAnimationFrame 중복 방지

  // 라운드
  phase: 'idle', // 'idle' | 'playing' | 'done'
  startedAt: 0,
  timerId: 0,
  score: null, // compare() 결과
  submittedId: null, // 이번 라운드에 남긴 기록 id (중복 제출 방지)
};

/** 참조 사진을 480×480 으로 맞춘 캔버스. 픽셀화의 입력. */
const refSource = createCanvas(CANVAS_SIZE);
const refCanvas = $('ref');
const drawCanvas = $('draw');
const drawCtx = drawCanvas.getContext('2d');

/* ------------------------------------------------------------------------
 * 7. 점수판 · 명예의 전당
 * ---------------------------------------------------------------------- */

/** 현재 참조 사진의 명예의 전당 키. 사진마다 따로 저장한다. */
const boardKey = () => `${STORAGE.boardPrefix}${state.refHash}`;

function loadBoard() {
  try {
    return JSON.parse(localStorage.getItem(boardKey())) || [];
  } catch (error) {
    return []; // 사생활 모드 등에서 localStorage 를 못 쓰면 빈 판
  }
}

function saveBoard(entries) {
  try {
    localStorage.setItem(boardKey(), JSON.stringify(entries));
  } catch (error) {
    // 저장 실패는 조용히 무시 — 게임 진행에는 영향 없음
  }
}

/** HTML 로 삽입할 사용자 입력(닉네임) 이스케이프. */
function escapeHtml(value) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return String(value).replace(/[&<>"']/g, (char) => map[char]);
}

/** 상위 BOARD_SIZE 명을 그린다. 방금 남긴 기록은 .me 로 강조. */
function renderBoard() {
  const entries = loadBoard().sort((a, b) => b.score - a.score).slice(0, BOARD_SIZE);
  const list = $('board');
  list.innerHTML = '';
  if (!entries.length) {
    list.innerHTML = '<li class="empty">아직 아무도 없어요. 첫 번째 주인공이 되어 볼까요?</li>';
    return;
  }
  entries.forEach((entry, index) => {
    const item = document.createElement('li');
    if (entry.id === state.submittedId) item.className = 'me';
    item.innerHTML = `
      <span class="rk">${index + 1}</span>
      <img alt="" src="${entry.thumb}">
      <span class="nm">${escapeHtml(entry.name)}<small>${entry.n}×${entry.n}</small></span>
      <span class="sc">${entry.score}</span>`;
    list.appendChild(item);
  });
}

/** 내 그림을 도트로 줄여 채점하고, 미리보기·힌트·점수판을 갱신한다. 그릴 때마다 호출. */
function updateScore() {
  if (!state.refGrid) return;
  const { gridSize } = state;
  const inkGrid = toInkGrid(drawCanvas, gridSize);
  paintGrid($('pv'), inkGrid, gridSize);
  state.score = compare(inkGrid, state.refGrid, gridSize);

  // 힌트 오버레이: 주황 = 기준에 없는 내 선, 놋쇠 = 내가 못 덮은 기준
  const diffCanvas = $('diff');
  diffCanvas.width = gridSize;
  diffCanvas.height = gridSize;
  const diffCtx = diffCanvas.getContext('2d');
  diffCtx.clearRect(0, 0, gridSize, gridSize);
  if ($('show-diff').checked) {
    const { mark } = state.score;
    for (let i = 0; i < gridSize * gridSize; i += 1) {
      if (mark[i]) {
        diffCtx.fillStyle = mark[i] === 1 ? 'rgba(224, 96, 58, 0.8)' : 'rgba(201, 164, 92, 0.7)';
        diffCtx.fillRect(i % gridSize, Math.floor(i / gridSize), 1, 1);
      }
    }
  }

  const idle = state.phase === 'idle';
  const percent = (value) => (idle ? 0 : Math.round(value * 100));
  $('total').textContent = idle ? '—' : state.score.total;
  $('f-shape').style.width = `${percent(state.score.shape)}%`;
  $('v-shape').textContent = idle ? '—' : percent(state.score.shape);
  $('f-tone').style.width = `${percent(state.score.layout)}%`;
  $('v-tone').textContent = idle ? '—' : percent(state.score.layout);
  $('verdict').textContent = idle
    ? '시작하면 점수가 실시간으로 나와요.'
    : verdictFor(state.score.total, state.artist);
  $('submit').disabled = state.phase !== 'done'
    || state.score.total === 0
    || state.submittedId !== null;
}

/** 기록 남기기: 닉네임 + 점수 + 도트 썸네일을 이 사진의 명예의 전당에 저장. */
function submitScore() {
  if (!state.score) return;
  const entry = {
    id: `${Date.now()}${Math.random()}`,
    name: $('name').value.trim() || '이름 없는 연주자',
    score: state.score.total,
    n: state.gridSize,
    thumb: $('pv').toDataURL('image/png'),
    ts: Date.now(),
  };
  state.submittedId = entry.id;
  saveBoard([...loadBoard(), entry]);
  renderBoard();
  $('submit').disabled = true;
}

function resetBoard() {
  // eslint-disable-next-line no-alert
  if (window.confirm(`${state.artist} 명예의 전당 기록을 모두 지울까요? 되돌릴 수 없어요!`)) {
    saveBoard([]);
    state.submittedId = null;
    renderBoard();
  }
}

/* ------------------------------------------------------------------------
 * 8. 참조 사진 관리
 *    우선순위: 업로드한 사진 > ref.jpg > 기본 그림(선 드로잉)
 * ---------------------------------------------------------------------- */

/** 참조 이미지를 480×480 검정 바탕에 contain/cover 로 맞춰 그린다. 없으면 기본 그림. */
function buildRefSource() {
  const ctx = refSource.getContext('2d');
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  if (!state.refImage) {
    ctx.drawImage(baseFigure, 0, 0);
    return;
  }
  const image = state.refImage;
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const ratio = state.fit === 'contain'
    ? Math.min(CANVAS_SIZE / width, CANVAS_SIZE / height)
    : Math.max(CANVAS_SIZE / width, CANVAS_SIZE / height);
  const w = width * ratio;
  const h = height * ratio;
  ctx.drawImage(image, (CANVAS_SIZE - w) / 2, (CANVAS_SIZE - h) / 2, w, h);
}

/**
 * 참조 사진이 바뀌거나(업로드·리셋) 설정이 바뀌면(도트 크기·맞춤·민감도·보기 옵션)
 * 채점 기준을 다시 만들고 왼쪽 패널을 다시 그린다.
 */
function rebuildRef() {
  const { gridSize } = state;
  buildRefSource();
  try {
    state.refGrid = state.refImage
      ? toEdgeGrid(refSource, gridSize, state.sensitivity)
      : toInkGrid(refSource, gridSize);
  } catch (error) {
    // file:// 로 열어 캔버스가 오염(tainted)된 경우 → 기본 그림으로 폴백
    state.refImage = null;
    state.refKind = 'silhouette';
    buildRefSource();
    state.refGrid = toInkGrid(refSource, gridSize);
  }

  // 왼쪽 패널: 원본 사진 / 채점용 윤곽 / 8단계 도트 중 하나
  if ($('show-src').checked) {
    refCanvas.className = 'smooth';
    refCanvas.width = CANVAS_SIZE;
    refCanvas.height = CANVAS_SIZE;
    refCanvas.getContext('2d').drawImage(refSource, 0, 0);
  } else if ($('show-edge').checked || !state.refImage) {
    refCanvas.className = '';
    paintGrid(refCanvas, state.refGrid, gridSize);
  } else {
    refCanvas.className = '';
    paintTones(refCanvas, toToneGrid(refSource, gridSize), gridSize);
  }

  const noteByKind = { upload: '불러온 사진', file: DEFAULT_REF, silhouette: '기본 그림' };
  $('ref-note').textContent = noteByKind[state.refKind];
  $('ref-reset').hidden = state.refKind !== 'upload';
  // 해시는 도트 크기와 무관하게 사진 자체로 — 32×32 톤 격자를 쓴다
  state.refHash = hashGrid(state.refImage ? toToneGrid(refSource, 32) : state.refGrid);
  renderBoard();
  $('pv-note').textContent = `${gridSize} × ${gridSize}`;
  $('h-sub').textContent = `${gridSize} × ${gridSize} · ${LEVELS} tones`;
  updateScore();
}

/** 아티스트 이름을 제목·문구·명예의 전당 라벨에 반영한다. persist 면 저장. */
function applyArtist(name, persist) {
  state.artist = (name || '').trim() || DEFAULT_ARTIST;
  const { artist } = state;
  $('h-artist').textContent = artist;
  document.title = `${artist} 도트 낙서`;
  document.querySelectorAll('.artist-name').forEach((el) => {
    el.textContent = artist; // eslint-disable-line no-param-reassign
  });
  $('board-note').textContent = artist;
  const input = $('artist');
  if (input.value !== artist && document.activeElement !== input) input.value = artist;
  if (persist) {
    try {
      localStorage.setItem(STORAGE.artist, artist);
    } catch (error) {
      // 저장 실패 무시
    }
  }
  if (state.score && state.phase !== 'idle') {
    $('verdict').textContent = verdictFor(state.score.total, artist);
  }
}

/** ref.jpg 를 불러온다. 실패하면(파일 없음·file:// 차단) 기본 그림으로. */
function loadDefaultRef(done) {
  const image = new Image();
  image.onload = () => {
    state.refImage = image;
    state.refKind = 'file';
    done();
  };
  image.onerror = () => {
    state.refImage = null;
    state.refKind = 'silhouette';
    done();
  };
  image.src = DEFAULT_REF;
}

/** 업로드한 사진을 256px 로 줄여 localStorage 에 보관 — 다음 방문에도 같은 사진으로. */
function persistUpload(image) {
  try {
    const thumb = createCanvas(256);
    const ctx = thumb.getContext('2d');
    const ratio = Math.min(256 / image.width, 256 / image.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 256, 256);
    ctx.drawImage(
      image,
      (256 - image.width * ratio) / 2,
      (256 - image.height * ratio) / 2,
      image.width * ratio,
      image.height * ratio,
    );
    localStorage.setItem(STORAGE.ref, thumb.toDataURL('image/jpeg', 0.85));
  } catch (error) {
    // 용량 초과 등 — 이번 세션에서만 쓰고 넘어간다
  }
}

/** 파일 선택: 사진을 참조로 쓰고, 파일명을 아티스트 이름 후보로 채운다. */
function handleFileChange(event) {
  const [file] = event.target.files;
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const image = new Image();
    image.onload = () => {
      state.refImage = image;
      state.refKind = 'upload';
      rebuildRef();
      persistUpload(image);
      const nameFromFile = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim();
      applyArtist(nameFromFile, true);
      $('artist').focus();
      $('artist').select();
    };
    image.src = reader.result;
  };
  reader.readAsDataURL(file);
  // 같은 파일을 다시 골라도 change 가 나도록 값 초기화
  const input = event.target;
  input.value = '';
}

/** "마일스 데이비스로 돌아가기": 저장한 사진·이름을 지우고 ref.jpg 로. */
function resetRef() {
  try {
    localStorage.removeItem(STORAGE.ref);
    localStorage.removeItem(STORAGE.artist);
  } catch (error) {
    // 무시
  }
  const input = $('artist');
  input.blur();
  input.value = DEFAULT_ARTIST;
  applyArtist(DEFAULT_ARTIST, false);
  loadDefaultRef(rebuildRef);
}

/* ------------------------------------------------------------------------
 * 9. 그림판
 *    포인터 이벤트로 480×480 캔버스에 분필/지우개. 그릴 때마다 rAF 로 채점 예약.
 * ---------------------------------------------------------------------- */

function clearStage() {
  drawCtx.fillStyle = '#000';
  drawCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
}

function pushUndo() {
  state.undoStack.push(drawCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE));
  if (state.undoStack.length > UNDO_LIMIT) state.undoStack.shift();
}

/** 화면 좌표 → 캔버스 내부 좌표 (CSS 로 늘려진 비율을 되돌린다). */
function pointFromEvent(event) {
  const rect = drawCanvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * CANVAS_SIZE) / rect.width,
    y: ((event.clientY - rect.top) * CANVAS_SIZE) / rect.height,
  };
}

/** 현재 도구에 맞춰 선 스타일 설정. 지우개는 분필보다 3배 굵게. */
function applyBrushStyle() {
  const chalk = state.tone === 1;
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';
  drawCtx.strokeStyle = chalk ? CHALK : '#000';
  drawCtx.fillStyle = drawCtx.strokeStyle;
  drawCtx.lineWidth = chalk ? state.brushSize : state.brushSize * 3;
}

/** 채점을 다음 프레임으로 미룬다. pointermove 가 초당 수백 번 와도 한 프레임에 한 번만. */
function scheduleScore() {
  if (state.frameQueued) return;
  state.frameQueued = true;
  requestAnimationFrame(() => {
    state.frameQueued = false;
    updateScore();
  });
}

function handlePointerDown(event) {
  if (state.phase !== 'playing') return;
  event.preventDefault();
  drawCanvas.setPointerCapture(event.pointerId);
  pushUndo();
  state.drawing = true;
  state.lastPoint = pointFromEvent(event);
  applyBrushStyle();
  // 점 하나 — 탭만 해도 찍히도록
  drawCtx.beginPath();
  drawCtx.arc(state.lastPoint.x, state.lastPoint.y, drawCtx.lineWidth / 2, 0, Math.PI * 2);
  drawCtx.fill();
  scheduleScore();
}

function handlePointerMove(event) {
  if (!state.drawing) return;
  const point = pointFromEvent(event);
  applyBrushStyle();
  drawCtx.beginPath();
  drawCtx.moveTo(state.lastPoint.x, state.lastPoint.y);
  drawCtx.lineTo(point.x, point.y);
  drawCtx.stroke();
  state.lastPoint = point;
  scheduleScore();
}

function handlePointerUp() {
  state.drawing = false;
}

function undo() {
  if (state.phase !== 'playing') return;
  const image = state.undoStack.pop();
  if (image) {
    drawCtx.putImageData(image, 0, 0);
    updateScore();
  }
}

function clearDrawing() {
  if (state.phase !== 'playing') return;
  pushUndo();
  clearStage();
  updateScore();
}

/* ------------------------------------------------------------------------
 * 10. 라운드 · 타이머
 *     idle(예시 낙서 + 게이트) → playing(45초) → done(점수 + 다시 도전)
 * ---------------------------------------------------------------------- */

const formatSeconds = (seconds) => `${Math.max(0, seconds).toFixed(1)}초`;

/** 게이트(무대 위 오버레이) 문구를 단계에 맞게 바꾼다. */
function setGate(phase) {
  $('gate').hidden = phase === 'playing';
  if (phase === 'idle') {
    $('gate-title').textContent = '무대에 오를 준비가 되었나요?';
    $('gate-big').hidden = true;
    $('gate-text').textContent = `제한 시간은 ${ROUND_SECONDS}초! 시작하면 예시 낙서가 지워지고 빈 무대가 나와요.`;
    $('start').textContent = '시작하기';
  }
  if (phase === 'done') {
    const total = state.score ? state.score.total : 0;
    $('gate-title').textContent = '시간 종료!';
    $('gate-big').hidden = false;
    $('gate-big').textContent = total;
    $('gate-text').textContent = state.score ? verdictFor(total, state.artist) : '';
    $('start').textContent = '다시 도전하기';
  }
}

function endRound() {
  state.phase = 'done';
  state.drawing = false;
  clearInterval(state.timerId);
  $('timer').textContent = formatSeconds(0);
  $('timebar').firstElementChild.style.width = '0%';
  $('undo').disabled = true;
  $('clear').disabled = true;
  updateScore();
  setGate('done');
}

/** 0.1초마다: 남은 시간 표시, 10초 이하면 경고색, 0 이면 종료. */
function tick() {
  const left = ROUND_SECONDS - (Date.now() - state.startedAt) / 1000;
  $('timer').textContent = formatSeconds(left);
  $('timebar').firstElementChild.style.width = `${Math.max(0, (left / ROUND_SECONDS) * 100)}%`;
  const urgent = left <= 10;
  $('timer').classList.toggle('urgent', urgent);
  $('timebar').classList.toggle('urgent', urgent);
  if (left <= 0) endRound();
}

function startRound() {
  state.phase = 'playing';
  state.undoStack = [];
  state.submittedId = null;
  clearStage();
  $('corner').textContent = '';
  $('undo').disabled = false;
  $('clear').disabled = false;
  $('submit').disabled = true;
  setGate('playing');
  state.startedAt = Date.now();
  clearInterval(state.timerId);
  state.timerId = setInterval(tick, 100);
  tick();
  updateScore();
}

/* ------------------------------------------------------------------------
 * 11. 부팅
 * ---------------------------------------------------------------------- */

function bindEvents() {
  // 참조 패널
  $('file').addEventListener('change', handleFileChange);
  $('ref-reset').addEventListener('click', resetRef);
  $('artist').addEventListener('input', (event) => applyArtist(event.target.value, true));
  $('sens').addEventListener('input', (event) => {
    state.sensitivity = Number(event.target.value) / 100;
    rebuildRef();
  });
  $('fit').addEventListener('change', (event) => {
    state.fit = event.target.value;
    rebuildRef();
  });
  $('res').addEventListener('change', (event) => {
    state.gridSize = Number(event.target.value);
    rebuildRef();
  });
  $('show-src').addEventListener('change', rebuildRef);
  $('show-edge').addEventListener('change', rebuildRef);

  // 그림판
  drawCanvas.addEventListener('pointerdown', handlePointerDown);
  drawCanvas.addEventListener('pointermove', handlePointerMove);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
    drawCanvas.addEventListener(type, handlePointerUp);
  });
  const toneButtons = document.querySelectorAll('.tone');
  toneButtons.forEach((button) => {
    button.addEventListener('click', () => {
      state.tone = Number(button.dataset.lv);
      toneButtons.forEach((other) => other.setAttribute('aria-pressed', other === button));
    });
  });
  $('size').addEventListener('input', (event) => {
    state.brushSize = Number(event.target.value);
  });
  $('undo').addEventListener('click', undo);
  $('clear').addEventListener('click', clearDrawing);

  // 라운드 · 점수
  $('start').addEventListener('click', startRound);
  $('show-diff').addEventListener('change', updateScore);
  $('submit').addEventListener('click', submitScore);
  $('reset').addEventListener('click', resetBoard);
}

/** 첫 화면: 예시 낙서 + 게이트, 저장된 사진·이름이 있으면 복원, 없으면 ref.jpg. */
function boot() {
  bindEvents();
  clearStage();
  drawCtx.drawImage(createSampleDoodle(), 0, 0);
  $('corner').textContent = '지금 보이는 건 예시 낙서예요.';
  setGate('idle');
  $('timer').textContent = formatSeconds(ROUND_SECONDS);

  let storedRef = null;
  let storedArtist = null;
  try {
    storedRef = localStorage.getItem(STORAGE.ref);
    storedArtist = localStorage.getItem(STORAGE.artist);
  } catch (error) {
    // localStorage 를 못 쓰면 기본값으로
  }

  if (!storedRef) {
    applyArtist(DEFAULT_ARTIST, false);
    loadDefaultRef(rebuildRef);
    return;
  }
  applyArtist(storedArtist || '', false);
  const image = new Image();
  image.onload = () => {
    state.refImage = image;
    state.refKind = 'upload';
    rebuildRef();
  };
  image.onerror = () => {
    applyArtist(DEFAULT_ARTIST, false);
    loadDefaultRef(rebuildRef);
  };
  image.src = storedRef;
}

boot();
