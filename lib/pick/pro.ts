import type { Task } from "@/types/models";
import { shuffleInPlace } from "./shuffle";

export type TimeTag = "morning" | "afternoon" | "night";
export type EnergyTag = "low" | "mid" | "high";
export type MoodTag = "happy" | "stressed" | "blue" | "hype";

export type ProContext = {
  time?: TimeTag;
  energy?: EnergyTag;
  mood?: MoodTag;
};

export type ProRules = {
  recentBanCount: number;
  weights: Record<string, number>;
};

export type ProPreset = {
  id: string;
  name: string;
  groupId: string;
  context: ProContext;
  rules: ProRules;
  createdAt: number;
};

export type BuildProDeckArgs = {
  tasks: Task[];
  context: ProContext;
  rules: ProRules;
  recentHistory: string[]; // 최근 뽑힌 taskId들(최신이 뒤)
};

type TaskTags = {
  time?: TimeTag[];
  energy?: EnergyTag[];
  mood?: MoodTag[];
};

// Task에 tags가 있다 가정(없으면 통과)
const getTags = (t: Task): TaskTags | undefined => (t as any).tags;

const matchesTag = (arr: string[] | undefined, value: string | undefined) => {
  if (!value) return true;
  if (!arr || arr.length === 0) return true; // 태그 없는 task는 통과
  return arr.includes(value);
};

// 후보 0개 방지용 fallback: mood -> energy -> time 순으로 조건을 풀어줌
export function buildProDeck({
  tasks,
  context,
  rules,
  recentHistory,
}: BuildProDeckArgs): string[] {
  const filterWith = (ctx: ProContext) => {
    return tasks.filter((t) => {
      const tags = getTags(t);
      return (
        matchesTag(tags?.time as any, ctx.time) &&
        matchesTag(tags?.energy as any, ctx.energy) &&
        matchesTag(tags?.mood as any, ctx.mood)
      );
    });
  };

  // 1) 상황 필터(점점 완화)
  let filtered = filterWith(context);

  if (filtered.length === 0)
    filtered = filterWith({ ...context, mood: undefined });
  if (filtered.length === 0)
    filtered = filterWith({ ...context, mood: undefined, energy: undefined });
  if (filtered.length === 0)
    filtered = filterWith({
      ...context,
      mood: undefined,
      energy: undefined,
      time: undefined,
    });

  // 2) 최근 N회 제외
  const banN = Math.max(0, Math.min(10, rules.recentBanCount ?? 0));
  const bannedSet = new Set(recentHistory.slice(-banN));
  let afterBan = filtered.filter((t) => !bannedSet.has((t as any).id));

  // ban 때문에 0개가 되면 ban을 무시하고 filtered로 돌아감
  if (afterBan.length === 0) afterBan = filtered;

  // 3) 가중치 적용(중복 push)
  const ids: string[] = [];
  for (const t of afterBan) {
    const id = (t as any).id as string;
    const wRaw = rules.weights?.[id] ?? 1;
    const w = Math.max(1, Math.min(5, Math.floor(wRaw)));
    for (let i = 0; i < w; i++) ids.push(id);
  }

  // 4) 셔플해서 덱 반환
  shuffleInPlace(ids);
  return ids;
}
