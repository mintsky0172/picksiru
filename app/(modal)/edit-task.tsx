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

const EditTaskModal = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();

  const task = usePickStore((s) => s.tasks.find((t) => t.id === taskId));
  const renameTask = usePickStore((s) => s.renameTask);

  const initial = useMemo(() => task?.name ?? "", [task?.name]);
  const [name, setName] = useState(initial);

  const close = () => router.back();

  return (
    <ModalSheet title="할일 이름 수정" onClose={close}>
      <View style={styles.body}>
        <Text style={styles.label}>새 할일 이름</Text>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder="예: 과학 공부"
        />

        <PrimaryButton
          label="저장"
          onPress={() => {
            if (!taskId) return;
            renameTask(taskId, name);
            close();
          }}
          disabled={name.trim().length === 0 || name.trim() === initial.trim()}
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
});
