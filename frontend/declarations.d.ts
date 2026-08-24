declare module '@react-native-community/datetimepicker' {
    import { ComponentType } from 'react';
    import { ViewProps } from 'react-native';

    export type DateTimePickerEvent = {
        type: 'set' | 'neutralButtonPressed' | 'dismissed';
        nativeEvent: {
            timestamp: number;
            utcOffset: number;
        };
    };

    export interface DateTimePickerProps extends ViewProps {
        value: Date;
        onChange?: (event: DateTimePickerEvent, date?: Date) => void;
        mode?: 'date' | 'time' | 'datetime' | 'countdown';
        display?: 'default' | 'spinner' | 'calendar' | 'clock';
        maximumDate?: Date;
        minimumDate?: Date;
    }

    const DateTimePicker: ComponentType<DateTimePickerProps>;
    export default DateTimePicker;
}
