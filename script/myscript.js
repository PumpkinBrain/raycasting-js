    var canvas = document.getElementById("myCanvas");
    var context = canvas.getContext("2d");
    var PI = 3.14;
    var PI2 = PI/2;
    var PI3 = 3 * PI/2;
    var DR = 0.0174533;
    var UP = 4.71;
    var LEFT = 3.1399999999999997;
    var DOWN = 1.5699999999999994;
    var DOWN2 = 1.5699999999999998;
    var RIGHT = 6.28;


    var playerX = 88;
    var playerY = 88;
    var deltaX;
    var deltaY;
    var playerAngle = RIGHT;
    //var moveDistance = tileSize;
    var mapX = 8;
    var mapY = 8;
    var tileSize = 64;

    var lastPressedKey;

    var map = [
        1,1,1,1,1,1,1,1,
        1,0,0,1,0,0,0,1,
        1,0,0,1,0,1,1,1,
        1,0,0,0,0,1,0,1,
        1,0,0,0,0,0,0,1,
        1,0,0,1,1,0,1,1,
        1,0,0,0,1,0,0,1,
        1,1,1,1,1,1,1,1,
    ]

    window.requestAnimationFrame(init);
    window.addEventListener('keydown', (event)=>{
        handleUserInput(event.key);
    })

    function keepTurning(key){
        if(playerAngle != UP && playerAngle != LEFT && playerAngle != DOWN && playerAngle != RIGHT && playerAngle != 1.57 && playerAngle != 3.14 && playerAngle != DOWN2){
            handleUserInput(lastPressedKey);
        }
    }

    function movePlayer(xDelta, yDelta){
        var newX = playerX + xDelta * 13;
        var newY = playerY + yDelta * 13;

        var nextMapPosition = (newY>>6) * mapX + (newX>>6);
        if(map[nextMapPosition] == 1){
        } else {
            playerX = newX;
            playerY = newY;
        }
    }

    function handleUserInput(key){
        switch(key){
            case 'w':
                movePlayer(deltaX, deltaY);
                break;
            case 's':
                movePlayer(-deltaX, -deltaY);
                break;
            case 'a':
                playerAngle -= PI/16;
                if(playerAngle < 0){
                    playerAngle = 2*PI; 
                }
                deltaX = Math.cos(playerAngle) * 5;
                deltaY = Math.sin(playerAngle) * 5;
                lastPressedKey = 'a';
                break;
            case 'd':
                playerAngle += PI/16;
                if(playerAngle > 2*PI){
                    playerAngle = 0;
                }
                deltaX = Math.cos(playerAngle) * 5;
                deltaY = Math.sin(playerAngle) * 5;
                lastPressedKey = 'd';
                break;
        }
    }
    

    function drawLine(){
        context.beginPath();
        context.moveTo(playerX+8, playerY+8);
        context.lineTo(playerX + deltaX * 5, playerY + deltaY * 5);
        context.strokeStyle = "yellow";
        context.lineWidth = 4;
        context.stroke()
    }

    function drawPlayer(){
        context.beginPath();
        context.fillStyle = "yellow";
        context.rect(playerX, playerY, 16,16);
        context.fill();
    }

    function drawText(){
        context.font = "30px Arial";
        context.fillStyle = "transparent";
        context.fillText("moved!", 500, 480);
    }

    function drawMap2D(){
        var xOffset;
        var yOffset;
        for(y = 0; y < mapY; y++){
            for(x = 0; x < mapX; x++){
                xOffset = x * tileSize;
                yOffset = y * tileSize;
                context.beginPath();
                context.rect(xOffset +1, yOffset +1, tileSize -1, tileSize -1);
                if(map[y*mapX+x] == 1){context.fillStyle = "blue";} else {context.fillStyle = "black";}
                context.fill();
            }
        }
    }

    function draw(){
        context.clearRect ( 0 , 0 , canvas.width, canvas.height);
        drawMap2D();
        drawPlayer();
        drawLine();
        drawRays2D();
        drawText();
    }

    function gameLoop(){
        draw();
        keepTurning();
        window.requestAnimationFrame(gameLoop);
    } 

    function init(){
        deltaX = Math.cos(playerAngle) * 5;
        deltaY = Math.sin(playerAngle) * 5;
        gameLoop();
    }

    //WTFFFFFFF

    function drawRays2D(){
        var depthOfField;
        var rayX;
        var rayY;
        var xOffset;
        var yOffset;
        var finalDistance;
        var i;
        
        var mx;
        var my;
        var mapPosition;
        
        var rayAngle = playerAngle - DR * 30;
        if(rayAngle < 0){
            rayAngle += 2*PI;
        }
        if(rayAngle > 2*PI){
            rayAngle -= 2*PI;
        }

        for(i = 0; i < 60; i++){
            //horizontal lines check
            depthOfField = 0;
            var aTangent = -1/Math.tan(rayAngle);
            var horizontalDistance = 10000;
            var horizontalX = playerX;
            var horizontalY = playerY;

            //facing up
            if(rayAngle > PI){
                rayY = ((playerY >> 6) << 6) - 0.0001;
                rayX = (playerY - rayY) * aTangent + playerX;
                yOffset=-64;
                xOffset = -yOffset * aTangent;
            }

            //facing down
            if(rayAngle < PI){
                rayY = ((playerY >> 6) << 6) + 64;
                rayX = (playerY - rayY) * aTangent + playerX;
                yOffset=64;
                xOffset = -yOffset * aTangent;
            }

            if(rayAngle == 0 || rayAngle == PI){
                rayX = playerX;
                rayY = playerY;
                depthOfField = 8;
            }

            while(depthOfField < 8){
                mx = rayX >> 6;
                my = rayY >> 6;
                mapPosition = my * mapX + mx;
                if(mapPosition > 0 && mapPosition < mapX * mapY && map[mapPosition]==1){
                    horizontalX = rayX;
                    horizontalY = rayY;
                    horizontalDistance=distance(playerX, playerY, horizontalX, horizontalY, rayAngle);
                    depthOfField=8;
                } else {
                    rayX += xOffset;
                    rayY += yOffset;
                    depthOfField += 1;
                }
            }

            //Vertical lines check
            depthOfField = 0;
            var nTangent = -Math.tan(rayAngle);
            var verticalDistance = 10000;
            var verticalX = playerX;
            var verticalY = playerY;

            //facing left
            if(rayAngle > PI2 && rayAngle < PI3){
                rayX = ((playerX >> 6) << 6) - 0.0001;
                rayY = (playerX - rayX) * nTangent + playerY;
                xOffset=-64;
                yOffset = -xOffset * nTangent;
            }

            //facing right
            if(rayAngle < PI2 || rayAngle > PI3){
                rayX = ((playerX >> 6) << 6) + 64;
                rayY = (playerX - rayX) * nTangent + playerY;
                xOffset=64;
                yOffset = -xOffset * nTangent;
            }

            if(rayAngle == 0 || rayAngle == PI){
                rayX = playerX;
                rayY = playerY;
                depthOfField = 8;
            }

            while(depthOfField < 8){
                mx = rayX >> 6;
                my = rayY >> 6;
                mapPosition = my * mapX + mx;
                if(mapPosition > 0 && mapPosition < mapX * mapY && map[mapPosition]==1){
                    verticalX = rayX;
                    verticalY = rayY;
                    verticalDistance=distance(playerX, playerY, verticalX, verticalY, rayAngle);
                    depthOfField=8;
                } else {
                    rayX += xOffset;
                    rayY += yOffset;
                    depthOfField += 1;
                }
            }
            if(verticalDistance < horizontalDistance){
                rayX = verticalX;
                rayY = verticalY;
                finalDistance = verticalDistance;
                context.strokeStyle = "rgb(0,100,0)";
            }
            if(horizontalDistance < verticalDistance){
                rayX = horizontalX;
                rayY = horizontalY;
                finalDistance = horizontalDistance;
                context.strokeStyle = "rgb(0,50,0)";
            }
            context.beginPath();
            context.moveTo(playerX +8, playerY+8);
            context.lineTo(rayX, rayY);
            context.lineWidth = 2;
            context.stroke()
            rayAngle += DR;
            if(rayAngle < 0){
                rayAngle += 2*PI;
            }
            if(rayAngle > 2*PI){
                rayAngle -= 2*PI;
            }

            //draw3D
            render3D(rayAngle, finalDistance, i);
            // var fixAngle = playerAngle - rayAngle;
            // if(fixAngle < 0){fixAngle += 2*PI;}
            // if(fixAngle > 2*PI){fixAngle -= 2*PI;}
            // finalDistance = finalDistance * Math.cos(fixAngle);

            // var lineHight = (tileSize * 320) / finalDistance;
            // var lineOffset = 512/2 - lineHight/2; //full window height/2 - lineHeight/2
            // //if(lineHight > 512) {lineHight = 512;}
            // context.lineWidth = 8;
            // context.moveTo(i*8+530, lineOffset);
            // context.lineTo(i*8+530, lineHight + lineOffset);
            // context.stroke();
        }


    }

    function distance(ax, ay, bx, by, angle){
        return (Math.sqrt((bx - ax) * (bx-ax) + (by - ay) * (by - ay)));
    }

    function render3D(rayAngle, rayDistance, i){
        var fixAngle = playerAngle - rayAngle;
            if(fixAngle < 0){fixAngle += 2*PI;}
            if(fixAngle > 2*PI){fixAngle -= 2*PI;}
            rayDistance = rayDistance * Math.cos(fixAngle);

            var lineHight = (tileSize * 320) / rayDistance;
            var lineOffset = 512/2 - lineHight/2; //full window height/2 - lineHeight/2
            var lineWidth = 8;
            //if(lineHight > 512) {lineHight = 512;}
            context.beginPath();
            context.lineWidth = lineWidth;
            context.moveTo(i*lineWidth+515, lineOffset);
            context.lineTo(i*lineWidth+515, lineHight + lineOffset);
            context.stroke();
    }