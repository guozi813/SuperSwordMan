/**
 * creator: yisha
 */
import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst} from "../Data/Const";
export class RoleConfigData
{
    id:number;
    hp:number;
    gold:string;
    aggressivity:string;
}

export class RoleConfigContainer extends BaseConfigContainer {
    private roleConfigData: RoleConfigData[] = [];
    constructor(callback: Function, caller: any, arg: any)
    {
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "role", (err, object)=>
            {
                if (err) {
                    cc.log("load role.json err");
                    cc.log(err);
                }
                else {
                    object = object.json;
                    for(var i in object)
                    {
                        this.roleConfigData[i] = object[i];
                        this.roleConfigData[i]["id"] = i;
                    }
                    if(callback)
                    {
                        callback.call(caller, arg);
                    }
                }
            }
        );
    }

    getConfigData(): RoleConfigData[]
    {
        return this.roleConfigData;
    }
}