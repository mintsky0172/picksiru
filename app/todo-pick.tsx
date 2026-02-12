import { Alert, StyleSheet, Text, View, Image } from "react-native";
import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import { usePickStore } from "@/store/usePickStore";
import { pickOne } from "@/lib/pick/random";
import { pickOneShuffled } from "@/lib/pick/shuffle";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";
import Screen from "../components/ui/Screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";
import { Spacing } from "@/constants/spacing";
import ListItem from "@/components/ui/ListItem";

type PickResult = {
  groupName: string;
  taskName: string;
};

type Phase = "GROUP_SELECT" | "GROUP_RESULT" | "TASK_SELECT" | "TASK_RESULT";

const TodoPickScreen = () => {
  const logo = require("../assets/images/labels/todologo.png");
  const insets = useSafeAreaInsets();

  const router = useRouter();

  const groups = usePickStore((s) => s.groups);
  const tasks = usePickStore((s) => s.tasks);
  const getTasksByGroupId = usePickStore((s) => s.getTasksByGroupId);
  const drawGroupFromDeck = usePickStore((s) => s.drawGroupFromDeck);
  const drawTaskFromDeck = usePickStore((s) => s.drawTaskFromDeck);

  const [phase, setPhase] = useState<Phase>("GROUP_SELECT");
  const [selectedGroupId, setSelectedGroupId] = useState<string | "ALL">("ALL");
  const [loading, setLoading] = useState(false);

  const [pickedGroupId, setPickedGroupId] = useState<string | null>(null);
  const [pickedTaskId, setPickedTaskId] = useState<string | null>(null);

  const pickedGroup = useMemo(
    () => (pickedGroupId ? groups.find((g) => g.id === pickedGroupId) : null),
    [pickedGroupId, groups],
  );

  const pickedTask = useMemo(
    () => (pickedTaskId ? tasks.find((t) => t.id === pickedTaskId) : null),
    [pickedTaskId, tasks],
  );

  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const pickGroup = async () => {
    if (groups.length === 0) {
      Alert.alert("그룹이 없어", "먼저 할일관리에서 그룹을 추가해줘.");
      router.push("/manage");
      return;
    }
    setLoading(true);
    await delay(900 + Math.floor(Math.random() * 500));

    const g = drawGroupFromDeck();
    setLoading(false);

    if (!g) return;
    setPickedGroupId(g.id);
    setPickedTaskId(null);
    setPhase("GROUP_RESULT");
  };

  const goPickTaskInGroup = () => {
    if (!pickedGroupId) return;
    setPhase("TASK_SELECT");
  };

  const pickTask = async () => {
    if (!pickedGroupId) return;

    const candidates = getTasksByGroupId(pickedGroupId);
    if (candidates.length === 0) {
      Alert.alert(
        "할일이 없어",
        "이 그룹에 할일이 없어. 할일관리에서 추가해줘.",
      );
      router.push({
        pathname: "/manage/[groupId]",
        params: { groupId: pickedGroupId },
      });
      return;
    }
    setLoading(true);
    await delay(900 + Math.floor(Math.random() * 500));

    const task = drawTaskFromDeck(pickedGroupId);
    setLoading(false);

    if (!task) return;
    setPickedTaskId(task.id);
    setPhase("TASK_RESULT");
  };

  return (
    <Screen
      style={[styles.container, { paddingTop: Math.max(0, 60 - insets.top) }]}
    >
      <LoadingOverlay visible={loading} message="시루가 뽑는 중..." />
      {/* 1) 그룹 선택 화면 */}
      {phase === "GROUP_SELECT" && (
        <View style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.title} source={logo} />
            <Text style={styles.subtitle}>지금 할 건...</Text>
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            {groups.map((g) => (
              <ListItem key={g.id} title={g.name} onPress={() => {}} />
            ))}
          </View>

          <View style={styles.actionsRow}>
            <Text
              style={styles.editGroup}
              onPress={() => router.push("/manage")}
            >
              ⚙️ 그룹 수정
            </Text>
          </View>

          <PrimaryButton
            label="뽑기!"
            onPress={pickGroup}
            style={{ marginTop: 18 }}
          />
        </View>
      )}

      {/* 2) 그룹 결과 화면 */}
      {phase === "GROUP_RESULT" && (
        <View style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.title} source={logo} />
            <Text style={styles.subtitle}>지금 할 건...</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>결과는...</Text>
            <Text style={styles.resultBig}>{pickedGroup?.name ?? "그룹"}</Text>
          </View>

          <SecondaryButton
            label="다시 뽑기"
            onPress={pickGroup}
            style={{ marginTop: 16 }}
          />
          <PrimaryButton
            label="이 그룹에서 할일 뽑기"
            onPress={goPickTaskInGroup}
            style={{ marginTop: 10 }}
          />
          <SecondaryButton
            label="메인 화면으로"
            onPress={() => router.push("/")}
            style={{ marginTop: 10 }}
          />
        </View>
      )}

      {/* 3) 할일 선택 화면 */}
      {phase === "TASK_SELECT" && (
        <View style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.title} source={logo} />
            <Text style={styles.subtitle}>{pickedGroup?.name} 중에서...</Text>
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            {getTasksByGroupId(pickedGroupId ?? "").map((t) => (
              <ListItem key={t.id} title={t.name} />
            ))}
          </View>

          <View style={styles.actionsRow}>
            <Text
              style={styles.editGroup}
              onPress={() => {
                if (!pickedGroupId) return;
                router.push({
                  pathname: "/manage/[groupId]",
                  params: { groupId: pickedGroupId },
                });
              }}
            >
              ⚙️ 할일 수정
            </Text>
          </View>

          <PrimaryButton
            label="뽑기!"
            onPress={pickTask}
            style={{ marginTop: 18 }}
          />
        </View>
      )}

      {/* 4) 할일 결과 화면 */}
      {phase === "TASK_RESULT" && (
        <View style={styles.page}>
          <View style={styles.header}>
            <Image style={styles.title} source={logo} />
            <Text style={styles.subtitle}>{pickedGroup?.name} 중에서...</Text>
          </View>

          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>결과는...</Text>
            <Text style={styles.resultBig}>{pickedTask?.name ?? "할일"}</Text>
          </View>

          <SecondaryButton
            label="다시 뽑기"
            onPress={pickTask}
            style={{ marginTop: 16 }}
          />
          <PrimaryButton
            label="메인 화면으로"
            onPress={() => router.push("/")}
            style={{ marginTop: 10 }}
          />
        </View>
      )}
    </Screen>
  );
};

export default TodoPickScreen;

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
  },
  page: { paddingHorizontal: 22 },
  header: {
    alignItems: "center",
    marginBottom: 18,
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
    ...Typography.body,
  },
  actionsRow: { marginTop: 12, alignItems: "flex-end" },
  editGroup: {
    color: Colors.textSecondary,
    ...Typography.body,
  },
  resultCard: {
    marginTop: 28,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: 10,
  },
  resultLabel: {
    fontSize: 12,
    opacity: 0.6,
    color: Colors.textPrimary,
    ...Typography.subtitle,
  },
  resultBig: { fontSize: 24, color: Colors.textPrimary, ...Typography.title },
});
