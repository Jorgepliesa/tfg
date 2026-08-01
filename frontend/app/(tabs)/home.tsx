import { avatarService } from "@/services/avatarService";
import { omopSensorService } from "@/services/omopSensorService"; import { sessionService } from "@/services/sessionService";
import { shopService } from "@/services/shopService";
import { challengeService, CoopChallengeData } from "@/services/coopChallengeService";
import MaterialIcons from "@expo/vector-icons/build/MaterialIcons";
import { router, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ImageBackground, Text, View, StyleSheet, ActivityIndicator,
  Platform, Dimensions, Image, Pressable, Alert, ScrollView,
  NativeSyntheticEvent, NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ItemCategory, EquippedItem, AvatarDisplay } from "./avatar";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ── Categorías del inventario ─────────────────────────────────────────────────
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

// Indicadores de las páginas
const PAGES = [
  { key: 'coop', icon: 'groups', label: 'Retos' },
  { key: 'home', icon: 'home', label: 'Inicio' },
  { key: 'inventory', icon: 'backpack', label: 'Inventario' },
];

export default function Home() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // ── Estado Home ──────────────────────────────────────────────────────────────
  const [fp, setFp] = useState<number>(0);
  const [numSteps, setSteps] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1); // 0=coop, 1=home, 2=inventario

  // ── Estado Retos Cooperativos ────────────────────────────────────────────────
  const [coopChallenge, setCoopChallenge] = useState<CoopChallengeData | null>(null);
  const [coopLoading, setCoopLoading] = useState<boolean>(false);

  // ── Estado Inventario ────────────────────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<Category>('head');
  const [inventory, setInventory] = useState<KeepEntry[]>([]);
  const [invLoading, setInvLoading] = useState(false);

  // ── Estado de vestuario (avatar) ─────────────────────────────────────────────
  const [committedEquipped, setCommittedEquipped] = useState<Record<ItemCategory, string | null>>({
    head: null, body: null, legs: null, feet: null, arms: null, face: null, accessory: null,
  });
  const [previewEquipped, setPreviewEquipped] = useState<Record<ItemCategory, string | null>>({
    head: null, body: null, legs: null, feet: null, arms: null, face: null, accessory: null,
  });
  const [confirming, setConfirming] = useState(false);

  // ── Carga de datos ───────────────────────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      loadHomeData();
      loadInventory();
      loadCoopChallenge();
    }, [])
  );

  const loadCoopChallenge = async () => {
    try {
      setCoopLoading(true);
      const data = await challengeService.getActiveChallenge();
      setCoopChallenge(data);
    } catch (error) {
      console.error('Error loading coop challenge:', error);
    } finally {
      setCoopLoading(false);
    }
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const [fitnessPoints, steps] = await Promise.all([
        avatarService.getFitnessPoints(),
        omopSensorService.getTodaySteps(),
      ]);
      setFp(fitnessPoints);
      setSteps(steps);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    try {
      setInvLoading(true);
      const inv = await shopService.getInventory();
      setInventory(inv);

      const equippedMap: Record<ItemCategory, string | null> = {
        head: null, body: null, legs: null, feet: null, arms: null, face: null, accessory: null,
      };
      inv.forEach((k: KeepEntry) => {
        if (k.isWearing) equippedMap[k.itemEntity.type as ItemCategory] = k.item;
      });
      setCommittedEquipped(equippedMap);
      setPreviewEquipped(equippedMap); // al recargar, el preview arranca igual al estado real
    } catch {
      // silencioso; se muestra el estado vacío
    } finally {
      setInvLoading(false);
    }
  };

  // ── Equipar item ─────────────────────────────────────────────────────────────
  const handleEquip = async (itemName: string) => {
    try {
      await shopService.equipItem(itemName);
      await loadInventory();
    } catch {
      Alert.alert('Error', 'No se pudo equipar el objeto');
    }
  };

  const handleSelectPreview = (type: ItemCategory, itemName: string | null) => {
    setPreviewEquipped(prev => ({ ...prev, [type]: itemName }));
  };

  const hasPendingChanges = (Object.keys(previewEquipped) as ItemCategory[]).some(
    (type) => previewEquipped[type] !== committedEquipped[type]
  );

  const handleCancelPreview = () => {
    setPreviewEquipped(committedEquipped);
  };

  const handleConfirmChanges = async () => {
    setConfirming(true);
    try {
      const types = Object.keys(previewEquipped) as ItemCategory[];
      for (const type of types) {
        if (previewEquipped[type] === committedEquipped[type]) continue;

        if (previewEquipped[type] !== null) {
          // Equipar el nuevo item de este slot (el backend desequipa el anterior del mismo tipo)
          await shopService.equipItem(previewEquipped[type]!);
        } else if (committedEquipped[type] !== null) {
          // "Quitar": el endpoint alterna isWearing, así que llamamos sobre el que estaba puesto
          await shopService.equipItem(committedEquipped[type]!);
        }
      }
      await loadInventory();
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar los cambios de vestuario');
      setPreviewEquipped(committedEquipped); // revertir preview si algo falla
    } finally {
      setConfirming(false);
    }
  };

  const previewList: EquippedItem[] = (Object.entries(previewEquipped) as [ItemCategory, string | null][])
    .filter(([, item]) => item !== null)
    .map(([type, item]) => ({ type, item: item! }));

  const committedList: EquippedItem[] = (Object.entries(committedEquipped) as [ItemCategory, string | null][])
    .filter(([, item]) => item !== null)
    .map(([type, item]) => ({ type, item: item! }));

  // ── Navegación ───────────────────────────────────────────────────────────────
  const goToExercises = async () => {
    try {
      setLoading(true);
      const { canStart } = await sessionService.canStartSession();
      if (true) {
        router.push('/(tabs)/routines');
      } else {
        Alert.alert('¡Buen trabajo!', 'Ya has completado tu entrenamiento de hoy. ¡Vuelve mañana!');
      }
    } catch (error) {
      console.error('Error checking session start:', error);
      Alert.alert('Error', 'Hubo un problema al comprobar tu sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const goToInventory = () => {
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * 2, animated: true });
    setCurrentPage(2);
  };

  const goToCoop = () => {
    scrollRef.current?.scrollTo({ x: 0, animated: true });
    setCurrentPage(0);
  };

  const goBackHome = () => {
    scrollRef.current?.scrollTo({ x: SCREEN_WIDTH, animated: true });
    setCurrentPage(1);
  };

  // ── Scroll handlers ──────────────────────────────────────────────────────────
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const filtered = inventory.filter(k => k.itemEntity?.type === activeCategory);

  // ── Spinner inicial ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6B5B95" />
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        style={styles.scrollView}
        contentOffset={{ x: SCREEN_WIDTH, y: 0 }}
      >
        {/* ── PÁGINA 0: Retos Cooperativos ─────────────────────────────────────── */}
        <View style={[styles.page, styles.coopPage]}>
          <SafeAreaView style={styles.coopSafeArea}>
            {/* Header */}
            <View style={styles.coopHeader}>
              <View style={styles.headerSpacer} />
              <Text style={styles.coopHeaderTitle}>Reto Cooperativo</Text>
              <Pressable
                style={({ pressed }) => [styles.infoButton, pressed && { opacity: 0.6 }]}
                onPress={() => Alert.alert(
                  'Retos Cooperativos 🤝',
                  '¡Trabajad juntos para derrotar al enemigo! Todos los pasos de la comunidad de FitGame se suman para quitar vida al monstruo.\n\nCamina en tu vida diaria y tus pasos dañarán al jefe en tiempo real. ¡Consigue el objetivo de pasos antes del fin del plazo para ganar!'
                )}
              >
                <MaterialIcons name="info-outline" size={26} color="#fff" />
              </Pressable>
            </View>

            {coopLoading ? (
              <View style={styles.coopLoadingContainer}>
                <ActivityIndicator size="large" color="#E94560" />
              </View>
            ) : (
              <View style={styles.coopContent}>
                {/* Título de Desafío y Barra de Vida */}
                <View style={styles.challengeBox}>
                  <Text style={styles.bossTitle} numberOfLines={1}>
                    {coopChallenge?.name || 'Cargando Enemigo...'}
                  </Text>

                  {/* Barra de vida (Boss HP Bar) */}
                  <View style={styles.hpBarContainer}>
                    {(() => {
                      const total = coopChallenge?.totalSteps || 100000;
                      const current = coopChallenge?.currentSteps || 0;
                      const hpPercent = Math.max(0, 100 * (1 - current / total));
                      const hpRemaining = Math.max(0, total - current);
                      const isDefeated = current >= total;

                      return (
                        <>
                          <View style={styles.hpBarLabelBox}>
                            <Text style={styles.hpBarLabel}>HP del Jefe</Text>
                            <Text style={styles.hpBarText}>
                              {isDefeated ? '0' : hpRemaining.toLocaleString()} / {total.toLocaleString()} HP ({hpPercent.toFixed(1)}%)
                            </Text>
                          </View>
                          <View style={styles.hpBarTrack}>
                            <View style={[styles.hpBarFill, { width: `${hpPercent}%` }]} />
                          </View>
                        </>
                      );
                    })()}
                  </View>
                </View>

                {/* Boss Image Container */}
                <View style={styles.bossContainer}>
                  <View style={styles.bossCircle}>
                    {/* Imagen del avatar como enemigo de marcador de posición (tintado en rojo y oscuro) */}
                    <Image
                      source={require('@/assets/images/Avatar.png')}
                      style={styles.bossImage}
                    />
                  </View>

                  {/* Badge de estado */}
                  {(() => {
                    const total = coopChallenge?.totalSteps || 100000;
                    const current = coopChallenge?.currentSteps || 0;
                    const isDefeated = current >= total;

                    return isDefeated ? (
                      <View style={[styles.statusBadge, styles.statusDefeated]}>
                        <MaterialIcons name="emoji-events" size={16} color="#000" />
                        <Text style={styles.statusTextDefeated}>¡DERROTADO!</Text>
                      </View>
                    ) : (
                      <View style={[styles.statusBadge, styles.statusCombat]}>
                        <View style={styles.pulseDot} />
                        <Text style={styles.statusTextCombat}>EN CURSO 💪</Text>
                      </View>
                    );
                  })()}
                </View>

                {coopChallenge?.isDefeated && coopChallenge.memorial && (
                  <View style={styles.rewardBanner}>
                    <MaterialIcons name="auto-awesome" size={18} color="#8B6914" />
                    <Text style={styles.rewardBannerText}>
                      ¡Habéis ganado un cromo: {coopChallenge.memorial}!
                    </Text>
                  </View>
                )}

                {/* Detalles del reto y contribución */}
                <View style={styles.infoCard}>
                  <Text style={styles.infoCardTitle}>Estadísticas del desafío </Text>

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Pasos Colectivos:</Text>
                    <Text style={styles.statValue}>
                      👣 {(coopChallenge?.currentSteps || 0).toLocaleString()} / {(coopChallenge?.totalSteps || 100000).toLocaleString()}
                    </Text>
                  </View>

                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Tu aporte de hoy:</Text>
                    <Text style={styles.statValueContrib}>👣 {numSteps.toLocaleString()}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.timeRow}>
                    <MaterialIcons name="event" size={16} color="#ccc" />
                    <Text style={styles.timeText}>
                      Fin: {coopChallenge ? new Date(coopChallenge.endDate).toLocaleDateString() : '---'}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Hint de deslizar a la derecha para volver a Inicio */}
            <Pressable style={styles.swipeHintRightCoop} onPress={goBackHome}>
              <MaterialIcons name="chevron-right" size={28} color="rgba(255,255,255,0.7)" />
              <Text style={styles.swipeHintText}>Inicio</Text>
            </Pressable>
          </SafeAreaView>
        </View>

        {/* ── PÁGINA 1: Home ──────────────────────────────────────────────────── */}
        <View style={styles.page}>
          <ImageBackground
            source={require('@/assets/images/Home.png')}
            style={styles.container}
            resizeMode="cover"
            imageStyle={styles.backgroundImage}
          >
            {/* Contador de puntos de esfuerzo */}
            <View style={styles.pointsContainer}>
              <Text style={styles.pointsText}>P.E 🔥: {fp}</Text>
            </View>
            {/* Contador de pasos */}
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsText}>Pasos 👣: {numSteps}</Text>
            </View>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <AvatarDisplay equipped={committedList} size={320} />
            </View>
            {/* Barra de botones inferior */}
            <View style={styles.bottomBar}>
              {/* Tienda */}
              <Pressable
                style={({ pressed }) => [
                  styles.sideButton, styles.sideButtonShop,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.push('/(tabs)/shop')}
              >
                <MaterialIcons name="storefront" size={26} color="#fff" />
                <Text style={styles.sideButtonText}>Tienda</Text>
              </Pressable>

              {/* Entrenar — botón central grande */}
              <Pressable
                style={({ pressed }) => [
                  styles.trainButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={goToExercises}
              >
                <MaterialIcons name="fitness-center" size={34} color="#fff" />
                <Text style={styles.trainButtonText}>¡Entrenar!</Text>
              </Pressable>

              {/* Álbum */}
              <Pressable
                style={({ pressed }) => [
                  styles.sideButton, styles.sideButtonAlbum,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => router.push('/(tabs)/memorials')}
              >
                <MaterialIcons name="photo-album" size={26} color="#fff" />
                <Text style={styles.sideButtonText}>Álbum</Text>
              </Pressable>
            </View>

            {/* Hint de deslizar a la izquierda (Retos) */}
            <Pressable style={styles.swipeHintLeft} onPress={goToCoop}>
              <MaterialIcons name="chevron-left" size={28} color="rgba(255,255,255,0.7)" />
              <Text style={styles.swipeHintText}>Retos</Text>
            </Pressable>

            {/* Hint de deslizar a la derecha (Inventario) */}
            <Pressable style={styles.swipeHint} onPress={goToInventory}>
              <MaterialIcons name="chevron-right" size={28} color="rgba(255,255,255,0.7)" />
              <Text style={styles.swipeHintText}>Inventario</Text>
            </Pressable>
          </ImageBackground>
        </View>

        {/* ── PÁGINA: Inventario / Vestuario ────────────────────────────────────── */}
        <View style={[styles.page, styles.inventoryPage]}>
          <SafeAreaView style={styles.invSafeArea}>
            <View style={styles.invHeader}>
              <Pressable
                style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
                onPress={goBackHome}
              >
                <MaterialIcons name="arrow-circle-left" size={28} color="#6B5B95" />
              </Pressable>
              <Text style={styles.invHeaderTitle}>Vestuario</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Preview del avatar en vivo */}
            <View style={styles.previewStage}>
              <AvatarDisplay equipped={previewList} size={180} isPreview={hasPendingChanges} />
              {hasPendingChanges && (
                <Text style={styles.previewHint}>Previsualizando cambios</Text>
              )}
            </View>

            {/* Tabs de categorías */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabsScroll}
              contentContainerStyle={styles.tabsContent}
              nestedScrollEnabled
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

            {/* Grid de items de la categoría activa */}
            {invLoading ? (
              <View style={styles.invLoadingContainer}>
                <ActivityIndicator size="large" color="#6B5B95" />
              </View>
            ) : (
              <ScrollView
                style={styles.invScroll}
                contentContainerStyle={styles.gridContent}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled
              >
                <View style={styles.grid}>
                  {/* Opción "Quitar" — siempre presente para poder dejar el slot vacío */}
                  <Pressable
                    style={[
                      styles.itemCard,
                      styles.itemCardNone,
                      previewEquipped[activeCategory] === null && styles.itemCardSelected,
                    ]}
                    onPress={() => handleSelectPreview(activeCategory, null)}
                  >
                    <View style={styles.itemImageBox}>
                      <MaterialIcons name="block" size={40} color="#aaa" />
                    </View>
                    <Text style={styles.itemName}>Sin equipar</Text>
                  </Pressable>

                  {filtered.map(entry => (
                    <Pressable
                      key={entry.item}
                      style={[
                        styles.itemCard,
                        { backgroundColor: CATEGORY_COLORS[entry.itemEntity.type] },
                        previewEquipped[activeCategory] === entry.item && styles.itemCardSelected,
                      ]}
                      onPress={() => handleSelectPreview(activeCategory, entry.item)}
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
                      {previewEquipped[activeCategory] === entry.item && (
                        <View style={styles.equippedBadge}>
                          <Text style={styles.equippedBadgeText}>Seleccionado</Text>
                        </View>
                      )}
                    </Pressable>
                  ))}

                  {filtered.length === 0 && (
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
                  )}
                </View>
                <View style={{ height: hasPendingChanges ? 100 : 40 }} />
              </ScrollView>
            )}

            {/* Barra de confirmación — solo visible si hay cambios pendientes */}
            {hasPendingChanges && (
              <View style={styles.confirmBar}>
                <Pressable
                  style={({ pressed }) => [styles.confirmBarCancel, pressed && { opacity: 0.7 }]}
                  onPress={handleCancelPreview}
                  disabled={confirming}
                >
                  <Text style={styles.confirmBarCancelText}>Descartar</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.confirmBarConfirm, pressed && { opacity: 0.85 }]}
                  onPress={handleConfirmChanges}
                  disabled={confirming}
                >
                  {confirming ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <MaterialIcons name="check" size={20} color="#fff" />
                      <Text style={styles.confirmBarConfirmText}>Confirmar</Text>
                    </>
                  )}
                </Pressable>
              </View>
            )}
          </SafeAreaView>
        </View>
      </ScrollView>

      {/* Dots indicadores de página */}
      <View style={styles.pageDots}>
        {PAGES.map((p, i) => (
          <View
            key={p.key}
            style={[styles.pageDot, i === currentPage && styles.pageDotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    overflow: 'hidden', // Prevenir scroll en web
    ...Platform.select({
      web: {
        maxHeight: Dimensions.get('window').height,
        maxWidth: '100%',
      },
    }),
  },
  scrollView: { flex: 1 },
  page: {
    width: SCREEN_WIDTH,
    height: '100%',
  },

  // ── Home ────────────────────────────────────────────────────────────────────
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%',
  },
  avatarContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -80 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 320,
    height: 320,
    resizeMode: 'contain',
  },
  pointsContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6B5B95',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({ web: { boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)' } }),
  },
  pointsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5B95',
  },
  stepsContainer: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#6B5B95',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    ...Platform.select({ web: { boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)' } }),
  },
  stepsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B5B95',
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    left: 16, right: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
  },
  trainButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e7bf3d',
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    minWidth: 140,
    maxHeight: 80,
    gap: 6,
  },
  trainButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sideButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 22,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minWidth: 80,
    minHeight: 80,
    gap: 4,
  },
  sideButtonShop: { backgroundColor: '#6B5B95' },
  sideButtonAlbum: { backgroundColor: '#c85a5a' },
  sideButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  // Hint deslizar derecha
  swipeHint: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  swipeHintText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },

  // ── Inventario incrustado ───────────────────────────────────────────────────
  inventoryPage: {
    backgroundColor: 'lightcyan',
  },
  invSafeArea: {
    flex: 1,
  },
  invHeader: {
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
  invHeaderTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#2D3E50',
    textAlign: 'center',
  },
  headerSpacer: { width: 44 },
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
  invLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invScroll: { flex: 1 },
  gridContent: { paddingHorizontal: 16, paddingTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  itemCard: {
    width: '47%',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({ web: { cursor: 'pointer' } }),
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
  unequippedBadge: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#6B5B95',
  },
  unequippedBadgeText: { fontSize: 11, color: '#6B5B95', fontWeight: '600' },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 16,
  },
  emptyText: { fontSize: 16, color: '#aaa', textAlign: 'center' },
  shopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#6B5B95',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shopButtonText: { fontSize: 15, fontWeight: '600', color: '#fff' },

  // ── Dots ────────────────────────────────────────────────────────────────────
  pageDots: {
    position: 'absolute',
    bottom: 16,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 10,
    pointerEvents: 'none',
  },
  pageDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  pageDotActive: {
    backgroundColor: '#fff',
    width: 20,
  },

  // ── Retos Cooperativos Page ─────────────────────────────────────────────────
  coopPage: {
    backgroundColor: '#F9FBF9', // Very soft light pastel greenish/blue background
  },
  coopSafeArea: {
    flex: 1,
  },
  coopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  coopHeaderTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2D3E50', // Matching theme title color
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  infoButton: {
    padding: 8,
    minWidth: 48,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: '#6B5B95', // Theme purple
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 3,
  },
  coopLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coopContent: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingBottom: 40,
  },
  challengeBox: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bossTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3E50',
    marginBottom: 12,
  },
  hpBarContainer: {
    width: '100%',
  },
  hpBarLabelBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  hpBarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF6B8B', // Soft strawberry pink
    textTransform: 'uppercase',
  },
  hpBarText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2D3E50',
  },
  hpBarTrack: {
    width: '100%',
    height: 22,
    backgroundColor: '#E2E8F0',
    borderRadius: 11,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  hpBarFill: {
    height: '100%',
    backgroundColor: '#FF6B8B', // Crimson/strawberry pink
    borderRadius: 11,
  },
  bossContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  bossCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#FFFBEB', // Light pastel yellow
    borderWidth: 4,
    borderColor: '#FDE047', // Light gold border
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FDE047',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  bossImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    elevation: 3,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusCombat: {
    backgroundColor: '#DEF7EC', // Friendly green
    borderWidth: 1.5,
    borderColor: '#31C48D',
  },
  statusDefeated: {
    backgroundColor: '#FEF3C7', // Friendly gold
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  statusTextCombat: {
    color: '#03543F',
    fontSize: 13,
    fontWeight: '800',
  },
  statusTextDefeated: {
    color: '#78350F',
    fontSize: 13,
    fontWeight: '800',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#31C48D',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2D3E50',
  },
  statValueContrib: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#16A34A', // Green contribution
  },
  divider: {
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  swipeHintLeft: {
    position: 'absolute',
    left: 8,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  swipeHintRightCoop: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -30 }],
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },

  previewStage: {
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  previewHint: {
    fontSize: 12,
    color: '#6B5B95',
    fontWeight: '600',
  },
  itemCardNone: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  itemCardSelected: {
    borderWidth: 3,
    borderColor: '#6B5B95',
  },
  confirmBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  confirmBarCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBarCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  confirmBarConfirm: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#6B5B95',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBarConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  rewardBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FFF3CD', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 12,
  },
  rewardBannerText: { fontSize: 12, fontWeight: '700', color: '#8B6914' },
});