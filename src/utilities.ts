/**
 * Created by alex.boyce on 4/6/17.
 */

export abstract class Subscribeable {
    protected listeners:Array<Function> = [];

    protected abstract dispatch(...args: any[]);

    subscribe(l:Function) {
        this.listeners.push(l);
    }

    unsubscribe(l:Function) {
        this.listeners = this.listeners.filter((f) => {
            return f !== l;
        });
    }
}