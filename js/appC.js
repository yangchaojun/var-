(function() {

    // var p1 = {
    //     name: 'react',
    //     active: false,
    //     $p1: document.querySelector 
    // }
    function Player(name, el) {
        this.name = name;
        this.active = false;
        this.$el = el;
        this.$point = this.$el.querySelector('.point');
    }

    Player.prototype.render = function() {
        this.$el.className = this.name;
    }

    Player.prototype.reset = function (name) {
        this.name = name;
        this.render();
    }

    Player.prototype.setActive = function (active) {
        this.active = !!active;
        this.$point.hidden = !this.active;
    }

    Player.random = function(exclude) {
        var players = ['vue','react','angular'];
        if (exclude) {
            players = players.filter(function (player) {
                 return player !== exclude 
            });
          }
        var indexP = Math.floor(Math.random() * players.length);
        return players[indexP];
    } 

    function Square(el) {
        this.$el = el;
        this.val = 0;
    }

    Square.prototype.set = function(name, val) {
        this.val = val;
        this.$el.classList.add(name);
    }

    Square.prototype.reset = function() {
        this.val = 0;
        this.$el.className = 'square';
    }

    function Game(el) {
        this.$el = el;

        this.state = 'init';
        this.steps = 0;

        this.p1 = new Player(Player.random(), document.querySelector('#p1'));
        this.p2 = new Player(Player.random(this.p1.name), document.querySelector('#p2'));

        this.p1.render();
        this.p2.render();

        this.$overLay = this.$el.querySelector('.overlay');
        this.$winner = this.$el.querySelector('.winner');
        this.$drawnGame = this.$el.querySelector('.drawnGame');

        this.$start = this.$el.querySelector('.btn.start');
        this.$start.addEventListener('click', this.onClickStart.bind(this));

        this.$reset = this.$el.querySelector('.btn.reset');
        this.$reset.disabled = true;
        this.$reset.addEventListener('click', this.onClickReset.bind(this));

        this.$diceP1 = this.$el.querySelector('#diceP1');
        this.$diceP2 = this.$el.querySelector('#diceP2');
        // console.log(diceP1.hidden === false);

        this.$diceP1.addEventListener('click',this.onClickDiceP1.bind(this));
        this.$diceP2.addEventListener('click',this.onClickDiceP2.bind(this));

        var onClickSquare = this.onClickSquare.bind(this);
        var $squares = [].slice.call(this.$el.querySelectorAll('.square'));
        $squares.forEach(function(square) {
            square.addEventListener('click', onClickSquare);
        });
        this.squares = $squares.map(function(square) {
            return new Square(square);
        });

    }

    Game.prototype.onClickDiceP1 = function(e) {
        this.p1.reset(Player.random(this.p1.name));
        this.$start.disabled = (this.p1.name === this.p2.name);
    }

    Game.prototype.onClickDiceP2 = function(e) {
        this.p2.reset(Player.random(this.p2.name));
        this.$start.disabled = (this.p1.name === this.p2.name);
    }

    Game.prototype.onClickStart = function(e) {
        if (this.p1.name === this.p2.name) return;
        this.start(); 
    }

    Game.prototype.setDiceHidden = function (hidden) {
        this.$diceP1.hidden = !!hidden;
        this.$diceP2.hidden = !!hidden;
    }

    Game.prototype.start = function() {
        this.state = 'start';
        this.setDiceHidden(true);
        this.p1.setActive(true);
        this.p2.setActive(false);
        this.$overLay.hidden = true;
        this.$start.hidden = true;
        this.$reset.disabled = false;
    }

    Game.prototype.reset = function() {
        this.setDiceHidden(false);
        this.resetSquares();
        this.p1.setActive(false);
        this.p2.setActive(false);
        this.$overLay.hidden = false;
        this.$start.hidden = false;
        this.$reset.disabled = true;
        this.$winner.hidden = true;
        this.$winner.className = 'winner';
        this.$drawnGame.hidden = true;
        this.steps = 0;
    }

    Game.prototype.resetSquares = function(square) {
        this.squares.forEach(function (square) {
            square.reset();
        });
    }


    Game.prototype.onClickReset = function(e) {
        this.reset();
    }


    Game.prototype.onClickSquare = function(e) {
        this.steps++;
        console.log(this.steps);
        if (this.isEnded()) return; 
        if (e.target.classList.length > 1) {
            this.steps--;
            return;
        }
        this.squares[e.target.dataset.index].set(this.activePlayer().name, this.p1.active ? 1 : -1);
        
        var winner = this.getWinner();
        if (winner) {
            this.showWinner(winner);
            return;
        }
        this.switchPlayer();
        if (this.steps >= 9) {
           this.showDrawnGame();
            return;
        }
    }

    Game.prototype.activePlayer = function() {
        return this.p1.active ? this.p1 : this.p2;
    }

    Game.prototype.switchPlayer = function () {
        this.p1.setActive(!this.p1.active)
        this.p2.setActive(!this.p2.active);
    };

    Game.prototype.calcWinValues = function() {
        var wins = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        var result = [];
        for (var i = 0; i < wins.length; i++) {
            var val = this.squares[wins[i][0]].val + this.squares[wins[i][1]].val + this.squares[wins[i][2]].val;
            result.push(val);
        }
        return result;
    }

    Game.prototype.isEnded = function() {
        return this.isAllSquareUsed() || this.getWinner();
    }

    Game.prototype.getWinner = function() {
        var values = this.calcWinValues();

        if (values.find(function(v) { return v === 3; })) {
            return this.p1;
        } else if (values.find(function(v) { return v === -3; })) {
            return this.p2;
        } else {
            return false;
        }
    }
    //找到square是否已经用完，用完了返回false
    Game.prototype.isAllSquareUsed = function() {
        return !this.squares.find(function(square) { return square.val ===0; });
    }

    Game.prototype.showWinner = function(winner) {
        this.$overLay.classList.add('minimize');
        this.$overLay.hidden = false;
        this.$winner.classList.add(winner.name);
        this.$winner.hidden = false;
        var This = this;
        setTimeout(function() {
          This.$overLay.classList.remove('minimize');
        }, 300);
    }

    Game.prototype.showDrawnGame = function() {
        this.$overLay.classList.add('minimize');
        this.$overLay.hidden = false;
        this.$drawnGame.hidden = false;
        var This = this;
        setTimeout(function() {
          This.$overLay.classList.remove('minimize');
        }, 300);
    }

    //当DOM树加载完触发
    document.addEventListener('DOMContentLoaded', function() {
        window.game = new Game(document.querySelector('.container'));
    })


})()