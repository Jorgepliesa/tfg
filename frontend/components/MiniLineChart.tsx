import { View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

interface DataPoint {
    label: string;
    value: number;
}

const Y_AXIS_WIDTH = 34;   // espacio reservado para etiquetas del eje Y
const X_AXIS_HEIGHT = 18;  // espacio reservado para etiquetas del eje X

export function MiniLineChart({
    data,
    minValue,
    maxValue,
    height = 140,
    color = '#6B5B95',
    yLabel,
    showXLabels = true,
    showYLabels = true,
    maxXLabels = 6,
}: {
    data: DataPoint[];
    minValue?: number;
    maxValue?: number;
    height?: number;
    color?: string;
    /** Unidad a mostrar en el eje Y (e.g. "bpm", "ánimo") */
    yLabel?: string;
    showXLabels?: boolean;
    showYLabels?: boolean;
    /** Máximo de etiquetas del eje X antes de diezmarlas */
    maxXLabels?: number;
}) {
    if (data.length === 0) {
        return (
            <Text style={{ fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 20 }}>
                Sin datos suficientes
            </Text>
        );
    }

    const PADDING_TOP = 10;
    const PADDING_BOTTOM = 6;
    const PADDING_RIGHT = 14;

    const totalWidth = Dimensions.get('window').width - 64;
    const chartWidth = showYLabels ? totalWidth - Y_AXIS_WIDTH : totalWidth;
    const innerWidth = chartWidth - PADDING_RIGHT;
    const innerHeight = height - PADDING_TOP - PADDING_BOTTOM;

    const values = data.map(d => d.value);
    const min = minValue ?? Math.min(...values);
    const max = maxValue ?? Math.max(...values);
    const range = max - min || 1;

    const stepX = data.length > 1 ? innerWidth / (data.length - 1) : 0;

    const toX = (i: number) => i * stepX;
    const toY = (v: number) => PADDING_TOP + innerHeight - ((v - min) / range) * innerHeight;

    const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value) }));

    // Ejes Y: 4 ticks repartidos
    const Y_TICKS = 4;
    const yTicks = Array.from({ length: Y_TICKS + 1 }, (_, i) => {
        const val = min + (range / Y_TICKS) * i;
        return { val: Math.round(val * 10) / 10, y: toY(val) };
    });

    // Ejes X: diezmar si hay demasiados puntos
    const xStep = Math.max(1, Math.ceil(data.length / maxXLabels));
    const xTicks = data
        .map((d, i) => ({ label: d.label, x: toX(i), i }))
        .filter(t => t.i === 0 || t.i === data.length - 1 || t.i % xStep === 0);

    const svgWidth = showYLabels ? totalWidth : chartWidth;
    const svgHeight = height + (showXLabels ? X_AXIS_HEIGHT : 0);
    const offsetX = showYLabels ? Y_AXIS_WIDTH : 0;

    return (
        <View>
            {/* Etiqueta de unidad Y */}
            {yLabel && (
                <Text style={{ fontSize: 10, color: '#aaa', marginBottom: 2, marginLeft: showYLabels ? Y_AXIS_WIDTH : 0 }}>
                    ↑ {yLabel}
                </Text>
            )}

            <Svg width={svgWidth} height={svgHeight}>
                {/* Líneas guía horizontales y etiquetas Y */}
                {showYLabels && yTicks.map((t, i) => (
                    <SvgText
                        key={`yl-${i}`}
                        x={Y_AXIS_WIDTH - 5}
                        y={t.y + 4}
                        textAnchor="end"
                        fontSize={9}
                        fill="#bbb"
                    >
                        {t.val}
                    </SvgText>
                ))}
                {yTicks.map((t, i) => (
                    <Line
                        key={`yl-line-${i}`}
                        x1={offsetX}
                        y1={t.y}
                        x2={offsetX + chartWidth}
                        y2={t.y}
                        stroke="#eee"
                        strokeWidth={1}
                    />
                ))}

                {/* Línea de datos */}
                <Polyline
                    points={points.map(p => `${p.x + offsetX},${p.y}`).join(' ')}
                    fill="none"
                    stroke={color}
                    strokeWidth={2.5}
                />

                {/* Puntos */}
                {points.map((p, i) => (
                    <Circle key={i} cx={p.x + offsetX} cy={p.y} r={3} fill={color} />
                ))}

                {/* Etiquetas eje X */}
                {showXLabels && xTicks.map((t, i) => (
                    <SvgText
                        key={`xl-${i}`}
                        x={t.x + offsetX}
                        y={height + X_AXIS_HEIGHT - 2}
                        textAnchor={i === 0 ? 'start' : t.i === data.length - 1 ? 'end' : 'middle'}
                        fontSize={9}
                        fill="#bbb"
                    >
                        {t.label}
                    </SvgText>
                ))}
            </Svg>
        </View>
    );
}