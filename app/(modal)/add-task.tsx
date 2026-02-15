import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ModalSheet from "@/components/ui/ModalSheet";
import TextField from "@/components/ui/TextField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { usePickStore } from "@/store/usePickStore";
import {
  Chip,
  ENERGY_OPTIONS,
  MOOD_OPTIONS,
  TIME_OPTIONS,
} from "@/components/pro/ProSetupModal";
import { TimeTag, EnergyTag, MoodTag } from "@/lib/pick/pro";

const AddTaskModal = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const [name, setName] = useState("");
  const proContext = usePickStore((s) => s.proContext);
  const setProContext = usePickStore((s) => s.setProContext);
  const close = () => router.back();

  const [timeTags, setTimeTags] = useState<TimeTag[]>([]);
  const [energyTags, setEnergyTags] = useState<EnergyTag[]>([]);
  const [moodTags, setMoodTags] = useState<MoodTag[]>([]);

  const addTask = usePickStore((s) => s.addTask);
  const groupName = usePickStore(
    (s) => s.groups.find((g) => g.id === groupId)?.name ?? "알 수 없음",
  );

  const toggleTime = (value: TimeTag) => {
    setTimeTags((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleEnergy = (value: EnergyTag) => {
    setEnergyTags((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleMood = (value: MoodTag) => {
    setMoodTags((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <ModalSheet title="할일 추가" onClose={close}>
      <View style={styles.body}>
        <Text style={styles.label}>
          - 대상 그룹: <Text style={styles.bold}>{groupName}</Text>
        </Text>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder="예) 수학 공부 30분, 청소"
        />

        <View>
          <Text style={styles.label}>- 태그 추가(선택)</Text>
          <Text style={styles.bold}>[시간 태그]</Text>

          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={timeTags.includes(o.value)}
                onPress={() => toggleTime(o.value)}
              />
            ))}
          </View>

          <Text style={styles.bold}>[에너지 태그]</Text>

          <View style={styles.chipRow}>
            {ENERGY_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={energyTags.includes(o.value)}
                onPress={() => toggleEnergy(o.value)}
              />
            ))}
          </View>

          <Text style={styles.bold}>[기분 태그]</Text>
          <View style={styles.chipRow}>
            {MOOD_OPTIONS.map((o) => (
              <Chip
                key={o.value}
                label={o.label}
                active={moodTags.includes(o.value)}
                onPress={() => toggleMood(o.value)}
              />
            ))}
          </View>
        </View>

        <PrimaryButton
          label="추가"
          onPress={() => {
            if (!groupId) return;
            addTask({
              groupId,
              name,
              timeTags,
              energyTags,
              moodTags,
            });
            close();
          }}
          disabled={name.trim().length === 0}
          style={{ marginTop: 16 }}
        />
      </View>
    </ModalSheet>
  );
};

export default AddTaskModal;

const styles = StyleSheet.create({
  body: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  bold: {
    color: Colors.textSecondary,
    ...Typography.body,
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
});
