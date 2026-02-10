import { Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";

type Props = {
  title: string;
  rightText?: string;
  onPress?: () => void;
};

const ListItem = ({ title, onPress }: Props) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={styles.right}>
        <Text style={styles.edit}>✏️</Text>
        <Text style={styles.delete}>❌</Text>
      </View>
    </Pressable>
  );
};

export default ListItem;

const styles = StyleSheet.create({
  row: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.9,
  },
  title: {
    color: Colors.textPrimary,
    ...Typography.body,
    fontSize: 14,
    textAlign: "center",
  },
  right: {
    display: 'flex',
    flexDirection: 'row',
    position: "absolute",
    right: Spacing.md,
    top: 0,
    bottom: 0,
    width: 32,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm
  },
  edit: {
    fontSize: 14,
  },
  delete: {
    fontSize: 14,
  }
});
