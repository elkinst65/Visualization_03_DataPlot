/*
**	MSDS 6391 - Project 3 - P5.js
**	Ben Brock, Austin Kelly, Tom Elkins
**
**	This visualization is a simple game. For each level, a certain number of balls appear
**	on the screen moving in random directions and speeds.  The goal for the user is to capture
**	the specified number of balls for that level.  The difficulty increases as the levels
**	progress.  The user left-clicks on the screen where he/she wishes to plant the trapper.
**	The trapper expands and any balls that touch it are stuck - and they expand and trap others.
**	The strategy is to cause a chain reaction to capture as many of the balls as possible.
*/

var nBalls;				//	The number of balls in the level
var Balls = [];			//	Array of Ball objects
var Trapper;			//	Ball trapper	
var forScore = false;	//	Flags when the trapping for the level begins
var numTrapped = 0;		//	The number of balls trapped
var currentLevel = 0;	//	Current game level
var totalScore = 0;		//	Total number of balls trapped
var numRequired = [1,2,3,5,7,10,15,21,27,33,44,50];		//	Minimum number of balls required to complete the level.
var gameOver = false;
var numInflated = 0;	//	Number of balls that are inflated
var levelStart;			//	Flag to indicate the start of a new level

function setup(){
	/*
	**	This gets executed once at the start of the session
	*/
	
	/*	Create the game board	*/
	var board = createCanvas(1000, 800);
	board.parent("board");
	
	/*	Create the Trapper object and set it off-screen so it isn't rendered	*/
	Trapper = new Ball(-9999, -9999, 0.0, 0.0, color(0,0,0));
	Trapper.visible = false;

	  /*	Set level 1		*/
	configureLevel(currentLevel);
}

function configureLevel(nLevel) {
	/*
	**	This gets called at the start of each new level
	*/
	
	/*	Hide the trapper	*/
	Trapper.visible = false;
	Trapper.x = -9999;
	forScore = false;
	
	/*	Set the number of balls for the level	*/
	nBalls = (nLevel + 1) * 5;
	
	/*	Reset the game triggers */
	numTrapped = 0;
	levelStart = true;

	/*	Create the balls and set them free	*/
	for (iBall=0; iBall < nBalls; iBall++) {
		Balls[iBall] = new Ball(random(width), random(height), random(6)-3, random(6)-3, color(random(128)+128,random(128)+128,random(128)+128),200);
		Balls[iBall].id = iBall;
	}
}

function evaluateLevel() {
	/*
	**	This gets called when there are no more inflated balls
	*/
	
	/*	If the user trapped the required number of balls, the level is advanced */
	if (numTrapped >= numRequired[currentLevel]) {
		alert("Excellent: You captured " + numTrapped + "!");
		
		/*	Advance the level	*/
		currentLevel++;
		
		/*	Update the total score	*/
		totalScore += numTrapped;

		/*	There's currently only 12 levels	*/
		if (currentLevel >= 12) {
			alert("Game Over\nYour score: " + totalScore);
		} else {
			/*	Set up for the next level	*/
			configureLevel(currentLevel);
		}
	} else {
		/* Try again? */
		if (confirm("You didn't capture the required amount.  Would you like to try again?")) {
			configureLevel(currentLevel);
		} else {
			alert("Game Over\nYour score: " + totalScore);
		}
	}
}

function mousePressed() {
	/*
	**	User clicked on the screen, so release the Trapper
	*/
	if (!forScore) {
		Trapper = new Ball(mouseX, mouseY, 0, 0, color(255,255,255));
		Trapper.id = -9999;
		Trapper.trap = true;
		forScore = true;
	}
}

function draw(){
	/*
	**	This gets called 60 times per second
	*/
	if (!gameOver) {
		
		/*	Draw a black background	*/
		background(0);
			
			
		/*	Let the user know what the requirements are for this level */
		if (levelStart) {
			document.getElementById("score").innerHTML = "Level: " + (currentLevel + 1) + ";  Available: " + nBalls + "; Required: " + numRequired[currentLevel] + ";  Trapped: <span id='spnTrapped'>0</span>";
			levelStart = false;
		}
		numInflated = 0;
		numTrapped = 0;

		/*	Draw the trapper	*/
		Trapper.draw();
		if (Trapper.trap) { numInflated += 1;}

		/*	Draw the balls	*/
		for (iBall=0; iBall < nBalls; iBall++) {
			Balls[iBall].draw();
			if (Balls[iBall].trap) { numInflated += 1;}
			if (Balls[iBall].trapped) {numTrapped += 1;}
		}
		
		document.getElementById("spnTrapped").innerHTML = numTrapped;
		
		/*	If there are no more inflated balls, then the level is complete */
		if (forScore && !numInflated) {
			evaluateLevel();
		}
	}
	
}

