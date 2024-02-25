class LootManager{
    constructor(){
        this.weaponMaterials = {
            wood:{
                name:'wooden',
                flimsy:5,
                stunTime: -2,
                weight:-1,
                damage:-4,
                value:.25,
                color:'woodbrown'

            },
            bone:{
                name:'bone',
                flimsy:8,
                stunTime:-2,
                weight:-1,
                damage: -3,
                value:.15,
                color:'bone'
            },
            stone:{
                name:'stone',
                flimsy:5,
                weight:2,
                stunTime:3,
                blunt:{
                    damage:4
                },
                edged:{
                    damage:2
                },
                value:.2,
                color:'gray'
            },
            
            obsidian:{
                name:'obsidian',
                flimsy:5,
                edged:{
                    damage:2
                },
                value:.5
            },
            lead:{
                name:'lead',
                flimsy:3,
                weight:1,
                stunTime:2,
                blunt:{
                    damage:5
                },
                edged:{
                    damage:3
                },
                value:2,
                color:'darkgray'
            },
            rubber:{
                name:'rubber',
                blunt:{
                    damage:-5,
                    stunTime:2
                },
                edged:{
                    damage:-8
                },
                value:.5
            },
            glass:{
                name:'glass',
                flimsy:40,
                value:3,
                edged:{
                    damage:6
                },
                color:'clearblue'
            },
            copper:{
                name:'copper',
                flimsy:3,
                value:2,
                color:'redbrown'
            },
            bronze:{
                name:'bronze',
                flimsy:2,
                edged:{
                    damage:1
                },
                value:3,
                color:'brown'
            },
            iron:{
                name:'iron',
                flimsy:1,
                edged:{
                    damage:1
                },
                value:2.5,
                color:'gray'
            },
            steel:{
                name:'steel',
                edged:{
                    damage:2
                },
                value:4.5,
                value:2,
                color:'lightgray'
            },
            ironwood:{
                name:'ironwood',
                stunTime:2,
                blunt:{
                    damage:2
                },
                edged:{
                    damage:-1
                },
                value:6,
                value:3,
                color:'redbrown'
            },
            crystal:{
                name:'crystal',
                flimsy:20,
                value:8,
                edged:{
                    damage:8
                },
                color:'purple'
            },
            lightsteel:{
                name:'lightsteel',
                weight:-1,
                stunTime:-2,
                blunt:{
                    damage:-2
                },
                edged:{
                    damage:2
                },
                value:8,
                color:'silver'

            },
            silver:{
                name:'silver',
                flimsy:5,
                edged:{
                    damage:-1
                },
                value:10,
                color:'silver'
            },
            gold:{
                name:'gold',
                weight:1,
                stunTime:2,
                flimsy:8,
                edged:{
                    damage:-2
                },
                blunt:{
                    damage:2
                },
                value:12,
                color:'gold'
            },
            Adamantine:{
                name:'adamantine',
                weight:-1,
                edged:{
                    damage:2
                },
                value:20,
                color:'blue'
            }
        }

        this.treasureMaterials = {
            paper:{
                name:"paper",
                value:.1,
                color:"bone"
            },
            bone:{
                name:"bone",
                value:0.3,
                color:"bone"
            },
            wood:{
                name:'wooden',
                value:0.4,
                color:"woodbrown"
            },
            stone:{
                name:'stone',
                value:0.5,
                color:"gray"
            },
            obsidian:{
                name:'obsidian',
                value:0.6,
            },
            sandstone:{
                name:'sandstone',
                value:0.5,
                color:'bone'
            },
            iron:{
                name:'iron',
                value:.6,
                color:"gray"
            },
            steel:{
                name:'steel',
                value:1,
                color:"lightgray"
            },
            bronze:{
                name:'bronze',
                value:1.2,
                color:"brown"
            },
            lead:{
                name:'lead',
                value:2,
                color:"darkgray"
            },
            copper:{
                name:'copper',
                value:3,
                color:"redbrown"
            },
            nickel:{
                name:'nickel',
                value:3.5,
                color:"lightgray"
            },
            tin:{
                name:'tin',
                value:4,
                color:"lightgray"
            },
            sterling:{
                name:'sterling silver',
                value:5,
                color:'silver'
            },
            silver:{
                name:'silver',
                value:8,
                color:"silver"
            },
            gold:{
                name:'gold',
                value:10,
                color:"gold"
            },
            platinum:{
                name:'platinum',
                value:20,
                color:"silver"
            }
        }

        this.treasureModifiers = {
            decrepit:{
                name:'distressed',
                value:.4
            },
            distressed:{
                name:'distressed',
                value:.6
            },
            pristine:{
                name:'pristine',
                value:1.5
            },
            
        }

        this.weaponModifiers = {
            worn:{
                name:'worn',
                flimsy:1,
                edged:{
                    damage:-1
                },
                value:.4
            },
            craftTiers:{
                poor:{
                    name:'poor',
                    flimsy:3,
                    variance:{
                        positive:0,
                        negative:50
                    },
                    value:.4
                },
                rustic:{
                    name:'rustic',
                    flimsy:1,
                    variance:{
                        positive:20,
                        negative:50
                    },
                    value:.7
                },
                artisan:{
                    name:'artisan',
                    variance:{
                        positive:30,
                        negative:30
                    },
                    value:1.2
                },
                masterwork:{
                    name:'masterwork',
                    variance:{
                        positive:50,
                        negative:10
                    },
                    value:5
                }
            }
        }
    }

    giveMonsterLoot(entity){
        if(!entity.loot){
            return false;
        }
        if(!entity.inventory){
            entity.inventory = [];
        }
        let weaponLoot = entity.loot.weapon;
        if(weaponLoot){
            if(this.roll(1,99) < weaponLoot.chance){
                entity.inventory.push(this.getWeaponLoot(weaponLoot.tier));
            }
        }

        let treasureLoot = entity.loot.treasure;
        if(treasureLoot){
            if(this.roll(1,99) < treasureLoot.chance){
                entity.inventory.push(this.getTreasureLoot(treasureLoot.tier));
            }
        }
    }

    getTreasureLoot(tier){
        let nRolls = tier-3;
        let greater = (nRolls > 0);
        nRolls = Math.abs(nRolls);

        let treasure = this.getTreasure();
        let treasureMaterial = this.getTreasureMaterial();
        this.applyModifier(treasure, treasureMaterial);

        for(let i = 0; i < nRolls; i++){
            let newTreasure = this.getTreasure();
            treasureMaterial = this.getTreasureMaterial();
            this.applyModifier(newTreasure, treasureMaterial);
            if((greater && newTreasure.value > treasure.value) || (!greater && newTreasure.value < treasure.value)){
                treasure = newTreasure;
            }
        }

        this.getTreasureModifier(treasure, tier);


        return treasure;
    }

    getWeaponLoot(tier){
        let weapon = this.getWeapon();
        let weaponMaterial = this.getWeaponMaterial(tier);
        this.applyModifier(weapon, weaponMaterial);
        this.getIsWorn(weapon, tier);

        return weapon;
    }

    getTreasureModifier(treasure, tier){
        let random = this.roll(1,99);
        random += tier*5;
        if(random < 30){
            this.applyModifier(treasure, this.treasureModifiers.decrepit)
        }else if (random < 60){
            this.applyModifier(treasure, this.treasureModifiers.distressed)
        }else if (random >= 90){
            this. applyModifier(treasure, this.treasureModifiers.pristine)
        }
    }

    getWeaponMaterial(tier){
        let materials = Object.keys(this.weaponMaterials);
        let nMaterials = materials.length;
        let nRolls = tier-3;
        let maxMinFunc = (nRolls > 0) ? Math.max : Math.min;
        nRolls = Math.abs(nRolls);
        let materialIndex = this.roll(0,nMaterials-1);
        for(let i = 0; i < nRolls; i++){
            let newIndex = this.roll(0,nMaterials-1);
            materialIndex = maxMinFunc(materialIndex,newIndex);
        }
        let key = materials[materialIndex];
        let material = this.weaponMaterials[key];

        return material;
    }

    getTreasureMaterial(){
        let materials = Object.keys(this.treasureMaterials);
        let nMaterials = materials.length;
        let materialIndex = this.roll(0,nMaterials-1);
        let key = materials[materialIndex];
        let material = this.treasureMaterials[key];

        return material;
    }

    getIsWorn(weapon, tier){
        let nonWornChance = 20 * tier;
        if(this.roll(0,99) >= nonWornChance){
            this.applyModifier(weapon,this.weaponModifiers.worn);
        }
    }

    getWeapon(){
        let weapons = Object.keys(itemVars.weapons);
        let nWeapons = weapons.length;
        let weaponIndex = this.roll(0,nWeapons-1);
        
        let key = weapons[weaponIndex];
        let weapon = itemVars.weapons[key];

        console.log(weapon);

        return JSON.parse(JSON.stringify(weapon));
    }

    getTreasure(){
        let treasures = Object.keys(itemVars.treasure);
        let nTreasures = treasures.length;
        let treasureIndex = this.roll(0,nTreasures-1);
        
        let key = treasures[treasureIndex];
        let treasure = itemVars.treasure[key];

        return JSON.parse(JSON.stringify(treasure));
    }

    applyModifier(item, modifier, recursion = false){
        item[modifier.name] = true;
        for (const [key, value] of Object.entries(modifier)){
            switch(key){
                case 'name':
                    item[key] = value + ' ' + item[key];
                    break;
                case 'damage':
                case 'stunTime':
                case 'weight':
                    if(item[key]){
                        item[key] += value;
                        item[key] = Math.max(1,item[key]);
                    }
                    break;
                case 'flimsy':
                    if(!item[key]){
                        item[key] = 0;
                    }
                    item[key]+= value;
                    break;
                case 'blunt':
                case 'edged':
                    if(item.type[key] || (item.type['sword'] && key == 'edged')){
                        this.applyModifier(item, value,true);
                    }
                    break;
                case 'value':
                    if(item[key]){
                        item[key] *= value;
                        item[key] += .5;
                        item[key] = Math.floor(item[key]);
                        item[key] = Math.max(item[key], 1);
                    }
                    break;
                case 'color':
                    item[key] = value;
            }
        }
        let lootManager = this;
        //apply modifier to special strikes
        ['jab','swing','strafe'].forEach(function(val){
            //only do this once!
            if(item[val] && !recursion){
                lootManager.applyModifier(item[val], modifier);
            }
        })
    }

    breakWeapon(item){
        item.name += " (broken)";
        item.weapon = false;
        item.value *= 0.7;
        item.value = Math.floor(item.value);
        item.value = Math.max(item.value,1);
    }

    roll(min,max){
        return Math.floor(Math.random()*(max-min+1))+min;
    }

    getColor(val){
        let color;
        if(val <= 3){
            color = 'brown';
        }else if (val <= 15){
            color = 'gray';
        }else if (val <= 25){
            color = 'silver';
        }else if (val <= 35){
            color = 'gold';
        }else if (val <= 50){
            color = 'gold';
        }else{
            color = 'purple';
        }

        return color;
    }
}