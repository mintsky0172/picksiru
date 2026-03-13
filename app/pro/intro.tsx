import { Alert, Image, StyleSheet, Text, View } from "react-native";
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
import Purchases from "react-native-purchases";

const ProIntroScreen = () => {
  const router = useRouter();

  const logo = require("../../assets/images/labels/prologo.png");
  const insets = useSafeAreaInsets();

  const isPro = useProStore((s) => s.isUnlocked());

  // Never allow local StoreKit bypass in release builds.
  const USE_STOREKIT_LOCAL_TEST =
    __DEV__ && process.env.EXPO_PUBLIC_USE_STOREKIT_LOCAL_TEST === "true";

  const buyPro = async () => {
    if (USE_STOREKIT_LOCAL_TEST) {
      useProStore.getState().setPurchased(true);
      return;
    }

    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages?.[0];

      if (!pkg) {
        throw new Error("구매 가능한 패키지가 없어요.");
      }

      const result = await Purchases.purchasePackage(pkg);

      const hasPro = !!result.customerInfo.entitlements.active["pro"];
      useProStore.getState().setPurchased(hasPro);
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error("구매 실패: ", e);
        Alert.alert("구매 실패", "구매를 진행하지 못했어요.");
      }
    }
  };

  const restorePro = async () => {
    if (USE_STOREKIT_LOCAL_TEST) {
      useProStore.getState().setPurchased(true);
      Alert.alert("구매 복원", "로컬 테스트에서는 Pro가 바로 복원돼요.");
      return;
    }

    try {
      const customerInfo = await Purchases.restorePurchases();
      const hasPro = !!customerInfo.entitlements.active["pro"];
      useProStore.getState().setPurchased(hasPro);

      if (hasPro) {
        Alert.alert("구매 복원", "구매 내역을 복원했어요.");
      } else {
        Alert.alert("구매 복원", "복원할 구매 내역이 없어요.");
      }
    } catch (e) {
      console.error("구매 복원 실패:", e);
      Alert.alert("구매 복원 실패", "구매 내역을 복원하지 못했어요.");
    }
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

      <Text style={styles.note}>
        추가 기능은 이후 업데이트로 확장될 예정이에요.
      </Text>

      <View style={{ height: 16 }} />

      {!isPro ? (
        <>
          <View style={styles.button}>
            <PrimaryButton label="✨ Pro 구매하기(₩3,300)" onPress={buyPro} />
            <SecondaryButton label="나중에" onPress={() => router.back()} />
          </View>
          <View style={{ height: 15 }} />
          <Text style={styles.restoreText} onPress={restorePro}>
            구매 복원
          </Text>
        </>
      ) : (
        <>
          <View style={styles.button}>
            <PrimaryButton label="구매 완료" disabled onPress={() => {}} />
            <SecondaryButton
              label="Pro 사용하러 가기"
              onPress={() => router.push("/")}
            />
          </View>
          <View style={{ height: 15 }} />
          <Text style={styles.restoreText} onPress={restorePro}>
            구매 복원
          </Text>
        </>
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
    width: "100%",
    gap: 15,
  },
  restoreText: {
    width: "100%",
    textAlign: "right",
    textDecorationLine: "underline",
    color: Colors.textSecondary,
    ...Typography.body,
  },
  note: {
    width: "100%",
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 12,
    color: Colors.textSecondary,
    opacity: 0.8,
    ...Typography.body,
  },
  bottom: {
    width: "100%",
    flex: 1,
  },
});
