import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ProStore = {
  // 실제 구매 여부(추후 IAP 붙이면 true)
  isPurchased: boolean;
  setPurchased: (v: boolean) => void;

  // 개발용 강제 언락 토글
  devForcePro: boolean;
  setDevForcePro: (v: boolean) => void;

  // 최종 판정
  isUnlocked: () => boolean;
};

export const useProStore = create<ProStore>()(
  persist(
    (set, get) => ({
      isPurchased: false,
      setPurchased: (v) => set({ isPurchased: v }),

      devForcePro: false,
      setDevForcePro: (v) => set({ devForcePro: v }),

      isUnlocked: () => {
        const { isPurchased, devForcePro } = get();
        // 개발 모드에선 devForcePro로만 컨트롤(잠금화면 테스트 가능)
        if (__DEV__) return devForcePro;
        // 배포 빌드에선 실제 구매 여부만
        return isPurchased;
      },
    }),
    {
      name: "pro-store",
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    },
  ),
);
