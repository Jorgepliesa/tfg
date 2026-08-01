import { View, Text, Dimensions } from 'react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';

interface DataPoint {
    label: string;
    value: number;
}

export function MiniLineChart({
    data, minValue, maxValue, height = 140, color = '#6B5B95',
}: {
    data: DataPoint[]; minValue?: number; maxValue?: number; height?: number; color?: string;
}) {
    if (data.length === 0) {
        return <Text style={{ fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 20 }}>Sin datos suficientes</Text>;
    }

    const width = Dimensions.get('window').width - 64;
    const values = data.map(d => d.value);
    const min = minValue ?? Math.min(...values);
    const max = maxValue ?? Math.max(...values);
    const range = max - min || 1;

    const stepX = data.length > 1 ? width / (data.length - 1) : 0;
    const points = data.map((d, i) => ({
        x: i * stepX,
        y: height - ((d.value - min) / range) * height,
    }));

    return (
        <View>
            <Svg width={width} height={height}>
                <Polyline points={points.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke={color} strokeWidth={2.5} />
                {points.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />)}
            </Svg>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 10, color: '#aaa' }}>{data[0].label}</Text>
                {data.length > 1 && <Text style={{ fontSize: 10, color: '#aaa' }}>{data[data.length - 1].label}</Text>}
            </View>
        </View>
    );
}