import React from 'react';
import { Pressable, Image, StyleSheet, ViewStyle } from 'react-native';

type Props = {
    source: any;
    size?: number;
    onPress: () => void;
    style?: ViewStyle;
};

export default function PickBall({
    source,
    size = 150,
    onPress,
    style,
}: Props) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.base,
                { width: size, height: size, opacity: pressed ? 0.85 : 1, transform: [{scale: pressed ? 0.98 : 1}]},
                style,
            ]}
            accessibilityRole="button"
    >
        <Image source={source} style={styles.image} />
    </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        borderRadius: 999,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain'
    }
})