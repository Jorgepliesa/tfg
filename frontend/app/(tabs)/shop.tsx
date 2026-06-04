import { useRouter } from 'expo-router';
import {
    View, Text, StyleSheet, Pressable, ScrollView,
    Modal, ActivityIndicator, Alert, Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { avatarService } from '../../services/avatarService';
import { shopService } from '@/services/shopService';

const CATEGORIES = ['head', 'body', 'arms', 'legs', 'feet', 'face', 'accessory'] as const;
type Category = typeof CATEGORIES[number];

const CATEGORY_ICONS: Record<Category, string> = {
    head: 'face',
    body: 'accessibility',
    arms: 'sports-handball',
    legs: 'directions-walk',
    feet: 'directions-run',
    face: 'tag-faces',
    accessory: 'star',
};

const CATEGORY_LABELS: Record<Category, string> = {
    head: 'Cabeza',
    body: 'Cuerpo',
    arms: 'Brazos',
    legs: 'Piernas',
    feet: 'Pies',
    face: 'Cara',
    accessory: 'Accesorios',
};

const CATEGORY_COLORS: Record<Category, string> = {
    head: '#FFD9E8',
    body: '#D0E8F2',
    arms: '#C8F7DC',
    legs: '#FDEBD0',
    feet: '#E8D5F5',
    face: '#FFF3CD',
    accessory: '#D5E8FF',
};

interface Item {
    name: string;
    type: Category;
    image: string;
    cost: number;
}

interface KeepEntry {
    item: string;
    avatar: number;
    isWearing: boolean;
    itemEntity: Item;
}

export default function Shop() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState<Category>('head');
    const [items, setItems] = useState<Item[]>([]);
    const [inventory, setInventory] = useState<KeepEntry[]>([]);
    const [fp, setFp] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [buying, setBuying] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        try {
            setLoading(true);
            const [allItems, inv, fitnessPoints] = await Promise.all([
                shopService.getAllItems(),
                shopService.getInventory(),
                avatarService.getFitnessPoints(),
            ]);
            setItems(allItems);
            setInventory(inv);
            setFp(fitnessPoints);
        } catch (error) {
            console.error('Error loading shop:', error);
            Alert.alert('Error', 'No se pudo cargar la tienda');
        } finally {
            setLoading(false);
        }
    };

    const isOwned = (itemName: string) =>
        inventory.some(k => k.item === itemName);

    const isEquipped = (itemName: string) =>
        inventory.some(k => k.item === itemName && k.isWearing);

    const handleSelectItem = (item: Item) => {
        setSelectedItem(item);
        setShowConfirmModal(true);
    };

    const handleBuy = async () => {
        if (!selectedItem) return;
        try {
            setBuying(true);
            const result = await shopService.buyItem(selectedItem.name);
            setFp(result.remainingFp);
            await loadData();
            setShowConfirmModal(false);
            Alert.alert('¡Comprado!', `Has adquirido "${selectedItem.name}"`);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'No se pudo completar la compra';
            Alert.alert('Error', msg);
        } finally {
            setBuying(false);
        }
    };

    const handleEquip = async (itemName: string) => {
        try {
            await shopService.equipItem(itemName);
            await loadData();
        } catch (error) {
            Alert.alert('Error', 'No se pudo equipar el objeto');
        }
    };

    const filteredItems = items.filter(i => i.type === activeCategory);

    if (loading) {
        return (
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#6B5B95" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
                    onPress={() => router.back()}
                >
                    <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
                </Pressable>
                <Text style={styles.headerTitle}>Tienda</Text>
                <View style={styles.fpBadge}>
                    <Text style={styles.fpText}>🔥 {fp}</Text>
                </View>
            </View>

            {/* Category tabs */}
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
                        <Text style={[
                            styles.tabLabel,
                            activeCategory === cat && styles.tabLabelActive
                        ]}>
                            {CATEGORY_LABELS[cat]}
                        </Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* Items grid */}
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredItems.length === 0 ? (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="inventory" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No hay artículos en esta categoría</Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {filteredItems.map(item => {
                            const owned = isOwned(item.name);
                            const equipped = isEquipped(item.name);
                            const canAfford = fp >= item.cost;

                            return (
                                <Pressable
                                    key={item.name}
                                    style={[
                                        styles.itemCard,
                                        { backgroundColor: CATEGORY_COLORS[item.type as Category] },
                                        equipped && styles.itemCardEquipped,
                                    ]}
                                    onPress={() => {
                                        if (owned) {
                                            handleEquip(item.name);
                                        } else {
                                            handleSelectItem(item);
                                        }
                                    }}
                                >
                                    {/* Item image placeholder */}
                                    <View style={styles.itemImageBox}>
                                        <MaterialIcons
                                            name={CATEGORY_ICONS[item.type as Category] as any}
                                            size={48}
                                            color="#6B5B95"
                                        />
                                    </View>

                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.name}
                                    </Text>

                                    {equipped && (
                                        <View style={styles.equippedBadge}>
                                            <Text style={styles.equippedBadgeText}>Equipado</Text>
                                        </View>
                                    )}

                                    {owned && !equipped && (
                                        <View style={styles.ownedBadge}>
                                            <Text style={styles.ownedBadgeText}>En inventario</Text>
                                        </View>
                                    )}

                                    {!owned && (
                                        <View style={[
                                            styles.costBadge,
                                            !canAfford && styles.costBadgeInsufficient
                                        ]}>
                                            <Text style={[
                                                styles.costText,
                                                !canAfford && styles.costTextInsufficient
                                            ]}>
                                                🔥 {item.cost}
                                            </Text>
                                        </View>
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Confirm purchase modal */}
            <Modal
                visible={showConfirmModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Confirmar compra</Text>

                        {selectedItem && (
                            <>
                                <View style={[
                                    styles.modalItemPreview,
                                    { backgroundColor: CATEGORY_COLORS[selectedItem.type as Category] }
                                ]}>
                                    <MaterialIcons
                                        name={CATEGORY_ICONS[selectedItem.type as Category] as any}
                                        size={72}
                                        color="#6B5B95"
                                    />
                                </View>

                                <Text style={styles.modalItemName}>{selectedItem.name}</Text>
                                <Text style={styles.modalCategory}>
                                    {CATEGORY_LABELS[selectedItem.type as Category]}
                                </Text>

                                <View style={styles.modalFpRow}>
                                    <Text style={styles.modalFpLabel}>Coste:</Text>
                                    <Text style={styles.modalFpCost}>🔥 {selectedItem.cost}</Text>
                                </View>
                                <View style={styles.modalFpRow}>
                                    <Text style={styles.modalFpLabel}>Tus FP:</Text>
                                    <Text style={[
                                        styles.modalFpOwned,
                                        fp < selectedItem.cost && styles.modalFpInsufficient
                                    ]}>
                                        🔥 {fp}
                                    </Text>
                                </View>

                                {fp < selectedItem.cost && (
                                    <Text style={styles.modalWarning}>
                                        No tienes suficientes FP
                                    </Text>
                                )}
                            </>
                        )}

                        <View style={styles.modalButtons}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalBtnCancel,
                                    pressed && { opacity: 0.7 }
                                ]}
                                onPress={() => setShowConfirmModal(false)}
                            >
                                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.modalBtnBuy,
                                    (fp < (selectedItem?.cost ?? 0) || buying) && styles.modalBtnDisabled,
                                    pressed && { opacity: 0.8 }
                                ]}
                                onPress={handleBuy}
                                disabled={fp < (selectedItem?.cost ?? 0) || buying}
                            >
                                {buying ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={styles.modalBtnBuyText}>Comprar</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: 'lightcyan' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 12,
        minWidth: 44,
        minHeight: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        flex: 1,
        fontSize: 24,
        fontWeight: '600',
        color: '#2D3E50',
        letterSpacing: 0.5,
    },
    fpBadge: {
        backgroundColor: '#FFF3CD',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#F0C040',
    },
    fpText: { fontSize: 16, fontWeight: '700', color: '#8B6914' },
    tabsScroll: { maxHeight: 70 },
    tabsContent: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    tabActive: { borderColor: '#6B5B95' },
    tabLabel: { fontSize: 13, fontWeight: '500', color: '#888' },
    tabLabelActive: { color: '#6B5B95', fontWeight: '700' },
    container: { flex: 1 },
    gridContent: { paddingHorizontal: 16, paddingTop: 16 },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        justifyContent: 'flex-start',
    },
    itemCard: {
        width: '47%',
        borderRadius: 20,
        padding: 16,
        alignItems: 'center',
        minHeight: 160,
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: 'transparent',
        ...Platform.select({
            web: { cursor: 'pointer' },
        }),
    },
    itemCardEquipped: { borderColor: '#6B5B95' },
    itemImageBox: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#2D3E50',
        textAlign: 'center',
    },
    equippedBadge: {
        backgroundColor: '#6B5B95',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    equippedBadgeText: { fontSize: 11, color: '#fff', fontWeight: '700' },
    ownedBadge: {
        backgroundColor: '#C8F7DC',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    ownedBadgeText: { fontSize: 11, color: '#2D7A4F', fontWeight: '600' },
    costBadge: {
        backgroundColor: '#FFF3CD',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    costBadgeInsufficient: { backgroundColor: '#FFE5E5' },
    costText: { fontSize: 12, fontWeight: '700', color: '#8B6914' },
    costTextInsufficient: { color: '#CC4444' },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 16,
    },
    emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center' },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    modalBox: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 360,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2D3E50',
        marginBottom: 20,
    },
    modalItemPreview: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalItemName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D3E50',
        textAlign: 'center',
        marginBottom: 4,
    },
    modalCategory: {
        fontSize: 13,
        color: '#888',
        marginBottom: 20,
    },
    modalFpRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    modalFpLabel: { fontSize: 15, color: '#666' },
    modalFpCost: { fontSize: 15, fontWeight: '700', color: '#8B6914' },
    modalFpOwned: { fontSize: 15, fontWeight: '700', color: '#2D7A4F' },
    modalFpInsufficient: { color: '#CC4444' },
    modalWarning: {
        marginTop: 12,
        fontSize: 13,
        color: '#CC4444',
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 24,
        width: '100%',
    },
    modalBtnCancel: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
    },
    modalBtnCancelText: { fontSize: 16, fontWeight: '600', color: '#555' },
    modalBtnBuy: {
        flex: 1,
        backgroundColor: '#6B5B95',
        borderRadius: 14,
        padding: 14,
        alignItems: 'center',
    },
    modalBtnBuyText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    modalBtnDisabled: { backgroundColor: '#bbb' },
});