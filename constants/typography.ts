import type { TextStyle } from "react-native";

export const FontFamily = {
  base: "Iseoyun",
} as const;

export const Typography: Record<string, TextStyle> = {
  title: {
    fontFamily: FontFamily.base,
    fontSize: 24,
    lineHeight: 32,
  },
  subtitle: {
    fontFamily: FontFamily.base,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    fontFamily: FontFamily.base,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: FontFamily.base,
    fontSize: 12,
    lineHeight: 18,
  },
};
