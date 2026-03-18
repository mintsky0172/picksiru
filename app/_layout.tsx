import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { FontFamily } from "@/constants/typography";
import { useProStore } from "@/store/useProStore";
import { endConnection, getAvailablePurchases, initConnection } from "expo-iap";

void SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const setPurchased = useProStore((s) => s.setPurchased);
  const hasHydrated = useProStore((s) => s.hasHydrated);

  const [fontsLoaded] = useFonts({
    [FontFamily.base]: require("../assets/fonts/Iseoyun.ttf"),
  });

  useEffect(() => {
    if (!hasHydrated) return;

    const syncPurchasedState = async () => {
      try {
        await initConnection();
        const purchases = await getAvailablePurchases();
        const hasPro = purchases.some(
          (purchase) => purchase.productId === "com.siru.picksiru.pro",
        );
        setPurchased(hasPro);
      } catch (error) {
        console.error("[IAP] startup restore failed", error);
      }
    };

    void syncPurchasedState();

    return () => {
      void endConnection().catch(() => undefined);
    };
  }, [hasHydrated, setPurchased]);

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 일반 화면들 */}
      <Stack.Screen name="index" />
      <Stack.Screen name="todo-pick" />
      <Stack.Screen name="number-pick" />
      <Stack.Screen name="binary-pick" />
      <Stack.Screen name="manage/index" />
      <Stack.Screen name="manage/[groupId]" />

      {/* 모달 그룹 */}
      <Stack.Screen
        name="(modal)/add-group"
        options={{
          presentation: "transparentModal",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="(modal)/add-task"
        options={{
          presentation: "transparentModal",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="(modal)/edit-group"
        options={{
          presentation: "transparentModal",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
      <Stack.Screen
        name="(modal)/edit-task"
        options={{
          presentation: "transparentModal",
          contentStyle: { backgroundColor: "transparent" },
        }}
      />
    

    </Stack>
  );
}
