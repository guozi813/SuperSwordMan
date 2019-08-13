import {BaseConfigContainer} from "./BaseConfigContainer";
import {ConfigConst} from "../Data/Const";

/**
 * creator: yisha
 */

export class ConstConfigData{
    id:number;
    value:number;
    des:string;
}

export default class ConstConfigContainer extends BaseConfigContainer {

    private constConfigData:ConstConfigData[] = [];
    constructor(callback:Function,caller:any,arg:any){
        super();
        cc.loader.loadRes(ConfigConst.CONFIG_FILE_DIR+ "const", (err, object)=>
            {
                if (err) {
                    cc.log("load const.json err");
                    cc.log(err);
                }
                else {
                    object = object.json;
                    for(var i in object)
                    {
                        this.constConfigData[i] = object[i];
                        this.constConfigData[i]["id"] = i;
                    }
                    if(callback)
                    {
                        callback.call(caller, arg);
                    }
                }
            }
        );
    }

    getConfigData(): ConstConfigData[]
    {
        return this.constConfigData;
    }
}
