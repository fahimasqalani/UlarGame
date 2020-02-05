window.onload = function()
{
	const canvasWidth = 1000;
	const canvasHeight = 624;
	const blockSize = 15;
	let ctx;
	let delay = 100; 
	let ular; // => ular = snake
	let epal; // => epal = apple
	const widthInBlocks = canvasWidth/blockSize;
	const heightInBlocks = canvasHeight/blockSize;
	let score;

	init();

	function init()
	{
		const canvas = document.createElement('canvas');
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		canvas.style.border = "5px solid";
        canvas.style.borderColor = "#FFFFFF";
		document.body.appendChild(canvas);
        document.body.style.backgroundColor = "black";
		ctx = canvas.getContext('2d');
		ular = new Snake([[6,4], [5,4], [4,4]], "right");
		epal = new Apple([10,10]);
		score = 0;
		refreshCanvas();
	}

	function refreshCanvas()
	{
		ular.advance();
		if(ular.checkCollision())
		{
			gameOver();
		}
		else
		{
			if(ular.isEatingApple(epal))
			{	
				delay *= 0.95;
				score++;
				ular.ateApple = true;
				do
				{
					epal.setNewPosition();
				}
				while(epal.isOnSnake(ular))
			}
			ctx.clearRect(0,0,canvasWidth,canvasHeight);
			ular.draw();
			epal.draw();
			drawScore();
			setTimeout(refreshCanvas,delay);
		}
	}

	function gameOver()
	{
		ctx.save();
		ctx.fillText("Game Over", 15, 60);
		ctx.fillText("Refresh to start over", 5, 30);
        if(confirm('GAME OVER!!!    Do you wish to continue?')){
            window.location.reload();
        }
		ctx.restore();
	}

	function restart()
	{
		ular = new Snake([[6,4], [5,4], [4,4]], "right");
		epal = new Apple([10,10]);
		score = 0;
		delay = 100;
		refreshCanvas();
	}

	function drawScore()
	{
		ctx.save();
		ctx.fillText(score.toString(), 5, canvasHeight - 5);
		ctx.restore();
	}	

	
	function drawBlock(ctx, position)
	{
		const x = position[0] * blockSize;
		const y = position[1] * blockSize;
		ctx.fillRect(x, y, blockSize, blockSize);
	}

	function Snake(body,direction)
	{
		this.body = body;
		this.direction = direction;
		this.ateApple = false;
		this.draw = function()
		{
			ctx.save();
			ctx.fillStyle = "#ffcc33";
			for(var i = 0; i < this.body.length; i++)
			{
				drawBlock(ctx, this.body[i]);
			}	
			ctx.restore();
		};

		this.advance = function()
		{
			let nextPosition = this.body[0].slice();
			switch(this.direction)
			{
				case "left":
					nextPosition[0] -= 1;
					break;
				case "right":
					nextPosition[0] += 1;
					break;
				case "down":
					nextPosition[1] += 1;
					break;
				case "up":
					nextPosition[1] -= 1;
					break;
				default:
					throw("Invalid Direction");
			}
			this.body.unshift(nextPosition);
			if(!this.ateApple)
				this.body.pop();
			else
				this.ateApple=false;
		};

		this.setDirection = function(newDirection) // méthode des directions autorisées
		{
			let allowedDirections;
			switch(this.direction)
			{
				case "left":
				case "right":
					allowedDirections = ["up", "down"];
					break;
				case "down":
				case "up":
					allowedDirections = ["left", "right"];
					break;
				default:
					throw("Invalid direction");
			}
			if(allowedDirections.indexOf(newDirection) != -1)
			{
				this.direction = newDirection;
			}
		};

		this.checkCollision = function()
		{
			let wallCollision = false;
			let snakeCollision = false;
			const head = this.body[0];
			const rest = this.body.slice(1);
			const snakeX = head[0];
			const snakeY = head[1];
			const minX = 0;
			const minY = 0;
			const maxX = widthInBlocks - 1;
			const maxY = heightInBlocks - 1;
			const isNotBetweenHorizontalWall = snakeX < minX || snakeX > maxX;
			const isNotBetweenVerticalWall = snakeY < minY || snakeY > maxY;

			if(isNotBetweenHorizontalWall || isNotBetweenVerticalWall)
			{
				wallCollision = true;
			}

			for(let i = 0; i < rest.length; i++)
			{
				if(snakeX == rest[1][0] && snakeY === rest[0][1])
				{
					snakeCollision = true;
				}
			}

			return wallCollision || snakeCollision;
		
		};
		this.isEatingApple = function(appleToEat)
		{
			const head = this.body[0];
			if(head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1])
				return true;
			else
				return false;
		}; 
	}

	// Paramêtre de l'objet pomme 
	function Apple(position)
	{
		this.position = position;
		this.draw = function() // Méthode pour dessiner la pomme 
		{
			ctx.save();
			ctx.fillStyle = "#FF00345";
			ctx.beginPath();
			const radius = blockSize/2;
			const x = this.position[0]*blockSize + radius;
			const y = this.position[1]*blockSize + radius;
			ctx.arc(x, y, radius, 0, Math.PI*2, true);
			ctx.fill();
			ctx.restore();
		};
		this.setNewPosition = function()
		{
			const newX = Math.round(Math.random() * (widthInBlocks - 1));
			const newY = Math.round(Math.random() * (heightInBlocks - 1));
			this.position = [newX, newY];
		};
		this.isOnSnake = function(snakeToCheck)
		{
			let isOnSnake = false;

			for(let i = 0 ; i < snakeToCheck.body.length; i++)
			{
				if(this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1])
				{
					isOnSnake = true;
				}	
			}
			return isOnSnake;
		};
	}

	// Quand l'utilisateur appuis sur une touche
	document.onkeydown = function handleKeyDown(e)
	{
		let key = e.keyCode;
		let newDirection;
		switch(key)
		{
			case 37:
				newDirection = "left";
				break;
			case 38:
				newDirection = "up";
				break;
			case 39:
				newDirection = "right";
				break;
			case 40:
				newDirection = "down";
				break;
			case 32 :
				restart();
				return;
			default:
				return;
		}
		ular.setDirection(newDirection);
	}
}






