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

const EditGroupModal = () => {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId?: string }>();

  const group = usePickStore((s) => s.groups.find((g) => g.id === groupId));
  const renameGroup = usePickStore((s) => s.renameGroup);

  const initial = useMemo(() => group?.name ?? "", [group?.name]);
  const [name, setName] = useState(initial);

  const close = () => router.back();

  return (
    <ModalSheet title="그룹 이름 수정" onClose={close}>
      <View style={styles.body}>
        <Text style={styles.label}>새 그룹 이름</Text>
        <TextField value={name} onChangeText={setName} placeholder="예: 업무" style={{lineHeight: 0}}/>

        <PrimaryButton
          label="저장"
          onPress={() => {
            if (!groupId) return;
            renameGroup(groupId, name);
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

export default EditGroupModal;

const styles = StyleSheet.create({
  body: { gap: 8 },
  label: { fontSize: 12, color: Colors.textSecondary, ...Typography.body },
});
