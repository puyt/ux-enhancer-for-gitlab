import mitt from 'mitt';
import { MittEventKey } from '../enums';

type EventKey = MittEventKey;
type EventValue = string | number | Record<string, any> | undefined;
type Events = {
    [key: string]: EventValue;
};
const emitter = mitt<Events>();

export function useMitt() {
    function on(key: EventKey, fn: (data: EventValue) => void): void {
        emitter.on(key, fn);
    }

    function off(key: EventKey, fn: (data: EventValue) => void): void {
        emitter.off(key, fn);
    }

    function emit(key: EventKey, data?: EventValue): void {
        emitter.emit(key, data);
    }

    return {
        on,
        off,
        emit,
    };
}