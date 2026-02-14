import { StyleSheet, Text, View, Image, Alert } from "react-native";
import React, { useMemo } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../components/ui/Screen";
import ListItem from "@/components/ui/ListItem";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePickStore } from "@/store/usePickStore";

const ManageTasksScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logo = require("../../assets/images/labels/managelogo.png");
  const { groupId } = useLocalSearchParams<{ groupId: string | string[] }>();
  const currentGroupId = Array.isArray(groupId) ? groupId[0] : groupId;

  const group = usePickStore((s) =>
    s.groups.find((g) => g.id === currentGroupId),
  );
  const allTasks = usePickStore((s) => s.tasks);
  const tasks = useMemo(
    () =>
      allTasks
        .filter((t) => t.groupId === currentGroupId)
        .sort((a, b) => a.createdAt - b.createdAt),
    [allTasks, currentGroupId],
  );
  const deleteTask = usePickStore((s) => s.deleteTask);

  return (
    <Screen
      style={[styles.container, { paddingTop: Math.max(0, 60 - insets.top) }]}
    >
      <View style={styles.header}>
        <Image source={logo} style={styles.title} />
        <Text style={styles.subtitle}>할일 관리</Text>
      </View>

      <View style={styles.list}>
        {tasks.length === 0 ? (
          <Text
            style={{
              color: Colors.textSecondary,
              ...Typography.body,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            아직 할일이 없어. '할일 추가'로 넣어보자!
          </Text>
        ) : (
          tasks.map((t) => (
            <View key={t.id} style={styles.itemWrap}>
              <ListItem
                title={t.name}
                onEdit={() =>
                  router.push({
                    pathname: "/edit-task",
                    params: { taskId: t.id },
                  })
                }
                onDelete={() =>
                  Alert.alert("할일 삭제", "이 할일을 삭제할까?", [
                    { text: "취소", style: "cancel" },
                    {
                      text: "삭제",
                      style: "destructive",
                      onPress: () => deleteTask(t.id),
                    },
                  ])
                }
              />
            </View>
          ))
        )}
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          label="할일 추가"
          onPress={() =>
            router.push({
              pathname: "/add-task",
              params: { groupId: currentGroupId },
            })
          }
          style={{ marginBottom: 12, marginTop: 4 }}
        />
        <SecondaryButton label="이전 화면으로" onPress={() => router.back()} />
      </View>
    </Screen>
  );
};

export default ManageTasksScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    paddingHorizontal: 22,
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  title: {
    width: 220,
    height: 90,
    resizeMode: "contain",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textPrimary,
    ...Typography.subtitle,
  },
  list: {
    gap: 12,
    paddingTop: 8,
  },
  itemWrap: {},
  bottom: {
    paddingTop: Spacing.lg,
  },
});
