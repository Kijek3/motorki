var canvas, ctx, grassSmall, dirtSmall, finishLine;
var players = [], motors = [], colors = ["#ed1515", "#2bd10e", "#0e96d1", "#cd15f2"], fireworks = [], controls = [90, 88, 67, 86];
var playersNumber = 0, choosePlayerEl = [], chooseControlEl = [];
var controlClickedId = null;
var trailLength = 35;
var keys;
var speed = 4, turnSpeed = 0.03;
var laps, lapsCount = 5;
var gameStarted = false;
var respawn = false, playersLeft;
function ready() {
    canvas = document.getElementById("canvas");
    canvas.width = 1000;
    canvas.height = 600;
    ctx = canvas.getContext("2d");
    ctx.lineWidth = 3;
    choosePlayerEl = document.getElementsByClassName("player");
    chooseControlEl = document.getElementsByClassName("control");
    //#region TEKSTURY
    grassSmall = document.getElementById("grassSmall");
    dirtSmall = document.getElementById("dirtSmall");
    finishLine = document.getElementById("finishSmall");
    fireworks.push(document.getElementById("fireworksRed"));
    fireworks.push(document.getElementById("fireworksGreen"));
    fireworks.push(document.getElementById("fireworksBlue"));
    fireworks.push(document.getElementById("fireworksViolet"));
    fireworks.push(document.getElementById("fireworksRed2"));
    fireworks.push(document.getElementById("fireworksGreen2"));
    fireworks.push(document.getElementById("fireworksBlue2"));
    fireworks.push(document.getElementById("fireworksViolet2"));
    motors.push(document.getElementById("motorRed"));
    motors.push(document.getElementById("motorGreen"));
    motors.push(document.getElementById("motorBlue"));
    motors.push(document.getElementById("motorViolet"));
    //#endregion
    //#region STEROWANIE
    window.addEventListener('keydown', function (e) {
        if (controlClickedId != null && e.key != " ") {
            chooseControlEl[controlClickedId - 1].innerText = e.key.toLowerCase();
            chooseControlEl[controlClickedId - 1].style.color = "white";
            controls[controlClickedId - 1] = e.keyCode;
            controlClickedId = null;
        }
        keys = (keys || []);
        keys[e.keyCode] = true;
    })
    window.addEventListener('keyup', function (e) {
        keys[e.keyCode] = false;
    })
    //#endregion
    document.getElementById("lapCount").addEventListener("mousedown", function (e) {
        e.preventDefault();
        if (e.which == 1)
            lapsCount++;
        else if (e.which == 3)
            lapsCount--;
        else if (e.which == 2)
            lapsCount = 5;
        if (lapsCount == 0)
            lapsCount = 1;
        if (lapsCount == 21)
            lapsCount = 20
        document.getElementById("lapCount").innerText = "LAPS:" + lapsCount;
    })
    document.getElementById("lapCount").addEventListener("contextmenu", function (e) {
        e.preventDefault();
    })
}

//#region MENU
function playersChoose(players) {
    for (var i = 0; i < choosePlayerEl.length; i++) {
        if (i != players - 1) {
            choosePlayerEl[i].style.color = "white";
        }
        chooseControlEl[i].style.display = "none";
    }
    playersNumber = players;
    if (playersNumber == 1) {
        respawn = true;
        respawnMouseOut();
    }
    if (controlClickedId != null) {
        chooseControlEl[controlClickedId - 1].style.color = "white";
        controlClickedId = null;
    }
    for (var i = 0; i < playersNumber; i++) {
        chooseControlEl[i].style.display = "block";
    }
    document.getElementById("respawn").style.display = "block";
    document.getElementById("startButton").style.display = "block";
    document.getElementById("lapCount").style.display = "block";
}

function playerMouseOut(players) {
    if (playersNumber != players) {
        choosePlayerEl[players - 1].style.color = "white";
    }
}

