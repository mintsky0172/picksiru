import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";

type Props = {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
};

const ModalSheet = ({ title, children, onClose }: Props) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? Spacing.md : 0}
      >
        <View style={[styles.sheet, { paddingBottom: 24 + insets.bottom }]}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.close}>x</Text>
            </Pressable>
          </View>

          {children}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ModalSheet;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  }, 
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 18,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  close: {
    fontSize: 18,
    color: Colors.textSecondary,
    ...Typography.body,
  },
});
