import { StyleSheet, Text, View } from "react-native";
import React, { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { usePickStore } from "@/store/usePickStore";
import ModalSheet from "@/components/ui/ModalSheet";
import TextField from "@/components/ui/TextField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import {
  Chip,
  ENERGY_OPTIONS,
  MOOD_OPTIONS,
  TIME_OPTIONS,
} from "@/components/pro/ProSetupModal";
import { TimeTag, EnergyTag, MoodTag } from "@/lib/pick/pro";

const EditTaskModal = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();

  const task = usePickStore((s) => s.tasks.find((t) => t.id === taskId));
  const renameTask = usePickStore((s) => s.renameTask);
  const updateTask = usePickStore((s) => s.updateTask);

  const initial = useMemo(() => task?.name ?? "", [task?.name]);
  const [name, setName] = useState(initial);

  const [timeTags, setTimeTags] = useState<TimeTag[]>(task?.timeTags ?? []);
  const [energyTags, setEnergyTags] = useState<EnergyTag[]>(task?.energyTags ?? []);
  const [moodTags, setMoodTags] = useState<MoodTag[]>(task?.moodTags ?? []);

  const isPro = usePickStore((s) => s.isPro);

  const close = () => router.back();

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

  const handleSave = () => {
    const trimmed = name.trim();
    if(!trimmed || !taskId) return;

    updateTask(taskId, {
      name: trimmed,
      timeTags,
      energyTags,
      moodTags,
    });

    close();
  }

  return (
    <ModalSheet title="할일 수정" onClose={close}>
      <View style={styles.body}>
        <Text style={styles.label}>새 할일 이름</Text>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder="예: 과학 공부"
          style={styles.text}
        />

      {isPro && (
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
      )}
        

        <PrimaryButton
          label="저장"
          onPress={handleSave}
          disabled={name.trim().length === 0}
          style={{ marginTop: 16 }}
        />

        <SecondaryButton
          label="취소"
          onPress={close}
          style={{ marginTop: 10 }}
        />
      </View>
    </ModalSheet>
  );
};

export default EditTaskModal;

const styles = StyleSheet.create({
  body: { gap: 8 },
  label: { fontSize: 12, color: Colors.textSecondary, ...Typography.body },
  text: {
    alignItems: "center",
    lineHeight: 0,
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
