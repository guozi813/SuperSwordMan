import {ListenerManager} from "../manager/listen/ListenManager";

export interface UIClass<T extends BaseUI>
{
    new(): T;
    getUrl(): string;
    getClassName():string;
}
const {ccclass, property} = cc._decorator;

@ccclass
export  class BaseUI extends cc.Component {

    protected static className = "BaseUI";
    protected static pathName:string = "";
    protected mTag: any;


    public get tag(): any
    {
        return this.mTag;
    }
    public set tag(value: any)
    {
        this.mTag = value;
    }

    public static getUrl(): string

    {
        cc.log(this.className);
        return this.pathName + this.className;
    }

    public static getClassName():string {
        return this.className;
    }

    onDestroy(): void
    {
        ListenerManager.getInstance().removeAll(this);
    }

    onShow()
    {
        cc.log("BaseUI onShow");
    }
}
