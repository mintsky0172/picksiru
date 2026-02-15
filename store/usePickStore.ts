import { Group, Task, PickStateData } from "@/types/models";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { shuffleInPlace } from "@/lib/pick/shuffle";
import {
  buildProDeck,
  ProContext,
  ProRules,
  ProPreset,
  TimeTag,
  EnergyTag,
  MoodTag,
} from "@/lib/pick/pro";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type DeckKey = "ALL" | string;

type PickStore = PickStateData &
  ProState & {
    decks: Record<string, string[]>; // { [key: DeckKey]: taskId[] }
    pro: ProState["pro"];

    isPro: boolean;
    setIsPro: (value: boolean) => void;
    toggleProDev: () => void; // 개발용

    proContext: ProContext;

    setProContext: (patch: Partial<ProContext>) => void;
    resetProContext: () => void;

    // selectors/helpers
    getTasksByGroupId: (groupId: string) => Task[];

    // group actions
    addGroup: (name: string) => void;
    renameGroup: (groupId: string, name: string) => void;
    deleteGroup: (groupId: string) => void;

    groupDeck: string[];
    drawGroupFromDeck: () => Group | null;

    // task actions
    addTask: (input: AddTaskInput) => void;
    renameTask: (taskId: string, name: string) => void;
    updateTask: (taskId: string, patch: Partial<Task>) => void;
    deleteTask: (taskId: string) => void;

    // 덱 기반 뽑기
    drawTaskFromDeck: (key: DeckKey) => Task | null;

    // 덱 초기화(특정 키만 or 전체)
    resetDeck: (key?: DeckKey) => void;

    resetAll: () => void;
  };

type AddTaskInput = {
  groupId: string;
  name: string;
  timeTags?: TimeTag[];
  energyTags?: EnergyTag[];
  moodTags?: MoodTag[];
};

type ProState = {
  pro: {
    // 현재 Pro 설정
    contextByGroupId: Record<string, ProContext>;
    rulesByGroupId: Record<string, ProRules>;

    // 최근 히스토리(그룹별)
    recentByGroupId: Record<string, string[]>;

    // 프리셋
    presets: ProPreset[];
  };

  // pro actions
  setProContext: (patch: {}) => void;
  setProRules: (groupId: string, rules: Partial<ProRules>) => void;
  resetProForGroup: (groupId: string) => void;

  saveProPreset: (name: string, groupId: string) => void;
  applyProPreset: (presetId: string) => void;
  deleteProPreset: (presetId: string) => void;

  // Pro로 덱을 재생성하고 1개 뽑기
  pickProTask: (groupId: string) => string | null;

  // 최근 히스토리 push
  pushRecentPick: (groupId: string, taskId: string) => void;
};

// 기본값
const DEFAULT_RULES: ProRules = {
  recentBanCount: 3,
  weights: {},
};

const DEFAULT_CONTEXT: ProContext = {
  time: undefined,
  energy: undefined,
  mood: undefined,
};

const initialData: PickStateData = {
  groups: [],
  tasks: [],
};

