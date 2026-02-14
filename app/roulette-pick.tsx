import {
  Alert,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Screen from "@/components/ui/Screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { useRouter } from "expo-router";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";

const MAX = 8;

type Phase = "INPUT" | "SPIN" | "RESULT";

const wheelFrame = require("../assets/images/roulette/wheel_frame.png");
const wheelCenter = require("../assets/images/roulette/wheel_center.png");
const wheelPointer = require("../assets/images/roulette/wheel_pointer.png");

const COLORS = [
  "#F6C1C1",
  "#F8D4E3",
  "#F9D5B4",
  "#FAE7A5",
  "#CFE8C9",
  "#CDE7F6",
  "#E2D6F3",
  "#D8C2B1",
];

function makeRandomSliceColors(count: number) {
  const pool = [...COLORS];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]);
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function normalizeDeg(deg: number) {
  const m = deg % 360;
  return m < 0 ? m + 360 : m;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180; // 0도를 위쪽으로
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

function describeSlice(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

/**
 * 포인터는 위쪽(0도)에 고정, 룰렛은 시계방향으로 회전
 * 최종 회전각 finalDeg를 넣으면 포인터 아래에 걸린 조각 index를 반환
 */
function pickedIndexByRotation(finalDeg: number, n: number) {
  const seg = 360 / n;
  const relative = normalizeDeg(360 - normalizeDeg(finalDeg));
  const eps = 1e-6;
  const idx = Math.floor((relative + eps) / seg);
  return Math.max(0, Math.min(n - 1, idx));
}

const RoulettePickScreen = () => {
  const router = useRouter();

  const logo = require("../assets/images/labels/wheellogo.png");
  const insets = useSafeAreaInsets();

  // 8칸 고정 입력
  const [options, setOptions] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [phase, setPhase] = useState<Phase>("INPUT");
  const [sliceColors, setSliceColors] = useState<string[]>([]);

  // 회전 애니메이션
  const rotate = useRef(new Animated.Value(0)).current;
  const currentRotation = useRef(0);

  useEffect(() => {
    const id = rotate.addListener(
      ({ value }) => (currentRotation.current = value),
    );
    return () => rotate.removeListener(id);
  }, [rotate]);

  // 실제 후보(빈칸/공백 제거)
  const activeOptions = useMemo(() => {
    return options
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, MAX);
  }, [options]);

  const n = activeOptions.length;
  const canSpin = n >= 3;

  const size = 280; // 룰렛 크기
  const r = size / 2;
  const sliceRadius = r - 2; // 프레임 밖으로 색이 비치지 않게 살짝 안쪽으로
  const seg = n > 0 ? 360 / n : 360;

  const spin = rotate.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  const updateOption = (idx: number, text: string) => {
    setOptions((prev) => {
      const next = [...prev];
      // 줄바꿈/탭 제거 + 길이 제한
      next[idx] = text.replace(/\s+/g, " ").slice(0, 20);
      return next;
    });
    setResult(null);
    setPhase("INPUT");
  };

  const onSpin = async () => {
    if ((phase !== "SPIN" && phase !== "RESULT") || spinning) return;
    Keyboard.dismiss();
    if (!canSpin) {
      Alert.alert("선택지를 더 넣어줘", "최소 3개 이상 입력해줘.");
      return;
    }

    setPhase("SPIN");
    setSpinning(true);
    setResult(null);

    // 현재 각도에서 이어서 회전
    const start = currentRotation.current;
    const spins = 4 + Math.random() * 3;
    const randomAngle = Math.random() * 360;

    const final = start + spins * 360 + randomAngle;

    Animated.timing(rotate, {
      toValue: final,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      await sleep(120);
      const idx = pickedIndexByRotation(final, n);
      setResult(activeOptions[idx] ?? null);
      setSpinning(false);
      setPhase("RESULT");
    });
  };

  const onBuildRoulette = () => {
    Keyboard.dismiss();
    if (activeOptions.length < 3) {
      Alert.alert("선택지를 더 넣어줘", "최소 3개 이상 입력해줘.");
      return;
    }
    setSliceColors(makeRandomSliceColors(activeOptions.length));
    setPhase("SPIN");
  };

  const onSpinAgain = () => {
    setResult(null);
    setPhase("SPIN");
  };

  const onEditOptions = () => {
    setResult(null);
    setPhase("INPUT");
  };

  return (
    <Screen
      style={[styles.screen, { paddingTop: Math.max(0, 60 - insets.top) }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Image style={styles.title} source={logo} />
            <Text style={styles.subtitle}>여러 개 중에서 빠르게 골라보자</Text>

            {phase === "INPUT" && (
              <>
                {/* 입력 UI */}
                <View style={styles.inputs}>
                  {Array.from({ length: MAX }).map((_, i) => (
                    <View key={i} style={styles.row}>
                      <Text style={styles.index}>{i + 1}</Text>
                      <TextInput
                        value={options[i] ?? ""}
                        onChangeText={(t) => updateOption(i, t)}
                        placeholder={
                          i < 3 ? `선택지 ${i + 1}` : `선택지 ${i + 1} (선택)`
                        }
                        style={styles.input}
                        returnKeyType="done"
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                    </View>
                  ))}
                </View>

                <Text style={[styles.hint, !canSpin && { opacity: 1 }]}>
                  {canSpin
                    ? "좋아. 이제 돌릴 수 있어!"
                    : "선택지를 3개 이상 입력해줘."}
                </Text>

                <View style={styles.bottom}>
                  <PrimaryButton
                    label="룰렛 만들기"
                    onPress={onBuildRoulette}
                    disabled={activeOptions.length < 3}
                  />
                  <View style={{ height: 10 }} />
                  <SecondaryButton
                    label="메인 화면으로"
                    onPress={() => router.push("/")}
                  />
                </View>
              </>
            )}

            {(phase === "SPIN" || phase === "RESULT") && (
              <>
                {/* 룰렛 영역 */}
                <View style={styles.wheelArea}>
                  {/* 포인터는 고정 */}
                  <Image
                    source={wheelPointer}
                    style={[styles.pointer, { width: 15, height: 35 }]}
                  />

                  {/* 룰렛(조각+프레임+센터}은 같이 회전 */}
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <View style={{ width: size, height: size }}>
                      <Svg width={size} height={size}>
                        <G>
                          {n === 0 ? (
                            <Path
                              d={describeSlice(r, r, sliceRadius, 0, 360)}
                              fill="#fff"
                            />
                          ) : (
                            activeOptions.map((label, i) => {
                              const startAngle = i * seg;
                              const endAngle = (i + 1) * seg;
                              const d = describeSlice(
                                r,
                                r,
                                sliceRadius,
                                startAngle,
                                endAngle,
                              );

                              const mid = startAngle + seg / 2;
                              const pos = polarToCartesian(
                                r,
                                r,
                                sliceRadius * 0.62,
                                mid,
                              );

                              return (
                                <React.Fragment key={`${label}-${i}`}>
                                  <Path
                                    d={d}
                                    fill={
                                      sliceColors[i] ??
                                      COLORS[i % COLORS.length]
                                    }
                                    opacity={0.8}
                                  />
                                  <SvgText
                                    x={pos.x}
                                    y={pos.y}
                                    fontSize={Typography.title.fontSize}
                                    fill={Colors.textPrimary}
                                    fontFamily={Typography.title.fontFamily}
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                  >
                                    {label.length > 7
                                      ? `${label.slice(0, 7)}...`
                                      : label}
                                  </SvgText>
                                </React.Fragment>
                              );
                            })
                          )}
                        </G>
                      </Svg>

                      {/* 프레임 */}
                      <Image
                        source={wheelFrame}
                        style={[styles.abs, { width: size, height: size }]}
                      />
                      {/* 센터 */}
                      <Image
                        source={wheelCenter}
                        style={[styles.center, { width: 20, height: 20 }]}
                      />
                    </View>
                  </Animated.View>
                </View>

                {/* 결과 */}
                <View style={styles.resultArea}>
                  {phase === "RESULT" && result ? (
                    <Text style={styles.result}>{result}</Text>
                  ) : (
                    <Text style={styles.hint}>돌려서 결정하자</Text>
                  )}
                </View>

                <View style={styles.bottom}>
                  <SecondaryButton
                    label={
                      spinning
                        ? "돌리는 중..."
                        : result
                          ? "다시 돌리기"
                          : "돌리기"
                    }
                    onPress={onSpin}
                    disabled={!canSpin || spinning}
                  />
                  <View style={{ height: 10 }} />
                  <PrimaryButton label="선택지 수정" onPress={onEditOptions} />
                  <View style={{ height: 10 }} />
                  <SecondaryButton
                    label="메인 화면으로"
                    onPress={() => router.push("/")}
                  />
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
};

export default RoulettePickScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { flexGrow: 1 },
  screen: { paddingTop: 50, paddingHorizontal: 22, flex: 1 },
  header: { alignItems: "center", marginBottom: 18, gap: 8 },
  title: {
    width: 220,
    height: 90,
    resizeMode: "contain",
  },
  subtitle: { fontSize: 14, color: Colors.textPrimary, ...Typography.subtitle },
  sub: {
    opacity: 0.6,
    fontSize: 12,
    marginBottom: 6,
    color: Colors.textSecondary,
    ...Typography.body,
  },
  wheelArea: {
    marginTop: 8,
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pointer: {
    position: "absolute",
    top: -10,
    zIndex: 2,
  },
  abs: {
    position: "absolute",
    left: 0,
    top: 0,
  },
  center: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -10 }, { translateY: -10 }],
  },
  resultArea: {
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
    marginBottom: 10,
  },
  result: { fontSize: 28, color: Colors.textPrimary, ...Typography.title },
  inputs: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  index: {
    width: 18,
    textAlign: "center",
    opacity: 0.5,
    color: Colors.textPrimary,
    ...Typography.body,
  },

  input: {
    width: 200,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    ...Typography.body,
    lineHeight: 0,
  },
  hint: {
    opacity: 0.7,
    marginTop: 20,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  bottom: {
    marginTop: 14,
    paddingBottom: 18,
    width: "100%",
  },
});
