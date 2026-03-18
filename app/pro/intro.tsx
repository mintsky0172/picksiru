import { Alert, Image, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { useProStore } from "@/store/useProStore";
import Screen from "@/components/ui/Screen";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@/constants/spacing";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import {
  fetchProducts,
  finishTransaction,
  requestPurchase,
  restorePurchases,
  getAvailablePurchases,
} from "expo-iap";

const ProIntroScreen = () => {
  const router = useRouter();

  const logo = require("../../assets/images/labels/prologo.png");
  const insets = useSafeAreaInsets();

  const setPurchased = useProStore((s) => s.setPurchased);
  const isPurchased = useProStore((s) => s.isPurchased);
  const devForcePro = useProStore((s) => s.devForcePro);
  const hasHydrated = useProStore((s) => s.hasHydrated);
  const [isPro, setIsPro] = useState(__DEV__ ? devForcePro : isPurchased);

  useEffect(() => {
    if (!hasHydrated) return;
    setIsPro(__DEV__ ? devForcePro : isPurchased);
  }, [devForcePro, hasHydrated, isPurchased]);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      const syncOnFocus = async () => {
        try {
          const purchases = await getAvailablePurchases();
          const hasPro = purchases.some(
            (purchase) => purchase.productId === "com.siru.picksiru.pro",
          );

          if (!active) return;
          setPurchased(hasPro);
          setIsPro(hasPro);
        } catch (error) {
          console.error("[IAP] focus sync failed", error);
        }
      };

      void syncOnFocus();

      return () => {
        active = false;
      };
    }, [setPurchased]),
  );

  const buyPro = async () => {
    try {
      const existingPurchases = await getAvailablePurchases();
      const alreadyOwned = existingPurchases.some(
        (purchase) => purchase.productId === "com.siru.picksiru.pro",
      );

      if (alreadyOwned) {
        setPurchased(true);
        setIsPro(true);
        Alert.alert("이미 구매됨", "이미 Pro를 보유하고 있어요.");
        return;
      }

      const products = await fetchProducts({
        skus: ["com.siru.picksiru.pro"],
        type: "in-app",
      });

      const product = products?.find((p) => p.id === "com.siru.picksiru.pro");

      if (!product) {
        Alert.alert("구매 불가", "상품 정보를 불러오지 못했어요.");
        return;
      }

      const purchaseResult = await requestPurchase({
        request: {
          apple: { sku: "com.siru.picksiru.pro" },
        },
        type: "in-app",
      });

      const purchases = Array.isArray(purchaseResult)
        ? purchaseResult
        : purchaseResult
          ? [purchaseResult]
          : [];

      const matchedPurchases = purchases.filter(
        (purchase) => purchase.productId === "com.siru.picksiru.pro",
      );

      for (const purchase of matchedPurchases) {
        await finishTransaction({ purchase, isConsumable: false });
      }

      const availablePurchases = await getAvailablePurchases();
      const hasPro =
        matchedPurchases.length > 0 ||
        availablePurchases.some(
          (purchase) => purchase.productId === "com.siru.picksiru.pro",
        );

      setPurchased(hasPro);
      setIsPro(hasPro);

      if (hasPro) {
        Alert.alert("구매 완료", "Pro 기능이 잠금 해제되었어요.");
        return;
      }

      Alert.alert("구매 확인 필요", "구매는 완료됐지만 상태 확인이 아직 끝나지 않았어요.");
    } catch (e: any) {
      console.error("[IAP] purchase failed", e);
      Alert.alert("구매 실패", "구매를 진행하지 못했어요.");
    }
  };

  const restorePro = async () => {
    try {
      await restorePurchases();
      const purchases = await getAvailablePurchases();

      const hasPro = purchases.some(
        (p) => p.productId === "com.siru.picksiru.pro",
      );

      setPurchased(hasPro);
      setIsPro(hasPro);

      if (hasPro) {
        Alert.alert("구매 복원", "구매 내역을 복원했어요.");
      } else {
        Alert.alert("구매 복원", "복원할 구매 내역이 없어요.");
      }
    } catch (e) {
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
            <PrimaryButton label="✨ Pro 구매하기" onPress={buyPro} />
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
    textAlign: "center",
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
