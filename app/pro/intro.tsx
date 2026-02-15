import { Alert, Image, StyleSheet, Switch, Text, View } from "react-native";
import React from "react";
import { useProStore } from "@/store/useProStore";
import Screen from "@/components/ui/Screen";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@/constants/spacing";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { usePickStore } from "@/store/usePickStore";

const ProIntroScreen = () => {
  const router = useRouter();

  const logo = require("../../assets/images/labels/prologo.png");
  const insets = useSafeAreaInsets();

  const devForcePro = useProStore((s) => s.devForcePro);
  const setDevForcePro = useProStore((s) => s.setDevForcePro);
  const isUnlocked = useProStore((s) => s.isUnlocked());
  const isPro = usePickStore((s) => s.isPro);
  const toggleProDev = usePickStore((s) => s.toggleProDev);

  const onUnlockPress = () => {
    Alert.alert("준비중이에요", "추후 업데이트로 제공할 예정이에요.");
  };

  const onGoPro = () => {
    if (isUnlocked) router.push("/");
    else Alert.alert("잠금 상태", "구매 후 이용해 주세요.");
  };

  return (
    <Screen
      style={[styles.container, { paddingTop: Math.max(0, 60 - insets.top) }]}
    >
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.subtitle}>더 똑똑하게 뽑아줘요</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>상황 설정</Text>
        <Text style={styles.cardBody}>
          시간대/에너지/기분 기반으로 후보를 필터링해요.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>프리셋 저장(준비중)</Text>
        <Text style={styles.cardBody}>
          자주 쓰는 선택지를 저장하고 불러와요.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>고급 규칙(준비중)</Text>
        <Text style={styles.cardBody}>
          최근 나온 항목 제외, 가중치 등 규칙을 추가할 수 있어요.
        </Text>
      </View>

      <View style={{ height: 16 }} />

      {!isPro ? (
        <View style={styles.button}>
          <PrimaryButton label="✨ Pro 구매하기(₩3,900)" onPress={onUnlockPress} />
          <SecondaryButton label="나중에" onPress={() => router.back()} />
        </View>
      ) : (
        <View style={styles.button}>
          <PrimaryButton label="구매 완료" disabled onPress={() => {}} />
          <SecondaryButton
            label="Pro 사용하러 가기"
            onPress={() => router.push("/")}
          />
        </View>
      )}
      {__DEV__ && (
        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 15,
          }}
        >
          <Text
            style={{
              opacity: 0.6,
              color: Colors.textSecondary,
              ...Typography.body,
            }}
          >
            DEV MODE
          </Text>
          <Switch value={devForcePro} onValueChange={toggleProDev} />
        </View>
      )}
    </Screen>
  );
};

export default ProIntroScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    width: 220,
    height: 90,
    resizeMode: "contain",
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textPrimary,
    ...Typography.subtitle,
  },
  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    backgroundColor: Colors.surface,
  },
  cardTitle: {
    fontSize: 16,
    color: Colors.textPrimary,
    ...Typography.subtitle,
  },
  cardBody: {
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 18,
    color: Colors.textSecondary,
    ...Typography.body,
  },
  button: {
    width: '100%',
    gap: 15,
    flex: 1,

  },
  bottom: {
    width: "100%",
    flex: 1,
  },
});