export const usePickStore = create<PickStore>()(
  persist(
    (set, get) => ({
      ...initialData,
      decks: {},
      groupDeck: [],

      pro: {
        contextByGroupId: {},
        rulesByGroupId: {},
        recentByGroupId: {},
        presets: [],
      },
      isPro: false,
      setIsPro: (value) => set({ isPro: value }),
      toggleProDev: () =>
        set((state) => ({
          isPro: !state.isPro,
        })),

      proContext: {},

      setProContext: (patch) =>
        set((state) => ({
          proContext: { ...state.proContext, ...patch },
        })),
      resetProContext: () => set({ proContext: {} }),

      setProRules: (groupId: string, rules: Partial<ProRules>) =>
        set((state) => ({
          pro: {
            ...state.pro,
            rulesByGroupId: {
              ...state.pro.rulesByGroupId,
              [groupId]: {
                ...(state.pro.rulesByGroupId[groupId] ?? DEFAULT_RULES),
                ...rules,
              },
            },
          },
        })),

      resetProForGroup: (groupId: string) =>
        set((state) => {
          const { [groupId]: _c, ...restC } = state.pro.contextByGroupId;
          const { [groupId]: _r, ...restR } = state.pro.rulesByGroupId;
          const { [groupId]: _h, ...restH } = state.pro.recentByGroupId;
          return {
            pro: {
              ...state.pro,
              contextByGroupId: restC,
              rulesByGroupId: restR,
              recentByGroupId: restH,
            },
          };
        }),

      saveProPreset: (name: string, groupId: string) =>
        set((state) => {
          const context =
            state.pro.contextByGroupId[groupId] ?? DEFAULT_CONTEXT;
          const rules = state.pro.rulesByGroupId[groupId] ?? DEFAULT_RULES;
          const preset: ProPreset = {
            id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
            name: name.trim() || "프리셋",
            groupId,
            context,
            rules,
            createdAt: Date.now(),
          };
          return {
            pro: {
              ...state.pro,
              presets: [preset, ...state.pro.presets],
            },
          };
        }),

      applyProPreset: (presetId: string) =>
        set((state) => {
          const preset = state.pro.presets.find(
            (p: ProPreset) => p.id === presetId,
          );
          if (!preset) return {};
          return {
            pro: {
              ...state.pro,
              contextByGroupId: {
                ...state.pro.contextByGroupId,
                [preset.groupId]: preset.context,
              },
              rulesByGroupId: {
                ...state.pro.rulesByGroupId,
                [preset.groupId]: preset.rules,
              },
            },
          };
        }),

      deleteProPreset: (presetId: string) =>
        set((state) => ({
          pro: {
            ...state.pro,
            presets: state.pro.presets.filter(
              (p: ProPreset) => p.id !== presetId,
            ),
          },
        })),

      pushRecentPick: (groupId: string, taskId: string) =>
        set((state) => {
          const prev = state.pro.recentByGroupId[groupId] ?? [];
          const next = [...prev, taskId].slice(-20); // 최근 20개까지만 저장
          return {
            pro: {
              ...state.pro,
              recentByGroupId: {
                ...state.pro.recentByGroupId,
                [groupId]: next,
              },
            },
          };
        }),

      /**
       * Pro 전용 뽑기:
       * - tasks 후보를 Pro로 필터/가중/최근제외 해서 덱 생성
       * - decks[groupId]에 저장
       * - 하나 pop해서 반환
       */

      pickProTask: (groupId: string) => {
        const state = get();
        const tasksInGroup = state.getTasksByGroupId(groupId);
        if (!tasksInGroup || tasksInGroup.length === 0) return null;

        const context = state.pro.contextByGroupId[groupId] ?? DEFAULT_CONTEXT;
        const rules = state.pro.rulesByGroupId[groupId] ?? DEFAULT_RULES;
        const recentHistory = state.pro.recentByGroupId[groupId] ?? [];

        // 덱 생성
        const deck = buildProDeck({
          tasks: tasksInGroup,
          context,
          rules,
          recentHistory,
        });

        if (deck.length === 0) return null;

        // pop
        const pickedId = deck[0]; // 앞에서부터 꺼냄
        const rest = deck.slice(1);

        set((prev) => ({
          decks: { ...prev.decks, [groupId]: rest },
          pro: {
            ...prev.pro,
            recentByGroupId: {
              ...prev.pro.recentByGroupId,
              [groupId]: [
                ...(prev.pro.recentByGroupId[groupId] ?? []),
                pickedId,
              ].slice(-20),
            },
          },
        }));

        return pickedId;
      },

      drawGroupFromDeck: () => {
        const state = get();
        const ids = state.groups.map((g) => g.id);
        if (ids.length === 0) return null;

        // 현재 덱에서 '현재 존재하는 그룹'만 남기기
        let deck = (state.groupDeck ?? []).filter((id) => ids.includes(id));

        // 덱이 비었으면 새로 셔플
        if (deck.length === 0) {
          deck = shuffleInPlace([...ids]);
        }

        const pickedId = deck.pop();
        if (!pickedId) return null;

        set({ groupDeck: deck });

        return state.groups.find((g) => g.id === pickedId) ?? null;
      },

      getTasksByGroupId: (groupId) =>
        get()
          .tasks.filter((t) => t.groupId === groupId)
          .sort((a, b) => a.createdAt - b.createdAt),

      resetDeck: (key) => {
        if (!key) {
          set({ decks: {} });
          return;
        }
        set((state) => {
          const next = { ...state.decks };
          delete next[key];
          return { decks: next };
        });
      },

      drawTaskFromDeck: (key) => {
        const state = get();
        const { tasks } = state;

        const candidates =
          key === "ALL" ? tasks : tasks.filter((t) => t.groupId === key);

        if (candidates.length === 0) return null;

        const candidateIds = candidates.map((t) => t.id);
        const existingDeck = (state.decks[key] ?? []).filter((id) =>
          candidateIds.includes(id),
        );

        // 덱이 비었으면 새로 생성
        let deck = existingDeck;
        if (deck.length === 0) {
          deck = shuffleInPlace([...candidateIds]);
        }

        // 하나 뽑기
        const pickedId = deck.pop();
        if (!pickedId) return null;

        // 덱 저장
        set((s) => ({
          decks: {
            ...s.decks,
            [key]: deck,
          },
        }));

        return tasks.find((t) => t.id === pickedId) ?? null;
      },

      addGroup: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const newGroup: Group = {
          id: makeId(),
          name: trimmed,
          createdAt: Date.now(),
        };

        set((state) => ({
          groups: [...state.groups, newGroup].sort(
            (a, b) => a.createdAt - b.createdAt,
          ),
          groupDeck: [],
        }));
      },

      renameGroup: (groupId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        set((state) => ({
          groups: state.groups.map((g) =>
            g.id === groupId ? { ...g, name: trimmed } : g,
          ),
        }));
      },

      deleteGroup: (groupId) => {
        // 그룹 삭제 시 그 그룹의 할일도 같이 삭제
        set((state) => {
          const nextDecks = { ...state.decks };
          delete nextDecks[groupId];
          delete nextDecks.ALL;

          return {
            groups: state.groups.filter((g) => g.id !== groupId),
            tasks: state.tasks.filter((t) => t.groupId !== groupId),
            decks: nextDecks,
            groupDeck: [],
          };
        });
      },

      addTask: (input: AddTaskInput) => {
        const trimmed = input.name.trim();
        if (!trimmed) return;

        const newTask: Task = {
          id: makeId(),
          groupId: input.groupId,
          name: trimmed,
          createdAt: Date.now(),
          timeTags: input.timeTags,
          energyTags: input.energyTags,
          moodTags: input.moodTags,
        };

        // 할일이 바뀌면 덱이 꼬일 수 있으니 그룹 덱+ALL 덱 초기화
        set((state) => {
          const nextDecks = { ...state.decks };
          delete nextDecks[input.groupId];
          delete nextDecks.ALL;

          return { tasks: [...state.tasks, newTask], decks: nextDecks };
        });
      },

      renameTask: (taskId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, name: trimmed } : t,
          ),
        }));
      },

      updateTask: (taskId, patch) => {
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id == taskId ? { ...t, ...patch } : t,
          ),
        }));
      },

      deleteTask: (taskId) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          const groupId = task?.groupId;

          const nextDecks = { ...state.decks };
          if (groupId) delete nextDecks[groupId];
          delete nextDecks.ALL;

          return {
            tasks: state.tasks.filter((t) => t.id !== taskId),
            decks: nextDecks,
          };
        });
      },

      resetAll: () => set(() => ({ ...initialData, decks: {}, groupDeck: [] })),
    }),
    {
      name: "picksiru-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,

      // deck은 저장x
      partialize: (state) => ({
        groups: state.groups,
        tasks: state.tasks,
        isPro: state.isPro,
        proContext: state.proContext,
      }),
    },
  ),
);
