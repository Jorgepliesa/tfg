import { useRouter } from 'expo-router';
import {
    View, Text, StyleSheet, Pressable,
    ScrollView, ActivityIndicator, Alert, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { shopService } from '../../services/shopService';

const CATEGORIES = ['head', 'body', 'arms', 'legs', 'feet', 'face', 'accessory'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_ICONS: Record<Category, string> = {
    head: 'face', body: 'accessibility', arms: 'sports-handball',
    legs: 'directions-walk', feet: 'directions-run',
    face: 'tag-faces', accessory: 'star',
};
const CATEGORY_LABELS: Record<Category, string> = {
    head: 'Cabeza', body: 'Cuerpo', arms: 'Brazos',
    legs: 'Piernas', feet: 'Pies', face: 'Cara', accessory: 'Accesorios',
};
const CATEGORY_COLORS: Record<Category, string> = {
    head: '#FFD9E8', body: '#D0E8F2', arms: '#C8F7DC',
    legs: '#FDEBD0', feet: '#E8D5F5', face: '#FFF3CD', accessory: '#D5E8FF',
};

interface KeepEntry {
    item: string;
    isWearing: boolean;
    itemEntity: { name: string; type: Category; cost: number; };
}

export default function Inventory() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<Category>('head');
    const [inventory, setInventory] = useState<KeepEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => { loadInventory(); }, [])
    );

    const loadInventory = async () => {
        try {
            setLoading(true);
            const inv = await shopService.getInventory();
            setInventory(inv);
        } catch (error) {
            Alert.alert('Error', 'No se pudo cargar el inventario');
        } finally {
            setLoading(false);
        }
    };

    const handleEquip = async (itemName: string) => {
        try {
            await shopService.equipItem(itemName);
            await loadInventory();
        } catch {
            Alert.alert('Error', 'No se pudo equipar el objeto');
        }
    };

    const filtered = inventory.filter(k => k.itemEntity?.type === activeCategory);

    if (loading) return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6B5B95" />
            </View>
        </SafeAreaView>
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>Inventario</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tabsScroll}
                contentContainerStyle={styles.tabsContent}
            >
                {CATEGORIES.map(cat => (
                    <Pressable
                        key={cat}
                        style={[
                            styles.tab,
                            { backgroundColor: CATEGORY_COLORS[cat] },
                            activeCategory === cat && styles.tabActive,
                        ]}
                        onPress={() => setActiveCategory(cat)}
                    >
                        <MaterialIcons
                            name={CATEGORY_ICONS[cat] as any}
                            size={22}
                            color={activeCategory === cat ? '#6B5B95' : '#888'}
                        />
                        <Text style={[styles.tabLabel, activeCategory === cat && styles.tabLabelActive]}>
                            {CATEGORY_LABELS[cat]}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
            >
                {filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inventory-2" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No tienes objetos en esta categoría</Text>
                        <Pressable
                            style={({ pressed }) => [styles.shopButton, pressed && { opacity: 0.8 }]}
                            onPress={() => router.push('/(tabs)/shop')}
                        >
                            <MaterialIcons name="storefront" size={20} color="#fff" />
                            <Text style={styles.shopButtonText}>Ir a la tienda</Text>
                        </Pressable>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {filtered.map(entry => (
                            <Pressable
                                key={entry.item}
                                style={[
                                    styles.itemCard,
                                    { backgroundColor: CATEGORY_COLORS[entry.itemEntity.type] },
                                    entry.isWearing && styles.itemCardEquipped,
                                ]}
                                onPress={() => handleEquip(entry.item)}
                            >
                                <View style={styles.itemImageBox}>
                                    <MaterialIcons
                                        name={CATEGORY_ICONS[entry.itemEntity.type] as any}
                                        size={48}
                                        color="#6B5B95"
                                    />
                                </View>

                                <Text style={styles.itemName} numberOfLines={2}>
                                    {entry.item}
                                </Text>

                                {entry.isWearing ? (
                                    <View style={styles.equippedBadge}>
                                        <Text style={styles.equippedBadgeText}>Equipado</Text>
                                    </View>
                                ) : (
                                    <View style={styles.unequippedBadge}>
                                        <Text style={styles.unequippedBadgeText}>Equipar</Text>
                                    </View>
                                )}
                            </Pressable>
                        ))}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: 'lightcyan' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backButton: {
        padding: 8, marginRight: 12, borderRadius: 12,
        minWidth: 44, minHeight: 44,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: {
        flex: 1, fontSize: 24, fontWeight: '600',
        color: '#2D3E50', textAlign: 'center',
    },
    headerSpacer: { width: 44 },
    tabsScroll: { maxHeight: 70 },
    tabsContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    tab: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 14, paddingVertical: 8,
        borderRadius: 20, gap: 6,
        borderWidth: 2, borderColor: 'transparent',
    },
    tabActive: { borderColor: '#6B5B95' },
    tabLabel: { fontSize: 13, fontWeight: '500', color: '#888' },
    tabLabelActive: { color: '#6B5B95', fontWeight: '700' },
    container: { flex: 1 },
    gridContent: { paddingHorizontal: 16, paddingTop: 16 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    itemCard: {
        width: '47%', borderRadius: 20, padding: 16,
        alignItems: 'center', minHeight: 160,
        justifyContent: 'space-between',
        borderWidth: 2, borderColor: 'transparent',
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    itemCardEquipped: { borderColor: '#6B5B95' },
    itemImageBox: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    },
    itemName: {
        fontSize: 13, fontWeight: '600',
        color: '#2D3E50', textAlign: 'center',
    },
    equippedBadge: {
        backgroundColor: '#6B5B95', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 3,
    },
    equippedBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
    unequippedBadge: {
        backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10,
        paddingHorizontal: 10, paddingVertical: 3,
        borderWidth: 1, borderColor: '#6B5B95',
    },
    unequippedBadgeText: { fontSize: 11, color: '#6B5B95', fontWeight: '600' },
    emptyState: {
        alignItems: 'center', paddingTop: 80, gap: 16,
    },
    emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center' },
    shopButton: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#6B5B95', borderRadius: 20,
        paddingHorizontal: 20, paddingVertical: 12,
    },
    shopButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});