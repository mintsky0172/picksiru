import {
  StyleProp,
  StyleSheet,
  TextInput,
  TextStyle,
} from "react-native";
import React from "react";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: StyleProp<TextStyle>;
};

const TextField = ({ value, onChangeText, placeholder, style }: Props) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.textDisabled}
      style={[styles.input, style]}
    />
  );
};

export default TextField;

const styles = StyleSheet.create({
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    color: Colors.textPrimary,
    ...Typography.body,
    fontSize: 14,
  },
});
