import {BaseUI, UIClass} from "./BaseUI";

export class UIManager {
    private static _instance:UIManager;
    private uiList:BaseUI[] = [];
    private uiRoot: cc.Node = null;//父节点
    private _uiLoadingView:cc.Node;

    public static getInstance():UIManager{
        if(!this._instance){
            this._instance = new UIManager();
        }
        return this._instance;
    }

    constructor()
    {
        this.uiRoot = cc.find("Canvas");

        cc.loader.loadRes("ui/loading/UILoadingView", cc.Prefab, function(err:any, res:any):void{
            if(err)
            {
                cc.warn("loadPrefabObj error", "ui/loading/UIloadingView");
                return;
            }
            let node:cc.Node = cc.instantiate(res);
            this._uiLoadingView = node;
        }.bind(this));
    }

    public openUI<T extends BaseUI>(uiClass: UIClass<T>, zOrder?: number, callback?: Function, onProgress?: Function, ...args: any[])
    {
        if(this.getUI(uiClass))
        {
            return;
        }
        // cc.log("start loadRes：" + uiClass.getUrl());
        cc.loader.loadRes(uiClass.getUrl(),(completedCount: number, totalCount: number, item: any)=>{
            if(onProgress)
            {
                onProgress(completedCount, totalCount, item);
            }
        }, (error, prefab)=>
        {

            if(error)
            {
                cc.log(error);
                return;
            }
            if(this.getUI(uiClass))
            {
                return;
            }
            let uiNode: cc.Node = cc.instantiate(prefab);
            let strip:any = uiNode.getComponent(uiClass.getClassName());
            if (strip && strip.initWithParameter) {
                let initData = args[0];
                strip.initWithParameter(initData);
            }
            let uiRoot:cc.Node = cc.director.getScene().getChildByName("Canvas");
            uiNode.setParent(uiRoot);
            //zOrder && uiNode.setLocalZOrder(zOrder);
            if (zOrder) { uiNode.zIndex = zOrder; }
            let ui = uiNode.getComponent(uiClass) as BaseUI;
            ui.tag = uiClass;
            this.uiList.push(ui);
            if(callback)
            {
                callback(args);
            }
        });
    }

    public closeUI<T extends BaseUI>(uiClass: UIClass<T>)
    {
        for(let i = 0; i < this.uiList.length; ++i)
        {
            if(this.uiList[i].tag === uiClass)
            {
                this.uiList[i].node.destroy();
                this.uiList.splice(i, 1);
                return;
            }
        }
    }

    public hideUI<T extends BaseUI>(uiClass: UIClass<T>)
    {
        let ui = this.getUI(uiClass);
        if(ui)
        {
            ui.node.active = false;
        }
    }

    public showUI<T extends BaseUI>(uiClass:UIClass<T>,callback?:Function)
    {
        let ui = this.getUI(uiClass);
        if(ui)
        {
            ui.node.active = true;
            ui.onShow();
            // if (this._uiLoadingView && this._uiLoadingView.getParent()) {
            //     this._uiLoadingView.removeFromParent();
            // }
            if(callback)
            {
                callback();
            }
        }
        else
        {
            this.openUI(uiClass, 0, ()=>{
                callback&&callback();
                let ui = this.getUI(uiClass);
                // if (this._uiLoadingView && this._uiLoadingView.getParent()) {
                //     this._uiLoadingView.removeFromParent();
                // }
                ui.onShow();
            });
        }
    }

    public getUI<T extends BaseUI>(uiClass: UIClass<T>): BaseUI
    {
        for(let i = 0; i < this.uiList.length; ++i)
        {
            if(this.uiList[i].tag === uiClass)
            {
                return this.uiList[i];
            }
        }
        return null;
    }
}
