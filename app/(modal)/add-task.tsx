import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import ModalSheet from "@/components/ui/ModalSheet";
import TextField from "@/components/ui/TextField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

const AddTaskModal = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();
  const [name, setName] = useState("");

  const close = () => router.back();

  return (
    <ModalSheet title="할일 추가" onClose={close}>
      <View style={styles.body}>
        <Text style={styles.label}>
          대상 그룹: <Text style={styles.bold}>{groupId ?? "알 수 없음"}</Text>
        </Text>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder="예) 수학 공부 30분, 청소"
        />

        <PrimaryButton
          label="추가"
          onPress={() => {
            // TODO: store 연결해서 추가할 예정
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
