const {ccclass, property} = cc._decorator;

@ccclass
export class GameUtil {

    // 将数据保存到本地
    public static saveInLocal(key: string, val: any): void {
        if (cc.sys.localStorage.getItem(key)) {
            cc.sys.localStorage.removeItem(key);
        }
        cc.sys.localStorage.setItem(key, val);
    }

    // 从本地取数据
    public static getFromLocal(key: string): string {
        let result: string = cc.sys.localStorage.getItem(key);
        return result;
    }

    // 打乱数组
    public static randomSort(arr: any): any {
        let l = arr.length;
        for (let i = 0; i < l; i++) {
            let id = Math.floor(Math.random() * l);
            let empty = arr[i];
            arr[i] = arr[id];
            arr[id] = empty;
        }
        return arr;
    }

    /**
     * 生成随机数
     * @param maxNum 范围
     * @param flag 包含负数?
     */
    public static randomNum(maxNum: number, flag: boolean) {
        let symbol = Math.pow(-1, Math.floor(Math.random() * 2));
        let random = Math.floor(Math.random() * maxNum);
        if (flag) {
            return random * symbol;
        } else {
            return random;
        }
    }

    public static getDistance(point1,point2){
        return Math.sqrt(Math.pow(point2.x-point1.x,2)+Math.pow(point2.y-point1.y,2));
    }

    // 格式化金币数
    public static numberShow(num:number,toFixed:number = null):string {
        num = Math.ceil(num);
        let result = "";
        if (num < 10000) {
            result = num.toString();
        }else if (num < 100000000){
            //万到亿
            if (toFixed) {
                result = (num/10000).toFixed(toFixed) + "万";
            }else {
                result = Math.floor(num/10000) + "万";
            }
        }else if (num < 1000000000000) {
            //亿到兆
            if (toFixed) {
                result = (num/100000000).toFixed(toFixed) + "亿";
            }else {
                result = Math.floor(num/100000000) + "亿";
            }
        }else if (num <= 10000000000000000) {
            //兆兆
            if (toFixed) {
                result = (num/1000000000000).toFixed(toFixed) + "兆";
            }else {
                result = Math.floor(num/1000000000000) + "兆";
            }
        }else {
            result = "9999+兆";
        }
        return result;
    }

    /**
     * 升级
     * @param start 初始值
     * @param factor 增长系数
     */
    public static levelUp(start:number,factor:number):number{
        // return Math.floor(start * ( 1 + factor));
        return Math.floor(start  + factor);
    }

    /**
     * 取min-max范围内的随机整数
     * @param min
     * @param max
     */
    public static randomNumByRange(min:number,max:number):number{
        let range = max-min;
        let rand =Math.random();
        let num = min+Math.floor(Math.round(rand*range));
        return num;
    }

    /**
     * 判断那一面发生碰撞
     * @param selfNode
     * @param otherNode
     */
    public static getToward(selfNode:any,otherNode:cc.Node):number{
        let x1 = selfNode.x;
        let y1 = selfNode.y;
        let x2 = otherNode.x;
        let y2 = otherNode.y;
        let disX = x1 - x2;
        let disY = y1 - y2;
        if(disX >= disY){
            if(disX >= -disY){
                // 右
                return 4;
            }else if(disX < -disY){
                // 下
                return 2;
            }
        }else if(disX < disY){
            if(disX >= -disY){
                // 上
                return 1;
            }else if(disX < -disY){
                // 左
                return 3;
            }
        }
    }


    public static getCollisionPoint(node: cc.Node, angle: number, length: number): any {
        let Y = node.y + length * Math.cos(angle);
        let X = node.x - length * Math.sin(angle);
        return cc.v2(X, Y);
    }
}
