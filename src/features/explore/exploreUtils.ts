import type { CampusLocation, CommunityQuestion } from '../../types/models';

export const MAIN_GATE_COORDS = { x: 50, y: 93, label: 'Cổng chính' } as const;

const QUESTION_STOP_WORDS = new Set([
  'la',
  'gi',
  'co',
  'khong',
  'thi',
  'va',
  'cua',
  'cho',
  'nhu',
  'the',
  'nao',
  'bi',
  'ma',
  'ai',
  'tu',
  'de',
  'da',
  'se',
  'nha',
  'nhe',
  'voi',
  'khi',
  'nay',
  'kia',
  'hay',
  'can',
  'phai',
  'lam',
  'sao',
  'minh',
  'ban',
  'moi',
  'nguoi',
  'hoi',
  'xin',
]);

const GENERIC_INTEREST_BIGRAMS = new Set([
  'co ban',
  'nang cao',
  'ky nang',
  'hoc thuat',
  'sinh vien',
]);

export function normalizeVi(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function includesVi(haystack: string, query: string): boolean {
  const normQuery = normalizeVi(query);
  if (!normQuery) return true;
  return normalizeVi(haystack).includes(normQuery);
}

export function findSimilarQuestions(
  draftTitle: string,
  questions: CommunityQuestion[],
  limit = 3,
): CommunityQuestion[] {
  const normDraft = normalizeVi(draftTitle);
  if (normDraft.length < 2) return [];

  const tokens = normDraft
    .split(' ')
    .filter((t) => t.length >= 2 && !QUESTION_STOP_WORDS.has(t));

  if (tokens.length === 0 && normDraft.length < 3) return [];

  const scored: Array<{ question: CommunityQuestion; score: number }> = [];

  for (const q of questions) {
    if (q.isHidden) continue;
    const normTitle = normalizeVi(q.title);
    const normTags = normalizeVi(q.tags.join(' '));
    const normContent = normalizeVi(q.content);

    let score = 0;

    if (normTitle.includes(normDraft)) score += 10;
    if (normTags.includes(normDraft)) score += 8;
    if (normContent.includes(normDraft)) score += 4;

    for (const token of tokens) {
      if (normTitle.includes(token)) score += 4;
      if (normTags.includes(token)) score += 3;
      if (normContent.includes(token)) score += 1.5;
    }

    if (score >= 4) {
      scored.push({ question: q, score });
    }
  }

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.question.votes - a.question.votes;
    })
    .slice(0, limit)
    .map((item) => item.question);
}

export function matchProfileInterests(
  interests: string[],
  candidateTexts: string[],
): string[] {
  if (interests.length === 0) return [];
  const haystack = normalizeVi(candidateTexts.join(' '));
  if (!haystack) return [];

  const matched: string[] = [];

  for (const interest of interests) {
    const normInterest = normalizeVi(interest);
    if (!normInterest) continue;

    if (haystack.includes(normInterest)) {
      matched.push(interest);
      continue;
    }

    const words = normInterest.split(' ').filter((w) => w.length >= 2);
    if (words.length === 1 && haystack.includes(words[0])) {
      matched.push(interest);
      continue;
    }

    if (words.length >= 2) {
      let bigramMatched = false;
      for (let i = 0; i < words.length - 1; i++) {
        const bigram = `${words[i]} ${words[i + 1]}`;
        if (!GENERIC_INTEREST_BIGRAMS.has(bigram) && haystack.includes(bigram)) {
          bigramMatched = true;
          break;
        }
      }
      if (bigramMatched) {
        matched.push(interest);
      }
    }
  }

  return matched;
}

export interface CampusRouteInfo {
  steps: string[];
  distanceMeters: number;
  walkMinutes: number;
  fromLabel: string;
}

function describeCompassDirection(dx: number, dy: number): string {
  const horiz = Math.abs(dx) >= 12 ? (dx > 0 ? 'Đông' : 'Tây') : '';
  const vert = Math.abs(dy) >= 12 ? (dy < 0 ? 'Bắc' : 'Nam') : '';
  if (vert && horiz) return `${vert} ${horiz}`;
  if (vert) return vert;
  if (horiz) return horiz;
  return 'trục trung tâm';
}

export function buildCampusRoute(
  from: CampusLocation | 'main_gate',
  to: CampusLocation,
): CampusRouteInfo {
  const fromCoords =
    from === 'main_gate' ? MAIN_GATE_COORDS : { x: from.x, y: from.y };
  const dx = to.x - fromCoords.x;
  const dy = to.y - fromCoords.y;
  const distanceMeters = Math.max(
    25,
    Math.round(Math.hypot(dx, dy) * 3.5),
  );
  const walkMinutes = Math.max(1, Math.round(distanceMeters / 65));

  if (from === 'main_gate') {
    return {
      steps: to.routeFromMainGate,
      distanceMeters,
      walkMinutes,
      fromLabel: MAIN_GATE_COORDS.label,
    };
  }

  const direction = describeCompassDirection(dx, dy);
  const crossesCenterAxis =
    (from.x < 45 && to.x > 55) || (from.x > 55 && to.x < 45);
  const steps: string[] = [
    `Rời khu vực ${from.code} (${from.name}) ra trục đường chính gần nhất.`,
  ];

  if (crossesCenterAxis) {
    steps.push(
      `Đi bộ về hướng vòng xoay trục trung tâm (gần Tòa A1 / Thư viện TV-01), sau đó rẽ sang hướng ${direction} khoảng ${distanceMeters}m.`,
    );
  } else {
    steps.push(
      `Di chuyển theo lối đi nội bộ về hướng ${direction} khoảng ${distanceMeters}m.`,
    );
  }

  if (to.floorGuide.length > 0) {
    steps.push(
      `Khi tới ${to.code} (${to.name}), tham khảo sơ đồ tầng: ${to.floorGuide[0]}.`,
    );
  } else {
    steps.push(`Tới điểm đến ${to.code} — ${to.name}.`);
  }

  return {
    steps,
    distanceMeters,
    walkMinutes,
    fromLabel: `${from.code} — ${from.name}`,
  };
}
