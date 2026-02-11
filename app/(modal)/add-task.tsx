import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ModalSheet from "@/components/ui/ModalSheet";
import TextField from "@/components/ui/TextField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { usePickStore } from "@/store/usePickStore";

const AddTaskModal = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const [name, setName] = useState("");

  const close = () => router.back();

  const addTask = usePickStore((s) => s.addTask);
  const groupName = usePickStore(
    (s) => s.groups.find((g) => g.id === groupId)?.name ?? "알 수 없음",
  );

  return (
    <ModalSheet title="할일 추가" onClose={close}>
      <View style={styles.body}>
        <Text style={styles.label}>
          대상 그룹: <Text style={styles.bold}>{groupName}</Text>
        </Text>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder="예) 수학 공부 30분, 청소"
        />

        <PrimaryButton
          label="추가"
          onPress={() => {
            if(!groupId) return;
            addTask(groupId, name);
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
    color: Colors.textSecondary,
    ...Typography.body,
  },
  bold: {
    color: Colors.textPrimary,
    ...Typography.body,
  },
});
