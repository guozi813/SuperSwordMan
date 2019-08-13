/**
 * Created 2019/3/10.
 */
import {TipCtr} from "../tips/TipCtr";
import {UIConst} from "../Data/Const";

export class TipsManager {
    private static _instance: TipsManager;
    private _tisNode: cc.Node = null;
    private _tickIdArr:any[] = [];

    constructor() {
    }

    public addTickId(tickId):void {
        if (this._tickIdArr.indexOf(tickId) < 0) {
            this._tickIdArr.push(tickId);
        }
    }

    public removeTickId(tickId):void {
        let index = this._tickIdArr.indexOf(tickId);
        if (index >= 0) {
            this._tickIdArr.splice(index,1);
        }
    }

    public removeAllTickId():void {
        for (let i = 0; i < this._tickIdArr.length; i++) {
            let tickId = this._tickIdArr[i];
            clearInterval(tickId);
        }
        this._tickIdArr = [];
    }

    public static getInstance(): TipsManager {
        if (!this._instance) {
            this._instance = new TipsManager();
        }
        return this._instance;
    }

    public init(): void {
        if (this._tisNode) return;
        cc.loader.loadRes(UIConst.TIP_PREFAB_DIR, (err, prefab) => {
            this._tisNode = cc.instantiate(prefab);
        });
    }

    /**
     * 暂时飘窗
     * @param str
     */
    public showContent(str: string): void {
        if (!this._tisNode) {
            this.init();
            return;
        }
        this._tisNode.getComponent("TipCtr").setContent(str);
        this._tisNode.setParent(cc.director.getScene());
    }

    /**
     * 收取道具提示框
     * obj{itemId:100,num:0}
     * type:6：获得道具 7：扣除道具
     * from: 来源 1代表从离线奖励打开
     */
    public showAward(obj, type, from: number): void {
        // UIManager.getInstance().openUI(ADView, null, function () {
        // }.bind(this), null, {type: type, title: obj.itemId, content: obj.num, shareOrHarry: "", label: "", from: from});

    }

    public showRelogin(): void {
        // UIManager.getInstance().openUI(ReloginView);
    }

    public showTip(str:string):void{
        if(!this._tisNode){
            this.init();
            return;
        }
        // if(!this.tipNode.active){
        //     this.tipNode.active = true;
        // }
        // this.tipNode.addComponent("TipCtr");
        let tipCtr:TipCtr = this._tisNode.getComponent("TipCtr");

        tipCtr.showContent(str);
        this._tisNode.setParent(cc.director.getScene());
    }

}

window["TipsManager"] = TipsManager.getInstance();
