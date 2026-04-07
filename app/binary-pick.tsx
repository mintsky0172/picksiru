import {
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Alert,
  Pressable,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import Screen from "@/components/ui/Screen";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import SecondaryButton from "@/components/ui/SecondaryButton";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { maybeRequestInAppReview } from "@/lib/review";
import { usePickStore } from "@/store/usePickStore";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));

const BinaryPickScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logo = require("../assets/images/labels/binarylogo.png");
  const setRecentBinaryChoice = usePickStore(
    (state) => state.setRecentBinaryChoice,
  );
  const recentBinaryChoice = usePickStore((state) => state.recentBinaryChoice);
  const hasHydrated = usePickStore((state) => state.hasHydrated);

  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (result !== null) {
      scale.setValue(0.8);

      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 120,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [result]);

  const onPick = async () => {
    Keyboard.dismiss();

    if (!optionA.trim() || !optionB.trim()) return;

    setLoading(true);
    await nextFrame();
    await sleep(900);

    const picked = Math.random() < 0.5 ? optionA : optionB;

    setRecentBinaryChoice({
      optionA: optionA,
      optionB: optionB,
      result: picked,
      savedAt: Date.now(),
    });

    setResult(picked);
    setLoading(false);
    void maybeRequestInAppReview();
  };

  const handleLoadRecentBinaryChoice = () => {
    if (!recentBinaryChoice) {
      Alert.alert("최근 기록이 없어요.");
      return;
    }

    const hasTyping = optionA.trim() || optionB.trim();

    const applyRecent = () => {
      setOptionA(recentBinaryChoice.optionA);
      setOptionB(recentBinaryChoice.optionB);
    };

    if (hasTyping) {
      Alert.alert("최근 기록을 불러올까요?", "지금 입력한 내용은 사라져요.", [
        { text: "취소", style: "cancel" },
        { text: "불러오기", onPress: applyRecent },
      ]);
      return;
    }

    applyRecent();
  };

  return (
    <Screen style={{ paddingTop: Math.max(0, 60 - insets.top) }}>
      <LoadingOverlay visible={loading} message="시루가 뽑는 중..." />

      <View style={styles.header}>
        <Image style={styles.title} source={logo} />
        <Text style={styles.subtitle}>둘 중에 하나만 골라보자</Text>
      </View>

      {hasHydrated && recentBinaryChoice && (
        <Pressable onPress={handleLoadRecentBinaryChoice}>
          <Text style={styles.recentText}>⏱️ 최근 선택지 불러오기</Text> 
        </Pressable>
      )}

      <View style={styles.inputBox}>
        <TextInput
          value={optionA}
          onChangeText={(t) => {
            setOptionA(t);
            setResult(null);
          }}
          placeholder="첫 번째 선택"
          style={styles.input}
        />
        <Text style={styles.vs}>VS</Text>
        <TextInput
          value={optionB}
          onChangeText={(t) => {
            setOptionB(t);
            setResult(null);
          }}
          placeholder="두 번째 선택"
          style={styles.input}
        />
      </View>

      <View style={styles.resultArea}>
        <View style={styles.resultCard}>
          {result === null ? (
            <Text style={styles.hint}>아직 안 뽑았어. 뽑기 버튼을 눌러줘!</Text>
          ) : (
            <>
              <Text style={styles.resultLabel}>결과는...</Text>
              <Animated.Text
                style={[styles.resultBig, { transform: [{ scale }] }]}
              >
                {result}
              </Animated.Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          label={result === null ? "뽑기!" : "다시 뽑기"}
          onPress={onPick}
        />
        <View style={{ height: 10 }} />
        <SecondaryButton
          label="메인 화면으로"
          onPress={() => router.replace("/")}
        />
      </View>
    </Screen>
  );
};

export default BinaryPickScreen;

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    width: 220,
    height: 90,
    resizeMode: "contain",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  inputBox: { gap: 16 },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: Colors.surface,
    textAlign: "center",
    color: Colors.textPrimary,
    ...Typography.body,
    lineHeight: 0,
  },
  vs: {
    textAlign: "center",
    color: Colors.textPrimary,
    ...Typography.subtitle,
  },
  hint: {
    color: Colors.textDisabled,
    ...Typography.body,
    fontSize: 14,
    opacity: 0.7,
  },
  resultArea: {
    flex: 1,
    justifyContent: "center",
  },
  resultCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: "center",
    gap: 10,
  },
  resultLabel: {
    fontSize: 12,
    opacity: 0.6,
    color: Colors.textPrimary,
    ...Typography.subtitle,
  },
  resultBig: {
    color: Colors.textPrimary,
    ...Typography.title,
    fontSize: 44,
    lineHeight: 52,
    textAlign: "center",
  },
  bottom: { paddingBottom: 18 },
  recentText: {
    color: Colors.textSecondary,
    ...Typography.body,
    textAlign: 'center',
    marginBottom: 12,
  }
});
