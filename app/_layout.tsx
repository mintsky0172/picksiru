import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { FontFamily } from "@/constants/typography";

void SplashScreen.preventAutoHideAsync();

export default function Layout() {
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
