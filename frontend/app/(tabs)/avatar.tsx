import { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BACKEND_URL } from "@/services/api";

export type ItemCategory = 'head' | 'body' | 'legs' | 'feet' | 'arms' | 'accessory' | 'face';

export interface EquippedItem {
    item: string;
    type: ItemCategory;
}

const TYPE_ICONS: Record<ItemCategory, string> = {
    head: 'checkroom', body: 'accessibility', legs: 'directions-walk',
    feet: 'directions-run', arms: 'sports-handball', face: 'tag-faces', accessory: 'star',
};

const TYPE_COLORS: Record<ItemCategory, string> = {
    head: '#FFD9E8', body: '#D0E8F2', legs: '#FDEBD0',
    feet: '#E8D5F5', arms: '#C8F7DC', face: '#FFF3CD', accessory: '#D5E8FF',
};

// Posiciones ancla sobre el avatar — ajusta estos porcentajes a ojo según tu Avatar.png
const ANCHOR_POSITIONS: Record<ItemCategory, { top: string; left?: string; right?: string }> = {
    head: { top: '0%', left: '38%' },
    face: { top: '16%', left: '38%' },
    body: { top: '38%', left: '38%' },
    arms: { top: '40%', left: '10%' },
    legs: { top: '66%', left: '38%' },
    feet: { top: '86%', left: '38%' },
    accessory: { top: '4%', right: '6%' },
};

function EquippedBadge({ type, isPreview }: { type: ItemCategory; itemName: string; isPreview?: boolean }) {
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        scale.setValue(0);
        Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const pos = ANCHOR_POSITIONS[type];
    if (!pos) return null;

    return (
        <Animated.View
            style={[
                styles.badge,
                { backgroundColor: TYPE_COLORS[type] ?? '#eee', transform: [{ scale }] },
                isPreview && styles.badgePreview,
                pos as any,
            ]}
        >
            <MaterialIcons name={(TYPE_ICONS[type] ?? 'star') as any} size={18} color="#6B5B95" />
        </Animated.View>
    );
}

export function AvatarDisplay({
    equipped,
    size = 300,
    isPreview = false,
}: {
    equipped: EquippedItem[];
    size?: number;
    isPreview?: boolean;
}) {
    return (
        <View style={[styles.stage, { width: size, height: size }]}>
            <Image source={{ uri: `${BACKEND_URL}/uploads/images/Avatar.png` }} style={{ width: size, height: size, resizeMode: 'contain' }} />
            {equipped.map((e) => (
                <EquippedBadge key={`${e.type}-${e.item}`} type={e.type} itemName={e.item} isPreview={isPreview} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    stage: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
    badge: {
        position: 'absolute', width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff',
        elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3,
    },
    badgePreview: {
        borderColor: '#6B5B95',
        borderStyle: 'dashed',
        opacity: 0.85,
    },
});