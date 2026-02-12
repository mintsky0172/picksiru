import { Modal, StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

type Props = {
  visible: boolean;
  message?: string;
};

const LoadingOverlay = ({ visible, message = "시루가 뽑는 중..." }: Props) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <Image style={styles.siru} source={require("@/assets/lottie/lottie_full.png")} />
          <Text style={styles.text}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

export default LoadingOverlay;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    justifyContent: "center",
    alignItems: "center",
  },
  siru: {
    width: 150,
    height: 150,
    resizeMode: 'contain'
  },
  text: {
    marginTop: -6,
    textAlign: "center",
    color: Colors.surface,
    ...Typography.body,
  },
});
