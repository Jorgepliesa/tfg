import { useRouter } from 'expo-router';
import {
    View, Text, StyleSheet, Pressable, ScrollView,
    ActivityIndicator, Animated, Dimensions,
    Modal, Platform,
} from 'react-native';
import { appAlert } from '@/components/AppAlert';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { memorialService } from '../../services/memorialService';
import { BACKEND_URL } from "@/services/api";


const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 104) / 2; // 2 columnas con padding, margen y espaciado
const CARDS_PER_PAGE = 6; // 2 col x 3 rows por página

interface Memorial {
    name: string;
    description: string;
    image: string;
    unlocked: boolean;
}

// Colores para las cartas desbloqueadas (cicla por índice)
const CARD_COLORS = [
    '#FFD9E8', '#D0E8F2', '#C8F7DC',
    '#FDEBD0', '#E8D5F5', '#FFF3CD', '#D5E8FF',
];

function MemorialCard({
    memorial,
    index,
    onPress,
}: {
    memorial: Memorial;
    index: number;
    onPress: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    const bgColor = memorial.unlocked
        ? CARD_COLORS[index % CARD_COLORS.length]
        : '#E0E0E0';

    return (
        <Pressable
            onPress={memorial.unlocked ? onPress : undefined}
            onPressIn={memorial.unlocked ? handlePressIn : undefined}
            onPressOut={memorial.unlocked ? handlePressOut : undefined}
        >
            <Animated.View
                style={[
                    styles.card,
                    { backgroundColor: bgColor, transform: [{ scale: scaleAnim }] },
                    !memorial.unlocked && styles.cardLocked,
                ]}
            >
                {memorial.unlocked ? (
                    <>
                        {/* Imagen */}
                        <View style={[styles.cardImageBox, { backgroundColor: 'rgba(255,255,255,0.5)' }]}>
                            {memorial.image ? (
                                <Image
                                    source={{ uri: memorial.image }}
                                    style={styles.cardImage}
                                />
                            ) : (
                                <MaterialIcons name="favorite" size={36} color="#6B5B95" />
                            )}
                        </View>

                        {/* Número de carta */}
                        <View style={styles.cardNumber}>
                            <Text style={styles.cardNumberText}>#{index + 1}</Text>
                        </View>

                        <Text style={styles.cardName} numberOfLines={2}>
                            {memorial.name}
                        </Text>
                    </>
                ) : (
                    <>
                        <View style={styles.cardLockedIcon}>
                            <MaterialIcons name="lock" size={36} color="#aaa" />
                        </View>
                        <Text style={styles.cardLockedText}>???</Text>
                        <Text style={styles.cardLockedSubtext}>Completa objetivos</Text>
                    </>
                )}
            </Animated.View>
        </Pressable>
    );
}

function CardDetailModal({
    memorial,
    index,
    visible,
    onClose,
}: {
    memorial: Memorial | null;
    index: number;
    visible: boolean;
    onClose: () => void;
}) {
    const flipAnim = useRef(new Animated.Value(0)).current;
    const [showBack, setShowBack] = useState(false);

    const handleFlip = () => {
        if (!showBack) {
            Animated.timing(flipAnim, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start(() => setShowBack(true));
        } else {
            Animated.timing(flipAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }).start(() => setShowBack(false));
        }
    };

    const frontRotate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });
    const backRotate = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['180deg', '360deg'],
    });
    const frontOpacity = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0, 0],
    });
    const backOpacity = flipAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0, 0, 1],
    });

    if (!memorial) return null;

    const bgColor = CARD_COLORS[index % CARD_COLORS.length];

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    {/* Carta con flip */}
                    <Pressable onPress={handleFlip} style={styles.flipCardContainer}>
                        {/* Cara frontal */}
                        <Animated.View style={[
                            styles.flipCard,
                            { backgroundColor: bgColor },
                            {
                                transform: [{ rotateY: frontRotate }],
                                opacity: frontOpacity,
                            },
                        ]}>
                            <View style={styles.cardNumber}>
                                <Text style={styles.cardNumberText}>#{index + 1}</Text>
                            </View>

                            <View style={styles.detailImageBox}>
                                {memorial.image ? (
                                    <Image
                                        source={{ uri: memorial.image }}
                                        style={styles.detailImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <MaterialIcons name="favorite" size={72} color="#6B5B95" />
                                )}
                            </View>

                            <Text style={styles.detailName}>{memorial.name}</Text>

                            <View style={styles.flipHint}>
                                <MaterialIcons name="touch-app" size={16} color="#888" />
                                <Text style={styles.flipHintText}>Toca para voltear</Text>
                            </View>
                        </Animated.View>

                        {/* Cara trasera */}
                        <Animated.View style={[
                            styles.flipCard,
                            styles.flipCardBack,
                            { backgroundColor: bgColor },
                            {
                                transform: [{ rotateY: backRotate }],
                                opacity: backOpacity,
                            },
                        ]}>
                            <Text style={styles.backTitle}>Sabías que...</Text>
                            <Text style={styles.backDescription}>{memorial.description}</Text>

                            <View style={styles.flipHint}>
                                <MaterialIcons name="touch-app" size={16} color="#888" />
                                <Text style={styles.flipHintText}>Toca para voltear</Text>
                            </View>
                        </Animated.View>
                    </Pressable>

                    <Pressable
                        style={({ pressed }) => [styles.closeButton, pressed && { opacity: 0.7 }]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>Cerrar</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

export default function Memorials() {
    const router = useRouter();
    const [memorials, setMemorials] = useState<Memorial[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedMemorial, setSelectedMemorial] = useState<Memorial | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [showDetail, setShowDetail] = useState(false);
    const scrollRef = useRef<ScrollView>(null);
    const pageAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => { loadMemorials(); }, [])
    );

    const loadMemorials = async () => {
        try {
            setLoading(true);
            const data = await memorialService.getMemorials();
            setMemorials(data);
        } catch (error) {
            appAlert('Error', 'No se pudo cargar el álbum');
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(memorials.length / CARDS_PER_PAGE);
    const unlockedCount = memorials.filter(m => m.unlocked).length;

    const goToPage = (page: number) => {
        if (page < 0 || page >= totalPages) return;

        Animated.sequence([
            Animated.timing(pageAnim, {
                toValue: page > currentPage ? -30 : 30,
                duration: 120,
                useNativeDriver: true,
            }),
            Animated.timing(pageAnim, {
                toValue: 0,
                duration: 120,
                useNativeDriver: true,
            }),
        ]).start();

        setCurrentPage(page);
    };

    const pageMemorials = memorials.slice(
        currentPage * CARDS_PER_PAGE,
        (currentPage + 1) * CARDS_PER_PAGE,
    );

    const handleCardPress = (memorial: Memorial, index: number) => {
        setSelectedMemorial(memorial);
        setSelectedIndex(currentPage * CARDS_PER_PAGE + index);
        setShowDetail(true);
    };

    if (loading) return (
        <SafeAreaView style={styles.safeContainer}>
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6B5B95" />
            </View>
        </SafeAreaView>
    );

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
                <Text style={styles.headerTitle}>Álbum</Text>
                <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>{unlockedCount}/{memorials.length}</Text>
                </View>
            </View>

            {/* Subtítulo */}
            <Text style={styles.subtitle}>
                Completa objetivos para desbloquear nuevas cartas
            </Text>

            {/* Álbum — página animada */}
            <View style={styles.albumContainer}>
                {/* Sombra de página detrás (efecto álbum) */}
                <View style={styles.albumShadow} />
                <View style={styles.albumPage}>
                    <Animated.View
                        style={[
                            styles.pageContent,
                            { transform: [{ translateX: pageAnim }] },
                        ]}
                    >
                        {/* Línea decorativa de álbum */}
                        <View style={styles.albumSpine} />

                        <View style={styles.grid}>
                            {pageMemorials.map((memorial, i) => (
                                <MemorialCard
                                    key={memorial.name}
                                    memorial={memorial}
                                    index={currentPage * CARDS_PER_PAGE + i}
                                    onPress={() => handleCardPress(memorial, i)}
                                />
                            ))}

                            {/* Relleno si la última página no está completa */}
                            {pageMemorials.length < CARDS_PER_PAGE &&
                                Array(CARDS_PER_PAGE - pageMemorials.length)
                                    .fill(null)
                                    .map((_, i) => (
                                        <View key={`empty-${i}`} style={styles.cardEmpty} />
                                    ))
                            }
                        </View>

                        {/* Número de página */}
                        <Text style={styles.pageNumber}>
                            Página {currentPage + 1} de {totalPages}
                        </Text>
                    </Animated.View>
                </View>
            </View>

            {/* Navegación de páginas */}
            <View style={styles.pageNav}>
                <Pressable
                    style={({ pressed }) => [
                        styles.pageNavBtn,
                        currentPage === 0 && styles.pageNavBtnDisabled,
                        pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    <MaterialIcons name="chevron-left" size={32} color={currentPage === 0 ? '#ccc' : '#6B5B95'} />
                    <Text style={[styles.pageNavText, currentPage === 0 && styles.pageNavTextDisabled]}>
                        Anterior
                    </Text>
                </Pressable>

                {/* Puntos indicadores */}
                <View style={styles.pageDots}>
                    {Array(totalPages).fill(null).map((_, i) => (
                        <Pressable key={i} onPress={() => goToPage(i)}>
                            <View style={[
                                styles.pageDot,
                                i === currentPage && styles.pageDotActive,
                            ]} />
                        </Pressable>
                    ))}
                </View>

                <Pressable
                    style={({ pressed }) => [
                        styles.pageNavBtn,
                        currentPage === totalPages - 1 && styles.pageNavBtnDisabled,
                        pressed && { opacity: 0.7 },
                    ]}
                    onPress={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                >
                    <Text style={[
                        styles.pageNavText,
                        currentPage === totalPages - 1 && styles.pageNavTextDisabled,
                    ]}>
                        Siguiente
                    </Text>
                    <MaterialIcons
                        name="chevron-right"
                        size={32}
                        color={currentPage === totalPages - 1 ? '#ccc' : '#6B5B95'}
                    />
                </Pressable>
            </View>

            {/* Modal de detalle con flip */}
            <CardDetailModal
                memorial={selectedMemorial}
                index={selectedIndex}
                visible={showDetail}
                onClose={() => {
                    setShowDetail(false);
                    setSelectedMemorial(null);
                }}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeContainer: { flex: 1, backgroundColor: '#FFF8F0' },
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
        flex: 1, fontSize: 26, fontWeight: '700', color: '#2D3E50',
    },
    progressBadge: {
        backgroundColor: '#6B5B95', borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    progressText: { fontSize: 14, fontWeight: '700', color: '#fff' },

    subtitle: {
        fontSize: 13, color: '#888',
        textAlign: 'center', marginBottom: 16,
        paddingHorizontal: 24,
    },

    // Álbum
    albumContainer: {
        flex: 1, marginHorizontal: 16, marginBottom: 8,
        position: 'relative',
    },
    albumShadow: {
        position: 'absolute',
        top: 6, left: 6, right: -6, bottom: -6,
        backgroundColor: '#D4C5E8',
        borderRadius: 16,
    },
    albumPage: {
        flex: 1,
        backgroundColor: '#FFFDF5',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
    },
    albumSpine: {
        position: 'absolute',
        left: 28, top: 0, bottom: 0,
        width: 2,
        backgroundColor: '#E8DCC8',
    },
    pageContent: {
        flex: 1, padding: 16, paddingLeft: 40,
    },
    grid: {
        flexDirection: 'row', flexWrap: 'wrap',
        gap: 10, flex: 1,
    },
    pageNumber: {
        textAlign: 'center', fontSize: 12,
        color: '#aaa', paddingVertical: 8,
    },

    // Carta
    card: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.3,
        borderRadius: 14,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: 'rgba(255,255,255,0.8)',
        ...Platform.select({ web: { cursor: 'pointer' } }),
    },
    cardLocked: {
        borderColor: '#ccc',
        borderStyle: 'dashed',
    },
    cardEmpty: {
        width: CARD_WIDTH,
        height: CARD_WIDTH * 1.3,
    },
    cardImageBox: {
        width: CARD_WIDTH - 28,
        height: (CARD_WIDTH - 14),
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%', height: '100%',
    },
    cardNumber: {
        position: 'absolute',
        top: 6, right: 8,
    },
    cardNumberText: {
        fontSize: 10, color: 'rgba(0,0,0,0.3)', fontWeight: '600',
    },
    cardName: {
        fontSize: 11, fontWeight: '700',
        color: '#2D3E50', textAlign: 'center',
    },
    cardLockedIcon: {
        flex: 1, justifyContent: 'center', alignItems: 'center',
    },
    cardLockedText: {
        fontSize: 16, fontWeight: '700', color: '#bbb',
    },
    cardLockedSubtext: {
        fontSize: 9, color: '#ccc', textAlign: 'center',
    },

    // Navegación de páginas
    pageNav: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
    },
    pageNavBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        minWidth: 90,
    },
    pageNavBtnDisabled: { opacity: 0.4 },
    pageNavText: { fontSize: 14, fontWeight: '600', color: '#6B5B95' },
    pageNavTextDisabled: { color: '#ccc' },
    pageDots: {
        flexDirection: 'row', gap: 6, alignItems: 'center',
    },
    pageDot: {
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: '#D4C5E8',
    },
    pageDotActive: {
        backgroundColor: '#6B5B95', width: 12, height: 12, borderRadius: 6,
    },

    // Modal flip
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        alignItems: 'center', gap: 20,
    },
    flipCardContainer: {
        width: 260, height: 360,
        position: 'relative',
    },
    flipCard: {
        position: 'absolute',
        width: 260, height: 360,
        borderRadius: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'space-between',
        backfaceVisibility: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.8)',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    flipCardBack: {
        justifyContent: 'center', gap: 16,
    },
    detailImageBox: {
        width: 220, height: 240,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center', alignItems: 'center',
        overflow: 'hidden',
    },
    detailImage: { width: '100%', height: '100%' },
    detailName: {
        fontSize: 18, fontWeight: '700',
        color: '#2D3E50', textAlign: 'center',
    },
    flipHint: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
    },
    flipHintText: { fontSize: 12, color: '#888' },
    backTitle: {
        fontSize: 20, fontWeight: '700',
        color: '#2D3E50', textAlign: 'center',
    },
    backDescription: {
        fontSize: 15, color: '#444',
        textAlign: 'center', lineHeight: 22,
        flex: 1,
    },
    closeButton: {
        backgroundColor: '#fff',
        borderRadius: 20, paddingHorizontal: 32,
        paddingVertical: 12,
    },
    closeButtonText: {
        fontSize: 16, fontWeight: '600', color: '#6B5B95',
    },
});