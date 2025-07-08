import mitt from 'mitt';

type EventKey = string;
type EventValue = string | number | Record<string, any> | undefined;
type Events = {
    [key: string]: EventValue;
};
const emitter = mitt<Events>();

export function useMitt() {

    function on(key: EventKey, fn: (data: EventValue) => void): void {
        emitter.on(key, fn);
    }

    function off(key: EventKey): void {
        emitter.off(key);
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