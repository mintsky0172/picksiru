import { EnergyTag, MoodTag, TimeTag } from "@/lib/pick/pro";
import { usePickStore } from "@/store/usePickStore";
import React, { useMemo } from "react";
import { Modal, Pressable, StyleSheet, View, Text } from "react-native";
import Screen from "../ui/Screen";
import SecondaryButton from "../ui/SecondaryButton";
import PrimaryButton from "../ui/PrimaryButton";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

type Props = {
  visible: boolean;
  onClose: () => void;
  onApply?: () => void;
};

export const TIME_OPTIONS: { label: string; value: TimeTag }[] = [
  { label: "아침", value: "morning" },
  { label: "오후", value: "afternoon" },
  { label: "밤", value: "night" },
];

export const ENERGY_OPTIONS: { label: string; value: EnergyTag }[] = [
  { label: "낮음", value: "low" },
  { label: "보통", value: "mid" },
  { label: "높음", value: "high" },
];

export const MOOD_OPTIONS: { label: string; value: MoodTag }[] = [
  { label: "좋음", value: "happy" },
  { label: "짜증", value: "stressed" },
  { label: "우울", value: "blue" },
  { label: "각성", value: "hype" },
];

export const TIME_LABEL = Object.fromEntries(
  TIME_OPTIONS.map((o) => [o.value, o.label]),
) as Record<TimeTag, string>;
export const ENERGY_LABEL = Object.fromEntries(
  ENERGY_OPTIONS.map((o) => [o.value, o.label]),
) as Record<EnergyTag, string>;
export const MOOD_LABEL = Object.fromEntries(
  MOOD_OPTIONS.map((o) => [o.value, o.label]),
) as Record<MoodTag, string>;

export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProSetupModal({ visible, onClose, onApply }: Props) {
  const proContext = usePickStore((s) => s.proContext);
  const setProContext = usePickStore((s) => s.setProContext);
  const resetProContext = usePickStore((s) => s.resetProContext);

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (proContext.time) parts.push(TIME_LABEL[proContext.time]);
    if (proContext.energy) parts.push(ENERGY_LABEL[proContext.energy]);
    if (proContext.mood) parts.push(MOOD_LABEL[proContext.mood]);
    return parts.length ? parts.join(" . ") : "설정 없음";
  }, [proContext]);

  const toggleTime = (value: TimeTag) => {
    setProContext({ time: proContext.time === value ? undefined : value });
  };

  const toggleEnergy = (value: EnergyTag) => {
    setProContext({
      energy: proContext.energy === value ? undefined : value,
    });
  };

  const toggleMood = (value: MoodTag) => {
    setProContext({ mood: proContext.mood === value ? undefined : value });
  };

  const onPressClose = () => {
    onClose();
  };

  const onPressDone = () => {
    onApply?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onPressClose}
    >
      <Screen style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>상황 설정</Text>
          <Text style={styles.subtitle}>
            지금 상태에 맞게 할일을 뽑아줄 수 있어!
          </Text>
          <Text style={styles.summary}>현재: {summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시간대</Text>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={proContext.time === o.value}
                onPress={() => toggleTime(o.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>에너지</Text>
          <View style={styles.chipRow}>
            {ENERGY_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={proContext.energy === o.value}
                onPress={() => toggleEnergy(o.value)}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>기분</Text>
          <View style={styles.chipRow}>
            {MOOD_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={proContext.mood === o.value}
                onPress={() => toggleMood(o.value)}
              />
            ))}
          </View>
          <Text style={styles.hint}>* 기분은 선택사항이야.(안 골라도 돼!)</Text>
        </View>

        <View style={styles.footer}>
          <SecondaryButton
            label="초기화"
            onPress={resetProContext}
            style={{ marginBottom: 10 }}
          />
          <PrimaryButton label="완료" onPress={onPressDone} />
        </View>
      </Screen>
    </Modal>
  );
}

export default ProSetupModal;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 22,
    backgroundColor: Colors.surface,
  },
  header: {
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    color: Colors.textPrimary,
    ...Typography.title,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: Colors.textSecondary,
    ...Typography.body,
  },
  summary: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.textSecondary,
    ...Typography.subtitle,
  },
  section: {
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  sectionTitle: {
    fontSize: 13,
    color: Colors.textPrimary,
    ...Typography.subtitle,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#E5D8C8",
    backgroundColor: "#FFF7EE",
  },
  chipActive: {
    borderColor: Colors.textPrimary,
    backgroundColor: "#F3E0D5",
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    ...Typography.body,
  },
  chipTextActive: {
    color: Colors.textPrimary,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: Colors.textSecondary,
    ...Typography.body,
    opacity: 0.8,
  },
  footer: {
    marginTop: 22,
  },
});
