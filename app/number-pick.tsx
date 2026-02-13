import {
  Alert,
  Keyboard,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
  TextInput,
  Animated,
  Easing,
} from "react-native";
import React, { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "expo-router";
import Screen from "@/components/ui/Screen";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const nextFrame = () =>
  new Promise<void>((r) => requestAnimationFrame(() => r()));

function parseIntSafe(v: string): number | null {
  // 빈 문자열/공백 처리
  const s = v.trim();
  if (!s) return null;
  // 숫자 외 문자가 섞일 경우 방지
  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  // 정수만
  return Math.trunc(n);
}

function pickIntInclusive(min: number, max: number) {
  // min~max 포함 랜덤 정수
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const NumberPickScreen = () => {
  const router = useRouter();
  const logo = require("../assets/images/labels/numberlogo.png");
  const insets = useSafeAreaInsets();

  const [minText, setMinText] = useState("1");
  const [maxText, setMaxText] = useState("10");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<number | null>(null);

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

  const parsed = useMemo(() => {
    const min = parseIntSafe(minText);
    const max = parseIntSafe(maxText);
    return { min, max };
  }, [minText, maxText]);

  const validate = () => {
    const { min, max } = parsed;

    if (min === null || max === null) {
      Alert.alert("입력 오류", "최소값과 최대값을 숫자로 입력해줘.");
      return null;
    }

    if (min > max) {
      Alert.alert("입력 오류", "최소값이 최대값보다 클 수 없어.");
      return null;
    }

    // 너무 큰 범위는 제한
    const range = max - min;
    if (range > 1_000_000) {
      Alert.alert(
        "범위가 너무 커",
        "범위를 조금만 줄여줘.(최대 1,000,001개 범위",
      );
      return null;
    }

    return { min, max };
  };

  const onPick = async () => {
    Keyboard.dismiss();

    const ok = validate();
    if (!ok) return;

    setLoading(true);
    // 로딩오버레이가 실제로 그려질 시간을 확보
    await nextFrame();

    // 연출 딜레이
    await sleep(900 + Math.floor(Math.random() * 400));

    const n = pickIntInclusive(ok.min, ok.max);
    setResult(n);
    setLoading(false);
  };

  const onReset = () => {
    setResult(null);
    setMinText("1");
    setMaxText("10");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <Screen style={{ paddingTop: Math.max(0, 60 - insets.top) }}>
        <LoadingOverlay visible={loading} message="시루가 뽑는 중..." />

        <View style={styles.header}>
          <Image style={styles.title} source={logo} />
          <Text style={styles.subtitle}>범위를 정하고 하나 뽑자</Text>
        </View>

        <View style={styles.rangeBox}>
          <View style={styles.inputCol}>
            <Text style={styles.label}>최솟값</Text>
            <TextInput
              value={minText}
              onChangeText={(t) => {
                setMinText(t.replace(/[^\d]/g, "")); // 양수만 허용
                setResult(null);
              }}
              keyboardType="number-pad"
              returnKeyType="done"
              placeholder="예: 1"
              style={styles.input}
            />
          </View>

          <Text style={styles.tilde}>~</Text>

          <View style={styles.inputCol}>
            <Text style={styles.label}>최댓값</Text>
            <TextInput
              value={maxText}
              onChangeText={(t) => {
                setMaxText(t.replace(/[^\d]/g, ""));
                setResult(null);
              }}
              keyboardType="number-pad"
              returnKeyType="done"
              placeholder="예: 10"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.resultArea}>
          <View style={styles.resultCard}>
            {result === null ? (
              <Text style={styles.hint}>
                아직 안 뽑았어. 뽑기 버튼을 눌러줘!
              </Text>
            ) : (
              <>
                <Text style={styles.resultLabel}>결과는...</Text>
                <Animated.Text
                  style={[styles.resultNumber, { transform: [{ scale }] }]}
                >
                  {result}
                </Animated.Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.bottom}>
          <SecondaryButton
            label={result === null ? "뽑기!" : "다시 뽑기"}
            onPress={onPick}
          />
          <View style={{ height: 10 }} />
          <PrimaryButton label="초기화" onPress={onReset} />
          <View style={{ height: 10 }} />
          <SecondaryButton
            label="메인 화면으로"
            onPress={() => router.push("/")}
          />
        </View>
      </Screen>
    </TouchableWithoutFeedback>
  );
};

export default NumberPickScreen;

const styles = StyleSheet.create({
  header: { alignItems: "center", marginBottom: 18 },
  title: {
    width: 220,
    height: 90,
    resizeMode: "contain",
    marginBottom: 12,
  },
  subtitle: { fontSize: 14, color: Colors.textPrimary, ...Typography.subtitle },

  rangeBox: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginTop: 10,
  },
  inputCol: { flex: 1 },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
    color: Colors.textSecondary,
    ...Typography.body,
    textAlign: "center",
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    ...Typography.body,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 0,
    includeFontPadding: false,
  },
  tilde: { fontSize: 22, paddingBottom: 8, opacity: 0.6 },
  resultArea: { flex: 1, justifyContent: "center" },
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
  hint: {
    color: Colors.textDisabled,
    ...Typography.body,
    fontSize: 14,
    opacity: 0.7,
  },
  resultLabel: {
    color: Colors.textPrimary,
    ...Typography.subtitle,
    fontSize: 12,
  },
  resultNumber: {
    color: Colors.textPrimary,
    ...Typography.title,
    fontSize: 44,
    lineHeight: 52,
  },

  bottom: { paddingBottom: 18 },
});
