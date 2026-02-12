import { Group, Task, PickStateData } from "@/types/models";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { shuffleInPlace } from "@/lib/pick/shuffle";

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type DeckKey = "ALL" | string;

type PickStore = PickStateData & {
  decks: Record<string, string[]>; // { [key: DeckKey]: taskId[] }
  // selectors/helpers
  getTasksByGroupId: (groupId: string) => Task[];

  // group actions
  addGroup: (name: string) => void;
  renameGroup: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;

  groupDeck: string[];
  drawGroupFromDeck: () => Group | null;

  // task actions
  addTask: (groupId: string, name: string) => void;
  renameTask: (taskId: string, name: string) => void;
  deleteTask: (taskId: string) => void;

  // 덱 기반 뽑기
  drawTaskFromDeck: (key: DeckKey) => Task | null;

  // 덱 초기화(특정 키만 or 전체)
  resetDeck: (key?: DeckKey) => void;

  resetAll: () => void;
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

      drawGroupFromDeck: () => {
        const state = get();
        const ids = state.groups.map(g => g.id);
        if(ids.length === 0) return null;

        // 현재 덱에서 '현재 존재하는 그룹'만 남기기
        let deck = (state.groupDeck ?? []).filter(id => ids.includes(id));

        // 덱이 비었으면 새로 셔플
        if(deck.length === 0) {
            deck = shuffleInPlace([...ids]);
        }

        const pickedId = deck.pop();
        if(!pickedId) return null;

        set({ groupDeck: deck });

        return state.groups.find(g => g.id === pickedId) ?? null;
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

      addTask: (groupId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        const newTask: Task = {
          id: makeId(),
          groupId,
          name: trimmed,
          createdAt: Date.now(),
        };

        // 할일이 바뀌면 덱이 꼬일 수 있으니 그룹 덱+ALL 덱 초기화
        set((state) => {
          const nextDecks = { ...state.decks };
          delete nextDecks[groupId];
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

      deleteTask: (taskId) => {
        set((state) => {
          const task = state.tasks.find((t) => t.id === taskId);
          const groupId = task?.groupId;

          const nextDecks = { ...state.decks };
          if(groupId) delete nextDecks[groupId];
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
      })
    },
  ),
);