function Ball(dX, dY, dVX, dVY, oColor) {
	/*
	**	Constructor for the Ball object
	*/
	this.id = 0;
	this.x = dX;
	this.y = dY;
	this.r = 20.0;
	this.maxR = 100.0;
	this.vx = dVX;
	this.vy = dVY;
	this.c = oColor;
	this.visible = true;
	this.trap = false;
	this.sticky = false;
	this.inflated = false;
	this.stickTime = 0;
	this.trapped = false;
}

Ball.prototype.move = function() {
	/*
	**	Move the ball based on the velocity vector, and bounce off the viewport edges
	*/
	
	/*	Don't bother moving an invisible ball */
	if (this.visible) {
		
		/*	Move along the velocity vector */
		this.x += this.vx;
		this.y += this.vy;
		
		/*	Bounce off the walls */
		if (this.x + this.r/2 > width) {this.x = width - this.r/2; this.vx *= -1;}
		if (this.x - this.r/2 < 0) {this.x = this.r/2; this.vx *= -1;}
		if (this.y - this.r/2 < 0) {this.y = this.r/2; this.vy *= -1;}
		if (this.y + this.r/2 > height) {this.y = height - this.r/2; this.vy *= -1;}
	}
}

Ball.prototype.draw = function(){
	/*
	**	Render the ball
	*/
	
	/*	Don't draw an invisible ball */
	if (this.visible) {
		
		/*	Simple ellipse */
		if (this.sticky) {
			strokeWeight(4);
			stroke(0,255,0);
		} else {
			noStroke();
		}
		
		fill(this.c);
		ellipse(this.x, this.y, this.r, this.r);
		
		/*	Now, see if this ball is involved in the trap or not */
		this.update();
	}
}

Ball.prototype.update = function() {
	/*	Only check on trapped balls */
	if (this.trap) {
		/*	If the ball hasn't inflated fully, inflate it */
		if (!this.inflated) {
			this.inflate();
		} else if (this.sticky) {
			/*	Let this ball now capture anything that touches it */
			this.capture();
		} else {
			/*	Time is up, so deflate */
			this.deflate();
		}
	} else {
		/*	This ball is not trapped, so move it along its velocity vector */
		this.move();
	}
}

Ball.prototype.capture = function() {
	var Target;
	
	/*	This mode is valid only if the ball is sticky */
	if (this.sticky) {
		
		/*	Loop through the balls */
		for (piBall=0; piBall < nBalls; piBall++) {
			
			/*	Call the current one "Target" - makes typing easier */
			Target = Balls[piBall];
			
			/*	Don't collide with yourself */
			if (this.id != Target.id) {
				
				/*	Don't trap an already trapped ball */
				if (!Target.trapped) {
					
					/*	If the two balls are touching, then trap it */
					/*	Simple collision detection - the Euclidean distance between the center of the balls must be 
						less than or equal to the sum of the radii of the two balls
					*/
					if (Math.sqrt((this.x - Target.x)**2 + (this.y - Target.y)**2) <= ((this.r + Target.r) / 2)) {
						
						/*	Mark the ball as trapped and stop its movement*/
						Target.trap = true;
						Target.trapped = true;
						Target.vx = 0;
						Target.vy = 0;
					}
				}
			}
		}
		
		/*	Stickiness lasts only so long - decrement the counter */
		this.stickTime -= 1;
		
		if (this.stickTime <= 0) {
			/*	Stickiness time is over, so turn it off */
			this.sticky = false;
		}
	}
}

Ball.prototype.inflate = function(){
	
	/*	Inflate the ball to its maximum allowed size */
	if (this.r < this.maxR) {
		this.r += .6;
	} else {
		/*	Stop inflating and turn on stickiness */
		this.inflated = true;
		this.sticky = true;
		this.stickTime = 130;
	}
}

Ball.prototype.deflate = function() {
	/*
	**	When the timer runs out, the ball will deflate to zero radius (disappear)
	*/
	if (this.r > 0) {
		this.r -= 0.8;
	} else {
		/*	Hide the ball	*/
		this.inflated = false;
		this.visible = false;
		this.trap = false;
	}
}