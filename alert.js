'use strict';

var game = new Game();
game.start();
//game.mineRandom(10);

function Game() {
	this.gameField = [];
	this.mineArray = [];
	this.container = document.getElementById("mainContainer");
	this.time = document.getElementById("time");
	this.minesView = document.getElementById("mineCount");
	this.mineFound = 0;
	this.cellsMarked = 0;
	this.mineCount = 0;
	this.firstClick = true;
	this.timeId = 0;
	var self = this;

		this.start = function() {
			 this.width = parseInt(prompt("GameField width(min:9):", '') );
			 this.height = parseInt(prompt("GameField height(min:9):", '') );
			 this.mineCount = parseInt(prompt("Mines number:",'') );

			 if(!isNumeric(this.width) || !isNumeric(this.height) || !isNumeric(this.mineCount) || this.mineCount >= (this.width * this.height) || this.width < 9 || this.height < 9)
			 	this.start();

			this.container.style.width = this.width * 40 + "px";
			this.count = this.width * this.height;
			this.init();
			this.mineRandom(this.mineCount);
		}

		this.init = function(count) {
			document.oncontextmenu = function (){return false};
			count = this.count || count;

			for(let i = 0; i < count; i++) {
				this.gameField.push( this.createCell(this.container,i) );
			}
		}

		this.createCell = function(parent, id) {
			parent = parent || document.body;

			var button = document.createElement("input");
			button.type = "button";
			button.className = "button";
			button.statusState = "none"; // opened or dk or none
			button.mine = false;//is it mine?
			button.number = 0;//mines around
			button.marked = false;
			button.id = id;

			button.onclick = function() {
				if(this.statusState == "marked")
					return;
				if(self.firstClick) {
					self.timeStart();
					self.firstClick = false;
				}

				this.isMine() ? self.gameOver() : this.opened();
			
			}

			button.oncontextmenu = function() {

				if(this.statusState == "none" && self.cellsMarked < self.mineCount) {
					this.statusState = "marked";

					if(this.isMine()) {
						self.mineFound++;
						this.marked = true;
					}
					self.cellsMarked++;

					this.value = "\uD83D\uDEA9";
					this.style.color = "#bf1d0b";

					self.checkWin();
					self.mineCountRefresh();
					return;
				}

				if(this.statusState == "marked") {
					this.statusState = "dk";

					this.value = "\u003F";
					this.style.color = "black";
					return;
				}

				if(this.statusState == "dk") {
					this.statusState = "none";

					if(this.marked) {
						self.mineFound--;
						this.marked = false;
					}
					self.cellsMarked--;
					this.value = "";
					self.mineCountRefresh();
					return;
				}
				
			}

			button.isMine = function() {
				return this.mine;
			}

			button.getId = function() {
				return parseInt(this.id);
			}

			button.colorIt = function() {
				if(this.value == 1) 
				this.style.color = "#414fbd";

				if(this.value == 2) 
				this.style.color = "#226805";

				if(this.value == 3) 
				this.style.color = "#a9262a";

				if(this.value == 4) 
				this.style.color = "#010280";

			}

			button.incrementNumber = function() {
				var id = this.getId();

				if(self.gameField[id - 1] && !self.gameField[id - 1].mine && (id + 1) % self.width != 1)
				self.gameField[id - 1].number++;//left

				if(self.gameField[id + 1] && !self.gameField[id + 1].mine && (id + 1) % self.width != 0)
				self.gameField[id + 1].number++;//right

				if(self.gameField[id - self.width] && !self.gameField[id - self.width].mine && (id + 1) - self.width > 0)
				self.gameField[id - self.width].number++;//top

				if(self.gameField[id + self.width] && !self.gameField[id + self.width].mine)
				self.gameField[id + self.width].number++;//bottom

				if(self.gameField[id - self.width + 1] && !self.gameField[id - self.width + 1].mine && (id + 1) % self.width != 1 && (id + 1) - self.width > 0)
				self.gameField[id - self.width + 1].number++;//top left

				if(self.gameField[id + self.width - 1] && !self.gameField[id + self.width - 1].mine && (id + 1) % self.width != 1)
				self.gameField[id + self.width - 1].number++;//bottom left

				if(self.gameField[id + self.width + 1 ] && !self.gameField[id + self.width + 1].mine && (id + 1) % self.width != 0 && (id + 1) % self.width != 0)
				self.gameField[id + self.width + 1].number++;//bottom right

				if(self.gameField[id - self.width - 1] && !self.gameField[id - self.width - 1].mine && (id + 1) - self.width > 0 && (id + 1) % self.width != 0)
				self.gameField[id - self.width - 1].number++;//top right
			}

			button.emptyCells = function() {
				var id = this.getId();

				if((id + 1) % self.width != 1 && self.gameField[id - 1].statusState != "opened" && !self.gameField[id - 1].mine) {
					self.gameField[id - 1].classList.add("opened");
					self.gameField[id - 1].onclick();//left					
				}

				if((id + 1) % self.width != 0 && self.gameField[id + 1].statusState != "opened" && !self.gameField[id + 1].mine) {
					self.gameField[id + 1].classList.add("opened");
					self.gameField[id + 1].onclick();//right					
				}
				

				if((id + 1) - self.width > 0 && self.gameField[id - self.width].statusState != "opened" && !self.gameField[id - self.width].mine) {
					self.gameField[id - self.width].classList.add("opened");
					self.gameField[id - self.width].onclick();//top
				}

				if(self.gameField[id + self.width].statusState != "opened" && !self.gameField[id + self.width].mine) {
					self.gameField[id + self.width].classList.add("opened");
					self.gameField[id + self.width].onclick();//bottom					
				}
				
				if((id + 1) % self.width != 1 && (id + 1) - self.width > 0 && self.gameField[id - self.width + 1].statusState != "opened" && !self.gameField[id - self.width + 1].mine ) {
					self.gameField[id - self.width + 1].classList.add("opened");
					self.gameField[id - self.width + 1].onclick();//left					
				}

				if((id + 1) % self.width != 1 && self.gameField[id + self.width - 1].statusState != "opened" && !self.gameField[id + self.width - 1].mine) {
					self.gameField[id + self.width - 1].classList.add("opened");
					self.gameField[id + self.width - 1].onclick();//right					
				}
				if((id + 1) % self.width != 0 && self.gameField[id + self.width + 1 ].statusState != "opened" && !self.gameField[id + self.width + 1].mine) {
					self.gameField[id + self.width + 1 ].classList.add("opened");
					self.gameField[id + self.width + 1 ].onclick();//left					
				}

				if((id + 1) - self.width > 0 && (id + 1) % self.width != 0 && self.gameField[id - self.width - 1].statusState != "opened" && !self.gameField[id - self.width - 1].mine) {
					self.gameField[id - self.width - 1].classList.add("opened");
					self.gameField[id - self.width - 1].onclick();//right					
				}
			}

			button.opened = function() {

				if(this.number != 0) {
					this.value = this.number;
					this.colorIt();
					this.statusState = "opened";
					this.classList.add("opened");

				} else {
					this.value = "";
					this.statusState = "opened";
					this.classList.add("opened");
					this.emptyCells();
				}

			}
				
			parent.appendChild(button);
			return button;
			
		}

		this.mineRandom = function(mineCount) {
			this.mineCount = mineCount;

			for(let i = 0; i < mineCount;i++) {

				var randInt = getRandomInt(0,this.gameField.length);
				if(!this.gameField[randInt].mine) {
					this.gameField[randInt].mine = true;
					this.gameField[randInt].incrementNumber();
					this.mineArray.push(this.gameField[randInt]);

				} else {
					mineCount++;
				}
			}
			this.mineCountRefresh();
		}

		this.checkWin = function() {
			if(this.mineFound == this.mineCount) {
				alert("You win!");
				// self = {};
			}
		}

		this.timeStart = function() {
			var time = new Date();
			this.timeId = setInterval(function() {
				this.time.innerHTML = Math.round( ((new Date) - time) / 1000);
			},1000);
		}

		this.mineCountRefresh = function() {
			this.minesView.innerHTML = this.mineCount - this.cellsMarked;
		}
		
		this.gameOver = function() {
			for(let i = 0; i < this.mineArray.length; i++) {
				this.mineArray[i].value = "\uD83D\uDCA3";
				this.mineArray[i].style.color = "black";
				
			}
			clearInterval(this.timeId);
			setTimeout(function() { alert("GameOver!"); } ,100);
		}
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}