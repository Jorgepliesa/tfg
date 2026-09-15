import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';

export type ItemCategory = 'head' | 'body' | 'legs' | 'feet' | 'arms' | 'accessory' | 'face';

export interface EquippedItem {
    item: string;
    type: ItemCategory;
    imageUrl?: string; // URL completa de la imagen del item (para overlay)
}

const TYPE_ICONS: Record<ItemCategory, string> = {
    head: 'checkroom', body: 'accessibility', legs: 'directions-walk',
    feet: 'directions-run', arms: 'sports-handball', face: 'tag-faces', accessory: 'star',
};

const TYPE_COLORS: Record<ItemCategory, string> = {
    head: '#FFD9E8', body: '#D0E8F2', legs: '#FDEBD0',
    feet: '#E8D5F5', arms: '#C8F7DC', face: '#FFF3CD', accessory: '#D5E8FF',
};

// Posiciones y tamaños de cada slot expresados en porcentaje del tamaño del avatar.
// Ajusta estos valores para que cada item encaje visualmente sobre la figura.
const OVERLAY_POSITIONS: Record<ItemCategory, {
    top: string; left: string; width: string; height: string;
}> = {
    head: { top: '-5%', left: '31%', width: '40%', height: '12%' },
    face: { top: '12%', left: '25%', width: '50%', height: '18%' },
    body: { top: '33%', left: '15%', width: '70%', height: '30%' },
    arms: { top: '38%', left: '2%', width: '20%', height: '30%' },
    legs: { top: '60%', left: '20%', width: '60%', height: '28%' },
    feet: { top: '83%', left: '20%', width: '60%', height: '17%' },
    accessory: { top: '2%', left: '62%', width: '30%', height: '30%' },
};

// Posiciones del badge fallback (cuando no hay imagen)
const BADGE_POSITIONS: Record<ItemCategory, { top: string; left?: string; right?: string }> = {
    head: { top: '0%', left: '38%' },
    face: { top: '16%', left: '38%' },
    body: { top: '38%', left: '38%' },
    arms: { top: '40%', left: '10%' },
    legs: { top: '66%', left: '38%' },
    feet: { top: '86%', left: '38%' },
    accessory: { top: '4%', right: '6%' },
};

// Componente de overlay con la imagen del item superpuesta sobre el avatar
function ItemOverlay({
    type,
    imageUrl,
    isPreview,
    size,
}: {
    type: ItemCategory;
    imageUrl: string;
    isPreview?: boolean;
    size: number;
}) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        opacity.setValue(0);
        Animated.timing(opacity, {
            toValue: isPreview ? 0.85 : 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [imageUrl]);

    const pos = OVERLAY_POSITIONS[type];
    if (!pos) return null;

    // Convertir porcentajes a valores absolutos según el tamaño del avatar
    const pct = (val: string) => (parseFloat(val) / 100) * size;

    return (
        <Animated.View
            style={[
                styles.overlayWrapper,
                {
                    top: pct(pos.top),
                    left: pct(pos.left),
                    width: pct(pos.width),
                    height: pct(pos.height),
                    opacity,
                },
                isPreview && styles.overlayPreview,
            ]}
        >
            <Image
                source={{ uri: imageUrl }}
                style={styles.overlayImage}
                contentFit="contain"
            />
        </Animated.View>
    );
}

// Badge fallback — se usa cuando el item no tiene imagen
function EquippedBadge({
    type,
    isPreview,
}: {
    type: ItemCategory;
    isPreview?: boolean;
}) {
    const scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        scale.setValue(0);
        Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    }, []);

    const pos = BADGE_POSITIONS[type];
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
    avatarUrl,
    size = 300,
    isPreview = false,
}: {
    equipped: EquippedItem[];
    avatarUrl: string;
    size?: number;
    isPreview?: boolean;
}) {
    return (
        <View style={[styles.stage, { width: size, height: size }]}>
            {/* Avatar base */}
            <Image
                source={{ uri: avatarUrl }}
                style={{ width: size, height: size }}
                contentFit="contain"
            />

            {/* Capas de items superpuestas */}
            {equipped.map((e) =>
                e.imageUrl ? (
                    <ItemOverlay
                        key={`overlay-${e.type}-${e.item}`}
                        type={e.type}
                        imageUrl={e.imageUrl}
                        isPreview={isPreview}
                        size={size}
                    />
                ) : (
                    <EquippedBadge
                        key={`badge-${e.type}-${e.item}`}
                        type={e.type}
                        isPreview={isPreview}
                    />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    stage: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },

    // Overlay con imagen real del item
    overlayWrapper: {
        position: 'absolute',
    },
    overlayImage: {
        width: '100%',
        height: '100%',
    },
    overlayPreview: {
        borderWidth: 1,
        borderColor: '#6B5B95',
        borderStyle: 'dashed',
        borderRadius: 4,
    },

    // Badge fallback (sin imagen)
    badge: {
        position: 'absolute',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    badgePreview: {
        borderColor: '#6B5B95',
        borderStyle: 'dashed',
        opacity: 0.85,
    },
});