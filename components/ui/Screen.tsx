import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';

type Props = {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>
}

const Screen = ({children, style}: Props) => {
  return (
    <SafeAreaView style={styles.safe}>
        <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  )
}

export default Screen

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: Spacing.screenHorizontal,
        paddingVertical: Spacing.screenVertical
    }
})
