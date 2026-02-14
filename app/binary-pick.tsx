import {
  Animated,
  Easing,
  Keyboard,
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
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

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));

const BinaryPickScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logo = require("../assets/images/labels/binarylogo.png");

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
    setResult(picked);
    setLoading(false);
  };

  return (
    <Screen style={[styles.container, { paddingTop: Math.max(0, 60 - insets.top) }]}>
      <LoadingOverlay visible={loading} message="시루가 뽑는 중..." />

      <View style={styles.header}>
        <Image style={styles.title} source={logo} />
        <Text style={styles.subtitle}>둘 중에 하나만 골라보자</Text>
      </View>

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
          onPress={() => router.push("/")}
        />
      </View>
    </Screen>
  );
};

export default BinaryPickScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingHorizontal: 22,
  },
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
  },
  bottom: { paddingBottom: 18 },
});
