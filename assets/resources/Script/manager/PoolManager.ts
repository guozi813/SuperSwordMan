

export class PoolManager {
    private static _instance:PoolManager;

    public _casePools:any = {};

    public static getInstance():PoolManager{
        if(!this._instance){
            this._instance = new PoolManager();
        }
        return this._instance;
    }

    public put(type:string,node:cc.Node,poolMax:number):void{
        if(!type || !node)return;
        let nodePool = this._casePools[type];
        if(!nodePool){
            nodePool = new cc.NodePool(type);
            this._casePools[type] = nodePool;
        }
        if(nodePool.size() <= poolMax){
            nodePool.put(node);
        }
    }

    public get(type:string,prefab:cc.Prefab):cc.Node{
        let nodePool = this._casePools[type];
        if(!nodePool){
            nodePool = new cc.NodePool(type);
            this._casePools =nodePool;
        }
        let node:cc.Node;
        if(nodePool.size() > 0){
            node = nodePool.get();
            return node;
        }else{
            if(prefab){
                node = cc.instantiate(prefab);
                return node;
            }else{

            }
        }
    }

    public getPool(type:string):cc.NodePool{
        let nodePool = this._casePools[type];
        if(!nodePool){
            nodePool = new cc.NodePool(type);
            this._casePools =nodePool;
        }
        return this._casePools[type];
    }

    public clearPool(type:string):void{
        if(this._casePools[type]){
            delete this._casePools[type];
        }
    }
}

window["PoolManager"] = PoolManager.getInstance();