import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import Screen from "../../components/ui/Screen";
import ListItem from "@/components/ui/ListItem";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MOCK_TASKS = ["할일 1", "할일 2", "할일 3", "할일 4", "할일 5"];

const ManageTasksScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logo = require("../../assets/images/labels/managelogo.png");
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  return (
    <Screen
      style={[styles.container, { paddingTop: Math.max(0, 60 - insets.top) }]}
    >
      <View style={styles.header}>
        <Image source={logo} style={styles.title} />
        <Text style={styles.subtitle}>할일 관리</Text>
      </View>

      <View style={styles.list}>
        {MOCK_TASKS.map((g) => (
          <View key={g} style={styles.itemWrap}>
            <ListItem
              title={g}
              onPress={() =>
                router.push({
                  pathname: "/manage/[groupId]",
                  params: { groupId: g },
                })
              }
            />
          </View>
        ))}
      </View>

      <View style={styles.bottom}>
        <PrimaryButton
          label="할일 추가"
          onPress={() =>
            router.push({
              pathname: "/(modal)/add-task",
              params: { groupId },
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
