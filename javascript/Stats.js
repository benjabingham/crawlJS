class Stats{
    static logStats(){
        let n = 100000;
        [{array:monsterVars, type:'monster'},{array:containerVars,type:'container'}].forEach((category)=>{
            Object.keys(category.array).forEach((key)=>{
                let total = 0;
                let all = [];
                for(let i = 0; i < n; i++){
                    let entity = {entityGroupInfo:{key:key, entityType:category.type}};
                    LootManager.getEntityLoot(entity);
                    let inventory = entity.inventory.items;
                    let inventoryValue = 0;
                    if(inventory.gold){
                        inventoryValue += inventory.gold;
                    }
                    inventory.forEach((item)=>{
                        if(item.value){
                            inventoryValue += item.value;
                        }
                    })
                    total += inventoryValue;
                    all.push(inventoryValue);
                }
                all = all.sort((a,b)=>{
                    if( a > b){
                        return 1
                    }

                    return -1;
                })
                console.log({
                    key:key,
                    average:total/n,
                    mean:all[Math.floor(n/2)],
                    all:all
                })
            })
        })
    }
}