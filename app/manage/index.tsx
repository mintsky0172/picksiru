import { StyleSheet, Text, View, Image, Alert, Pressable } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import Screen from "../../components/ui/Screen";
import ListItem from "@/components/ui/ListItem";
import PrimaryButton from "@/components/ui/PrimaryButton";
import SecondaryButton from "@/components/ui/SecondaryButton";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { usePickStore } from "@/store/usePickStore";

const ManageGroupScreen = () => {
  const router = useRouter();
  const groups = usePickStore((s) => s.groups);
  const deleteGroup = usePickStore((s) => s.deleteGroup);
  const resetAll = usePickStore((s) => s.resetAll);

  const insets = useSafeAreaInsets();
  const logo = require("../../assets/images/labels/managelogo.png");

  return (
    <Screen
      style={[styles.container, { paddingTop: Math.max(0, 60 - insets.top) }]}
    >
      <View style={styles.header}>
        <Image source={logo} style={styles.title} />
        <Text style={styles.subtitle}>그룹 관리</Text>
      </View>

      <View style={styles.list}>
        {groups.length === 0 ? (
          <Text
            style={{
              color: Colors.textSecondary,
              ...Typography.body,
              textAlign: "center",
              marginTop: 16,
            }}
          >
            아직 그룹이 없어. '그룹 추가'로 시작해 보자!
          </Text>
        ) : (
          groups.map((g) => (
            <View key={g.id} style={styles.itemWrap}>
              <ListItem
                title={g.name}
                onPress={() =>
                  router.push({
                    pathname: "/manage/[groupId]",
                    params: { groupId: g.id },
                  })
                }
                onEdit={() =>
                  router.push({
                    pathname: "/edit-group",
                    params: { groupId: g.id },
                  })
                }
                onDelete={() =>
                  Alert.alert("그룹 삭제", "이 그룹과 모든 할일을 삭제할까?", [
                    { text: "취소", style: "cancel" },
                    {
                      text: "삭제",
                      style: "destructive",
                      onPress: () => deleteGroup(g.id),
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
          label="그룹 추가"
          onPress={() => router.push("/add-group")}
          style={{ marginBottom: 12, marginTop: 4 }}
        />
        <SecondaryButton
          label="메인 화면으로"
          onPress={() => router.push("/")}
        />
        <Pressable
          onPress={() => {
            Alert.alert(
              "전체 초기화",
              "모든 그룹과 할일을 삭제할까?\n(이 작업은 되돌릴 수 없어)",
              [
                { text: "취소", style: "cancel" },
                {
                  text: "삭제",
                  style: "destructive",
                  onPress: () => resetAll(),
                },
              ],
            );
          }}
          style={{ marginTop: 28, alignItems: "center" }}
        >
          <Text
            style={{
              color: Colors.textSecondary, ...Typography.body,
              fontSize: 12,
              textDecorationLine: "underline",
              alignSelf: "flex-end",
            }}
          >
            ⚠️ 전체 초기화
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
};

export default ManageGroupScreen;

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
