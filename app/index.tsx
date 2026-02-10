import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
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
    manage: require("../assets/images/pickballs/manageball.png"),
  };

  const logo = require("../assets/images/labels/mainlogo.png");
  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.subtitle}>지금 하나만 골라보자</Text>
        </View>

      <View style={styles.grid}>
        <View style={styles.row}>
            <PickBall source={balls.todo} onPress={() => router.push('/todo-pick')} />
            <PickBall source={balls.number} onPress={() => router.push('/number-pick')} />
        </View>
        <View style={styles.row}>
            <PickBall source={balls.binary} onPress={() => router.push('/binary-pick')} />
            <PickBall source={balls.manage} onPress={() => router.push('/manage')} />
        </View>
      </View>
      <Text style={styles.footer}>ⓒ 시루네 다락방</Text>
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
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 36,
    },
    logo: {
        width: 220,
        height: 90,
        resizeMode: 'contain',
        marginBottom: 12,
    },
    subtitle: {
        color: Colors.textPrimary,
        ...Typography.subtitle,
    },
    grid: {
        width: '100%',
        alignItems: 'center',
        gap: Spacing.pickBallGap,
        flex: 1,
        justifyContent: 'flex-start',
        marginTop: 24,
    },
    row: {
        flexDirection: 'row',
        gap: Spacing.pickBallGap,
    },
    footer: {
        color: Colors.textSecondary,
        opacity: 0.7,
        ...Typography.caption,
    }
});
