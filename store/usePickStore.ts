import { Group, Task, PickStateData } from "@/types/models";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type PickStore = PickStateData & {
  // selectors/helpers
  getTasksByGroupId: (groupId: string) => Task[];

  // group actions
  addGroup: (name: string) => void;
  renameGroup: (groupId: string, name: string) => void;
  deleteGroup: (groupId: string) => void;

  // task actions
  addTask: (groupId: string, name: string) => void;
  renameTask: (taskId: string, name: string) => void;
  deleteTask: (taskId: string) => void;

  // debug / reset
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

      getTasksByGroupId: (groupId) => {
        return get()
          .tasks.filter((t) => t.groupId === groupId)
          .sort((a, b) => a.createdAt - b.createdAt);
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
        set((state) => ({
          groups: state.groups.filter((g) => g.id !== groupId),
          tasks: state.tasks.filter((t) => t.groupId !== groupId),
        }));
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

        set((state) => ({
          tasks: [...state.tasks, newTask],
        }));
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
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      },

      resetAll: () => set(() => ({ ...initialData })),
    }),
    {
      name: "picksiru-store-v1",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
