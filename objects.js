//shapes

function circle(x,y,r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
}

function rect(x,y,w,h) {
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
}

//rewrite passing to point objects
function proximity(x1,y1,x2,y2){
    //hello pythagorous
    vx = x1-x2;
    vy = y1-y2;
    a = (Math.abs(vx)>0)? vx : .001;
    b = (Math.abs(vy)>0)? vy : .001;
    c = Math.sqrt((a*a)+(b*b));
    return c;
}
//objects
function npc(id,initialX, initialY){
    this.id = id;
    this.name = 'John';
    this.debugDisplay = this.name+' ('+this.id+')';
    this.x = initialX;
    this.y = initialY;
    this.dx = 0;
    this.dy = 0;
    this.state = "idle"; //idle, attacking, fleeing
    this.maxHp = 65;
    this.hp = this.maxHp;
    this.minAttackRate = 1.2;
    this.maxAttackRate = 2;
    this.minDamage = 5;
    this.maxDamage = 9;
    this.hitChance = .8;
    this.critChance = .35;
    this.critRating = 1.85;
    this.kbs = 0; //killing blows
    this.timer;
    this.proximityList = {};
    this.hateList = [];

    this.draw = function (){
        this.statusCheck();
        this.updateProximityList();
        this.ambulator();
        if(this.state == 'attacking'){
            ctx.fillStyle = '#F00';
        }else{
            ctx.fillStyle = '#000';
        }
        
        circle(this.x, this.y, 15);
        ctx.font = '12px Arial';
        ctx.fillText(this.debugDisplay, this.x-10, this.y-20);
        plural = (this.kbs>1)?'s':'';
        if(this.kbs>0){
            ctx.fillText(this.kbs+' kill'+plural, this.x-10, this.y+30);
        }
        //ctx.fillText(proximity(this.x,this.y,mouseX,mouseY), this.x-10, this.y-30);
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText(this.hp, this.x-9, this.y+6);

    }
    this.statusCheck = function(){
        if (this.hp <= 0){
            this.die()
        }
        if(this.state == 'attacking'){
            if (this.hateList.length == 0){
                this.state = 'idle';
                this.wander();
                setTimeout('npcs['+this.id+'].refreshHp()', 3000);
            }
        //this.timer=setTimeout('npcs['+this.id+'].attack()', (Math.random()*(this.maxAttackRate-this.minAttackRate)*1000)+this.minAttackRate);
        }
    }
    //this method will eventually become a performance nightmare
    this.updateProximityList = function(){
        for(i in npcs){
            if (i == this.id){
                continue
            }//skip adding yourself
            prox = proximity(this.x, this.y, npcs[i].x, npcs[i].y);
            this.proximityList[npcs[i].id] = prox;
            if(prox < 50){
                previousState = this.state;
                this.state='attacking';
                if(this.hateList.indexOf(i) < 0){
                    this.hateList.push(i);
                }
                if(previousState!='attacking'){
                    this.attack();
                }
            }
        }
    }
    this.collisionCheck = function(x,y){
        collisionCriteria = [
        (x > WIDTH-20 || x < 20 || y > HEIGHT-20 || y < 20)
        ,(proximity(this.x,this.y,mouseX,mouseY) < 12)
        ];
        //console.log(collisionCriteria);
        //return (collisionCriteria.indexOf(true) >= 0);
        return collisionCriteria.some(function(value){return value;}); //could probably be made more efficient 
    }
    this.die = function(){
        clearTimeout(this.timer);
        delete npcs[this.id];
    }
    this.attack = function(){
        target = npcs[this.hateList[0]];
        if(target){
            if(this.hitCheck()){
                logString = '';
                isCrit = this.critCheck();
                critEffect = (isCrit)? this.critRating : 1;
                damage = Math.round(critEffect*(Math.random()*(this.maxDamage-this.minDamage)+this.minDamage));
                hitType = (isCrit)? ' CRIT ' : ' hit ';
                logString+=this.debugDisplay+hitType+target.debugDisplay+' for '+damage;
                newTargetHp = target.hp - damage;
                if(newTargetHp <= 0){
                    target.hp = 0;
                    this.kbs++;
                    if(this.kbs>recordKbs){
                        recordKbs = this.kbs;
                        recordHolder = this.debugDisplay;
                    }
                    logString+=' and killed him!';
                }else{
                    target.hp -= damage;
                    logString+='.';
                }
                console.log(logString);
            }else{
                console.log(this.debugDisplay+' missed '+target.debugDisplay+'!');
            }
            this.timer=setTimeout('if(npcs['+this.id+']){npcs['+this.id+'].attack();}', (Math.random()*(this.maxAttackRate-this.minAttackRate)*1000)+this.minAttackRate);
        }else{
            this.hateList.shift();
        }
    }
    this.hitCheck = function(){
        return (Math.random()<=this.hitChance);
    }
    this.critCheck = function(){
        return (Math.random()<=this.critChance);
    }
    this.ambulator = function(){
        if(this.state == 'attacking'){
			
        }else{
            futureX = this.x+this.dx;
            futureY = this.y+this.dy;
            if(!this.collisionCheck(futureX,futureY)){
                this.x=futureX;
                this.y=futureY;
            }else{
                //this.hp-=1;
                clearTimeout(this.timer);
                this.wander();
            }
        }
        
    }
    this.wander = function(){
        if (this.state == 'idle'){
            this.dx = (Math.random()*2)-1;
            this.dy = (Math.random()*2)-1;
            this.timer=setTimeout('if(npcs['+this.id+']){npcs['+this.id+'].wander();}', (Math.random()*4000)+1); //calls every 1 to 5 seconds
        }
    }
    this.refreshHp = function(){
        if (this.hp < this.maxHp){
            rate = Math.round(this.maxHp*.05);
            newHp = this.hp+rate;
            if(newHp<this.maxHp){
                this.hp = newHp;
            }else{
                this.hp = this.maxHp;
            }
            setTimeout('if(npcs['+this.id+'] && npcs['+this.id+'].state != "attacking"){npcs['+this.id+'].refreshHp();}', 1000);
        }
    }
    this.wander();
}