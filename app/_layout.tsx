import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { FontFamily } from "@/constants/typography";
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { useProStore } from "@/store/useProStore";

void SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const setPurchased = useProStore((s) => s.setPurchased);

  useEffect(() => {
    const initRevenueCat = async() => {
      if(Platform.OS !== 'ios') return;
      if (__DEV__ && process.env.EXPO_PUBLIC_USE_STOREKIT_LOCAL_TEST === "true") {
        return;
      }

      const apiKey = process.env.EXPO_PUBLIC_IOS_API_KEY;
      if (!apiKey) {
        console.warn("RevenueCat API key is missing. Skipping initialization.");
        return;
      }

      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      await Purchases.configure({
        apiKey
      });

      const customerInfo = await Purchases.getCustomerInfo();
      const hasPro = !!customerInfo.entitlements.active['pro'];
      setPurchased(hasPro);
    };

    initRevenueCat().catch((e) => {
      console.error('RevenueCat 초기화 실패:', e);
    });
  }, [setPurchased])

  const [fontsLoaded] = useFonts({
    [FontFamily.base]: require("../assets/fonts/Iseoyun.ttf"),
  });

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
