import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { useProStore } from "@/store/useProStore";
import PickBall from "@/components/ui/PickBall";
import { Colors } from "@/constants/colors";
import { Spacing } from "@/constants/spacing";
import { Typography } from "@/constants/typography";

export default function HomeScreen() {
  const router = useRouter();

  const balls = {
    todo: require("../assets/images/pickballs/todoball.png"),
    number: require("../assets/images/pickballs/numberball.png"),
    binary: require("../assets/images/pickballs/binaryball.png"),
    wheel: require("../assets/images/pickballs/wheelball.png"),
  };

  const logo = require("../assets/images/labels/mainlogo.png");
  const pro = require("../assets/images/pickballs/proball.png");

  const isProUnlocked = useProStore((s) => s.isUnlocked());

  const onPressPro = () => {
    router.push("/pro/intro");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.subtitle}>지금 하나만 골라보자</Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.row}>
          <PickBall
            source={balls.todo}
            onPress={() => router.push("/todo-pick")}
          />
          <PickBall
            source={balls.number}
            onPress={() => router.push("/number-pick")}
          />
        </View>
        <View style={styles.row}>
          <PickBall
            source={balls.binary}
            onPress={() => router.push("/binary-pick")}
          />
          <PickBall
            source={balls.wheel}
            onPress={() => router.push("/roulette-pick")}
          />
        </View>
      </View>

      <View style={styles.footerContainer}>
        <Text style={styles.footer}>ⓒ 시루네 다락방</Text>
        <View style={styles.proContainer}>
          <Image source={pro} style={styles.proBall} />
          <Text style={styles.proText} onPress={onPressPro}>
            Pro 모드
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: 60,
    paddingBottom: 24,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  logo: {
    width: 220,
    height: 90,
    resizeMode: "contain",
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.textPrimary,
    ...Typography.subtitle,
  },
  grid: {
    flex: 1,

    alignItems: "center",
    gap: Spacing.pickBallGap,
    justifyContent: "flex-start",
    marginTop: 24,
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    gap: Spacing.pickBallGap,
  },
  proContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  proBall: {
    width: 50,
    height: 50,
    resizeMode: "contain",
  },
  proText: {
    color: Colors.textPrimary,
    ...Typography.body,
  },
  footerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  footer: {
    color: Colors.textSecondary,
    opacity: 0.7,
    ...Typography.caption,
  },
});
