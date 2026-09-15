/**
 * AppAlert — reemplazo de Alert.alert que funciona en web y nativo.
 *
 * Uso:
 *   import { appAlert } from '@/components/AppAlert';
 *
 *   // Simple (solo OK):
 *   appAlert('Error', 'Algo salió mal');
 *
 *   // Con confirmación:
 *   appAlert('Eliminar', '¿Seguro?', [
 *     { text: 'Cancelar', style: 'cancel' },
 *     { text: 'Eliminar', style: 'destructive', onPress: () => doDelete() },
 *   ]);
 *
 * En nativo delega a Alert.alert directamente.
 * En web muestra un Modal de React Native con el mismo diseño de la app.
 *
 * Implementación: patrón singleton con un setter registrado por <AppAlertHost />.
 * Monta <AppAlertHost /> en el layout raíz (_layout.tsx) una sola vez.
 */

import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// ── tipos ────────────────────────────────────────────────────────────────────

export interface AppAlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface AlertState {
    visible: boolean;
    title: string;
    message: string;
    buttons: AppAlertButton[];
}

// ── singleton ─────────────────────────────────────────────────────────────────

type ShowFn = (title: string, message: string, buttons?: AppAlertButton[]) => void;
let _show: ShowFn | null = null;

/** Drop-in replacement de Alert.alert — funciona en web y nativo. */
export function appAlert(
    title: string,
    message: string = '',
    buttons?: AppAlertButton[],
): void {
    if (Platform.OS !== 'web') {
        // En nativo delegamos al Alert nativo de RN
        Alert.alert(
            title,
            message,
            buttons?.map(b => ({ text: b.text, style: b.style, onPress: b.onPress })),
        );
        return;
    }
    if (_show) {
        _show(title, message, buttons ?? [{ text: 'Aceptar' }]);
    }
}

// ── host ──────────────────────────────────────────────────────────────────────

/**
 * Monta este componente UNA SOLA VEZ en el layout raíz para que funcione
 * el sistema de alertas en web.
 */
export function AppAlertHost() {
    const [state, setState] = useState<AlertState>({
        visible: false,
        title: '',
        message: '',
        buttons: [],
    });

    // Registra la función show al montar
    React.useEffect(() => {
        _show = (title, message, buttons) => {
            setState({ visible: true, title, message, buttons: buttons ?? [{ text: 'Aceptar' }] });
        };
        return () => { _show = null; };
    }, []);

    const dismiss = (btn?: AppAlertButton) => {
        setState(s => ({ ...s, visible: false }));
        btn?.onPress?.();
    };

    if (!state.visible) return null;

    return (
        <Modal
            visible={state.visible}
            transparent
            animationType="fade"
            onRequestClose={() => dismiss()}
        >
            <View style={s.overlay}>
                <View style={s.box}>
                    <Text style={s.title}>{state.title}</Text>
                    {!!state.message && <Text style={s.message}>{state.message}</Text>}
                    <View style={[s.btnRow, state.buttons.length === 1 && s.btnRowSingle]}>
                        {state.buttons.map((btn, i) => {
                            const isDestructive = btn.style === 'destructive';
                            const isCancel = btn.style === 'cancel';
                            return (
                                <Pressable
                                    key={i}
                                    style={({ pressed }) => [
                                        s.btn,
                                        isDestructive && s.btnDestructive,
                                        isCancel && s.btnCancel,
                                        !isDestructive && !isCancel && s.btnDefault,
                                        pressed && { opacity: 0.75 },
                                    ]}
                                    onPress={() => dismiss(btn)}
                                >
                                    <Text style={[
                                        s.btnText,
                                        isDestructive && s.btnTextDestructive,
                                        isCancel && s.btnTextCancel,
                                        !isDestructive && !isCancel && s.btnTextDefault,
                                    ]}>
                                        {btn.text}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// ── estilos ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    box: {
        backgroundColor: '#fff',
        borderRadius: 18,
        padding: 24,
        width: '100%',
        maxWidth: 340,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1A1A2E',
        textAlign: 'center',
        marginBottom: 8,
    },
    message: {
        fontSize: 18,
        color: '#8b8888ff',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 20,
    },
    btnRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    btnRowSingle: {
        justifyContent: 'center',
    },
    btn: {
        flex: 1,
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 55,
    },
    btnDefault: {
        backgroundColor: '#6B5B95',
    },
    btnCancel: {
        backgroundColor: '#EFEFEF',
    },
    btnDestructive: {
        backgroundColor: '#e7593cff',
    },
    btnText: {
        fontSize: 18,
        fontWeight: '600',
    },
    btnTextDefault: {
        color: '#fff',
    },
    btnTextCancel: {
        color: '#444',
    },
    btnTextDestructive: {
        color: '#fff',
    },
});