function controlsChoose(id) {
    for (var i = 0; i < choosePlayerEl.length; i++) {
        if (i != id - 1) {
            chooseControlEl[i].style.color = "white";
        }
    }
    controlClickedId = id;
}

function controlMouseOut(id) {
    if (controlClickedId != id) {
        chooseControlEl[id - 1].style.color = "white";
    }
}

function respawnRule() {
    if (playersNumber != 1) {
        respawn = !respawn;
        respawnMouseOut();
    }
}

function respawnMouseOut() {
    if (respawn) {
        document.getElementById("respawn").style.color = "#ed1515";
    } else {
        document.getElementById("respawn").style.color = "white";
    }
}
//#endregion

function startGame() {
    for (var i = 0; i < fireworks.length; i++) {
        fireworks[i].style.display = "none";
    }
    controlClickedId = null;
    document.getElementById("menu").style.display = "none";
    laps = lapsCount;
    players = [];
    playersLeft = playersNumber;
    gameStarted = true;
    for (var i = 0; i < playersNumber; i++) {
        players.push(new Player(500, (475 + i * 35), i))
    }
    requestAnimationFrame(oneFrame);
}

function oneFrame() {
    ctx.clearRect(0, 0, 1000, 600);
    drawTrack();
    if (gameStarted) {
        lapCounter();
        for (var i = 0; i < players.length; i++) {
            players[i].drawPlayer();
            players[i].checkCollision();
            players[i].checkLap();
        }
    }
    if (laps > 0) {
        if (playersLeft > 1 || respawn) {
            requestAnimationFrame(oneFrame);
        } else {
            for (var i = 0; i < players.length; i++) {
                if (!players[i].isCollision) {
                    fireworks[i].style.display = "block";
                    fireworks[i + 4].style.display = "block";
                    document.getElementById("menu").style.display = "block";
                    gameStarted = false;
                    break;
                }
            }
        }
    } else {
        for (var i = 0; i < players.length; i++) {
            if (players[i].laps == 0) {
                fireworks[i].style.display = "block";
                fireworks[i + 4].style.display = "block";
                document.getElementById("menu").style.display = "block";
                gameStarted = false;
                break;
            }
        }
    }
}

