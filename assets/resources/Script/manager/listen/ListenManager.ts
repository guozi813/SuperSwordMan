
export class Delegate
{
    public mListener: Function;
    public mCallLer:any;
    public get listener(): Function {
        return this.mListener;
    }

    public mArgArray: any[];
    public get argArray(): any[] {
        return this.mArgArray;
    }

    public mIsOnce = false;
    public get isOnce(): boolean {
        return this.mIsOnce;
    }
    public set isOnce(isOnce: boolean) {
        this.mIsOnce = isOnce;
    }

    constructor(listener: Function, calller:any,argArray: any[], isOnce: boolean = false) {
        this.mListener = listener;
        this.mArgArray = argArray;
        this.mIsOnce = isOnce;
        this.mCallLer = calller;
    }
    public destroy() {
        this.mCallLer = null;
        this.mListener = null;
    }
}

export class ListenerManager
{
    private static instance: ListenerManager;
    private _eventTarget:cc.EventTarget = new cc.EventTarget();//事件派发器

    public static getInstance(): ListenerManager
    {
        if(this.instance == null)
        {
            this.instance = new ListenerManager();
        }
        return this.instance;
    }

    public has(type: string, caller: any, listener: Function): boolean {
        return false;
    }

    public trigger(type: any, ...argArray: any[]): void {
        this._eventTarget.emit(type,argArray);
    }

    public add(type: any, caller: any, listener: Function, ...argArray: any[]): void {
        this._eventTarget.on(type,listener,caller);
    }


    public remove(listenType: any, caller: any, listener: Function, onceOnly?: boolean): void {
        this._eventTarget.off(listenType,listener,caller);
    }

    public removeAll(caller: any): void {

    }
}

window["ListenerManager"] = ListenerManager.getInstance();