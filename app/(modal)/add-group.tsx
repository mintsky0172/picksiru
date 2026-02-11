import { StyleSheet, Text, View } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import ModalSheet from "@/components/ui/ModalSheet";
import TextField from "@/components/ui/TextField";
import PrimaryButton from "@/components/ui/PrimaryButton";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { usePickStore } from "@/store/usePickStore";

const AddGroupModal = () => {
  const router = useRouter();
  const [name, setName] = useState("");

  const close = () => router.back();

  const addGroup = usePickStore((s) => s.addGroup);

  return (
    <ModalSheet title="그룹 추가" onClose={close}>
      <View style={styles.body}>
        <Text style={styles.label}>그룹 이름</Text>
        <TextField
          value={name}
          onChangeText={setName}
          placeholder="예) 공부, 집안일"
        />

        <PrimaryButton
          label="추가"
          onPress={() => {
            addGroup(name);
            close();
          }}
          disabled={name.trim().length === 0}
          style={{ marginTop: 16 }}
        />
      </View>
    </ModalSheet>
  );
};

export default AddGroupModal;

const styles = StyleSheet.create({
  body: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    ...Typography.body,
  },
});