function drawTrack() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 3;
    //TŁO
    ctx.beginPath();
    ctx.fillStyle = ctx.createPattern(grassSmall, "repeat");
    ctx.rect(0, 0, 1000, 600);
    ctx.closePath();
    ctx.fill();
    //TOR
    ctx.beginPath();
    ctx.arc(300, 300, 300, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.arc(700, 300, 300, 1.5 * Math.PI, 0.5 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = ctx.createPattern(dirtSmall, "repeat");
    ctx.fill();
    ctx.stroke();
    //LINIA METY
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.fillStyle = ctx.createPattern(finishLine, "repeat");
    ctx.rect(490, 450, 20, 148.3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    //WYSPA
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(300, 300, 150, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.arc(700, 300, 150, 1.5 * Math.PI, 0.5 * Math.PI);
    ctx.closePath();
    ctx.fillStyle = ctx.createPattern(grassSmall, "repeat");
    ctx.fill();
    ctx.stroke();
}

function lapCounter() {
    ctx.font = "bold 120px Calibri";
    for (var i = 0; i < players.length; i++) {
        if (laps > players[i].laps) {
            laps = players[i].laps;
        }
        ctx.fillStyle = colors[i];
        ctx.strokeStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(players[i].laps, canvas.width / 2 + (i - 1) * 150 - 75, canvas.height / 2 + 40);
        ctx.strokeText(players[i].laps, canvas.width / 2 + (i - 1) * 150 - 75, canvas.height / 2 + 40);
    }
}

class Player {
    constructor(x, y, id) {
        this.startX = x;
        this.startY = y;
        this.playerX = x;
        this.playerY = y;
        this.respawnX = x;
        this.respawnY = y;
        this.playerID = id;
        this.trailX = [];
        this.trailY = [];
        this.isCollision = false;
        this.alfa = 0;
        this.laps = laps;
        this.onMetaLine = true;
        this.respawnCounter = 50;
        this.trailLength = trailLength;
    }

    drawPlayer() {
        if (this.trailX.length > 0) {
            var grad = ctx.createLinearGradient(this.startX, this.startY, this.trailX[this.trailX.length - 1], this.trailY[this.trailY.length - 1]);
            grad.addColorStop(0, "#e8bc65");
            grad.addColorStop(0.5, colors[this.playerID]);
            ctx.strokeStyle = grad;
        } else {
            ctx.strokeStyle = this.playerID;
        }
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        for (var i = 0; i < this.trailX.length; i++) {
            ctx.lineTo(this.trailX[i], this.trailY[i]);
            ctx.moveTo(this.trailX[i], this.trailY[i]);
        }
        if (!this.isCollision) {
            if (keys && keys[controls[this.playerID]]) {
                this.alfa += turnSpeed * Math.PI;
            }
            this.playerX += Math.cos(this.alfa) * speed;
            this.playerY -= Math.sin(this.alfa) * speed;
            ctx.lineTo(this.playerX, this.playerY);
            this.trailX.push(this.playerX);
            this.trailY.push(this.playerY);
        }
        ctx.stroke();
        ctx.save();
        ctx.translate(this.playerX, this.playerY);
        ctx.rotate(-this.alfa);
        ctx.drawImage(motors[this.playerID], -25, -12.5, 50, 25);
        ctx.restore();
        if (this.trailLength == 0) {
            this.clearTrail();
        } else {
            this.trailLength--;
        }
    }

    checkCollision() {
        if (!this.isCollision) {
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(300, 300, 300, 0.5 * Math.PI, 1.5 * Math.PI);
            ctx.arc(700, 300, 300, 1.5 * Math.PI, 0.5 * Math.PI);
            ctx.closePath();
            if (!ctx.isPointInPath(this.playerX, this.playerY)) {
                this.isCollision = true;
                if (!respawn) {
                    playersLeft--;
                }
            }
            ctx.beginPath();
            ctx.arc(300, 300, 150, 0.5 * Math.PI, 1.5 * Math.PI);
            ctx.arc(700, 300, 150, 1.5 * Math.PI, 0.5 * Math.PI);
            ctx.closePath();
            if (ctx.isPointInPath(this.playerX, this.playerY)) {
                this.isCollision = true;
                if (!respawn) {
                    playersLeft--;
                }
            }
        } else {
            if (respawn) {
                this.respawn();
            }
        }
    }

    respawn() {
        if (this.respawnCounter == 0) {
            this.onMetaLine = true;
            this.startX = this.respawnX;
            this.startY = this.respawnY;
            this.playerX = this.respawnX;
            this.playerY = this.respawnY;
            this.alfa = 0;
            this.respawnCounter = 50;
            this.trailLength = trailLength;
            this.isCollision = false;
        } else {
            this.respawnCounter--;
        }
    }

    checkLap() {
        if (!this.isCollision) {
            if (this.playerX >= 490 && this.playerX <= 510 && this.playerY >= 450 && !this.onMetaLine) {
                this.onMetaLine = true;
                if (Math.cos(this.alfa) > 0) {
                    this.laps--;
                }
            }
            if (this.playerX < 490 && this.onMetaLine || this.playerX > 510 && this.onMetaLine) {
                this.onMetaLine = false;
                if (Math.cos(this.alfa) < 0) {
                    this.laps++;
                }
            }
        }
    }

    clearTrail() {
        if (this.trailX.length > 0) {
            this.trailX.shift();
            this.trailY.shift();
            this.startX = this.trailX[0];
            this.startY = this.trailY[0];
        }
    }
}

document.addEventListener("DOMContentLoaded", ready);