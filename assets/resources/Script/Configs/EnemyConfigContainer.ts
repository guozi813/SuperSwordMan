/**
 * creator: yisha
 */
import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst} from "../Data/Const";
export class EnemyConfigData
{
    id:number;
    name:number;
    des:string;
    image:string;
    walkType:string;
    attackType:string;
    aggressivity:number;
    hp:number;
    gold:number;
    speed:number;
}

export class EnemyConfigContainer extends BaseConfigContainer {
    private enemyConfigData: EnemyConfigData[] = [];
    constructor(callback: Function, caller: any, arg: any)
    {
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "enemy", (err, object)=>
            {
                if (err) {
                    cc.log("load enemy.json err");
                    cc.log(err);
                }
                else {
                    object = object.json;
                    for(var i in object)
                    {
                        this.enemyConfigData[i] = object[i];
                        this.enemyConfigData[i]["id"] = i;
                    }
                    if(callback)
                    {
                        callback.call(caller, arg);
                    }
                }
            }
        );
    }

    getConfigData(): EnemyConfigData[]
    {
        return this.enemyConfigData;
    }
}
