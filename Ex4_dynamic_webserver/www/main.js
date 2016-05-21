/*Defines the elements for the login screen */
var loginDiv = document.createElement('div');
var loginForm = document.createElement('form');
var userInput = document.createElement('input');
var passwordInput = document.createElement('input');
var submitInput = document.createElement('input');
var logoutMessage = document.createElement('p');

/*Defines the elements for the profile screen */
var profileScreen = document.createElement("div");
var profileTitle = document.createElement("p");
var profileLogout = document.createElement("button");
var profileName = document.createElement("p");
var profileHobbies = document.createElement("p");
var profileFunnyQuote = document.createElement("p");
var profileImg1 = document.createElement("img");
var profileImg2 = document.createElement("img");

/*Defines the elements for the calculator screen*/
var calculatorButton = document.createElement("button");
var calculatorScreen = document.createElement("div");
var newCalculatorButton = document.createElement("button");


/* Additional definitions for login screen */
loginForm.setAttribute('method', 'post');
userInput.id = 'userInput';
userInput.setAttribute('name', 'username');
userInput.setAttribute("placeholder", "Enter your username");
passwordInput.setAttribute('name', 'password');
passwordInput.setAttribute('placeholder', 'Enter your password');
passwordInput.id = "passwordInput";
submitInput.setAttribute('type', 'submit');
submitInput.setAttribute('value', 'Submit');
loginDiv.className =  'loginScreen';
loginForm.id = 'loginForm';
document.body.appendChild(loginDiv);
loginDiv.appendChild(logoutMessage);
loginDiv.appendChild(loginForm);
loginForm.appendChild(userInput);
loginForm.appendChild(passwordInput);
loginForm.appendChild(submitInput);
loginForm.setAttribute("onsubmit", "return false");
submitInput.id = 'submitButton';
logoutMessage.id = 'logoutMessage';
logoutMessage.textContent = "You have logged out successfully!";
logoutMessage.style.visibility =  'hidden'; 

/*Additional definitions for profile screen */
profileScreen.id = "profileScreen";
profileScreen.style.display = "none";
document.body.appendChild(profileScreen);
document.body.appendChild(calculatorScreen);
profileTitle.id = "profileTitle";
profileTitle.textContent = "My personal profile";
profileName.className = "profileDetails";
profileName.textContent = "My name is Era Choshen";
profileHobbies.className = "profileDetails";
profileHobbies.textContent = "I like to learn languages, code, and chill out whenever I'm not building SPA's";
profileFunnyQuote.className = "profileDetails";
profileFunnyQuote.textContent = "Funny Quote: 'If you haven't got anything nice to say about anybody, come sit next to me.' - Alice Longworth";
profileImg1.className = "profileImages";
profileImg1.setAttribute("src", "funny-1.png");
profileImg1.id = "img1";
profileImg2.className = "profileImages";
profileImg2.setAttribute("src", "funny-2.png");
profileImg2.id = "img2";
profileImg2.style.display = "none";
profileLogout.id = "profileLogout";
profileLogout.textContent = "Logout";
profileScreen.appendChild(profileLogout);
profileScreen.appendChild(calculatorButton);
profileScreen.appendChild(profileTitle);
profileScreen.appendChild(profileName);
profileScreen.appendChild(profileHobbies);
profileScreen.appendChild(profileFunnyQuote);
profileScreen.appendChild(profileImg1);
profileScreen.appendChild(profileImg2);

/*Additional definitions for calculator screen */
calculatorButton.id = "calculatorButton";
calculatorButton.textContent = "Calculator";
calculatorScreen.style.display = "none";
newCalculatorButton.id = "newCalculatorButton";
newCalculatorButton.textContent = "New Calculator";
calculatorScreen.id = "calculatorScreen";

/* Event listeners for the login screen */
submitInput.addEventListener("click",  function(){
	if (userInput.value !="admin" || passwordInput.value != "admin")
	{
		alert('Wrong password! Please try again.');
		logoutMessage.style.visibility = "hidden";
	}
	else
	{
		loginDiv.style.display = "none";
		profileScreen.style.display = "block";
	}
	loginForm.reset();
});

/* Event listeners for the profile screen */
profileImg1.addEventListener("mouseover", function(event)
{
	this.style.display = "none";
	profileImg2.style.display = "block";
}
)

profileImg2.addEventListener("mouseover", function()
{
	this.style.display = "none";
	profileImg1.style.display = "block";
}
)

profileLogout.addEventListener("click",  function(){
	profileScreen.style.display = "none";
	loginDiv.style.display = "block";
	logoutMessage.style.visibility = "visible";
	profileImg2.style.display = "none";
	profileImg1.style.display = "block";
});

/* Event listeners for the calculator screen */
calculatorButton.addEventListener("click",  function(){
	profileScreen.style.display = "none";
	calculatorScreen.style.display = "block";
});

calculatorScreen.appendChild(newCalculatorButton);
/* The calculator constructor */
function Calculator(){
	var keys;
	this.calculatorBackground = document.createElement("div");
	this.calculatorBackground.className = "calculatorBackground";
	this.clearButton = document.createElement('button');
	this.clearButton.className = "clearButton";
	this.clearButton.textContent = "C";
	this.calculatorDisplay = document.createElement("div");
	this.calculatorDisplay.className = "calculatorDisplay";
	this.calculatorBackground.appendChild(this.clearButton);
	this.calculatorBackground.appendChild(this.calculatorDisplay);


	for (i = 9; i >= 0; i--)
	{
		var currentButton = document.createElement("button");
		currentButton.className =  "keys";
		currentButton.textContent = i;
		currentButton.value = i.toString();
		this.calculatorBackground.appendChild(currentButton);
	}
	
	
				/*Creates equals Operator*/
	this.equalsOperator = document.createElement("button");
	this.equalsOperator.className = "equality";
	this.equalsOperator.value =  "=";
	this.equalsOperator.textContent = "=";
	this.calculatorBackground.appendChild(this.equalsOperator);
	this.calculatorBackground.appendChild(this.equalsOperator);
			/* Creates multiplication Operator*/
	this.multiplicationOperator = document.createElement("button");
	this.multiplicationOperator.className = "keys keysOperator";
	this.multiplicationOperator.id = "multiplicationOperator";
	this.multiplicationOperator.value =  "*";
	this.multiplicationOperator.textContent = "X";
	this.calculatorBackground.	appendChild(this.multiplicationOperator);

	
	
			/* Creates Addition Operator*/
	this.additionOperator = document.createElement("button");
	this.additionOperator.className = "keys keysOperator";
	this.additionOperator.value =  "+";
	this.additionOperator.id = "additionOperator";
	this.additionOperator.textContent = "+";
	this.calculatorBackground.appendChild(this.additionOperator);
		/* Creates subtraction Operator*/
	this.subtractionOperator = document.createElement("button");
	this.subtractionOperator.className = "keys keysOperator";
	this.subtractionOperator.value =  "-";
	this.subtractionOperator.id = "subtractionOperator";
	this.subtractionOperator.textContent = "-";
	this.calculatorBackground.appendChild(this.subtractionOperator);
	
			/* Creates subtraction Operator*/
	this.divisionOperator = document.createElement("button");
	this.divisionOperator.className = "keys keysOperator";
	this.divisionOperator.value =  "/";
	this.divisionOperator.id = "divisionOperator";
	this.divisionOperator.textContent = "/";
	this.calculatorBackground.appendChild(this.divisionOperator);
	keys = this.calculatorBackground.querySelectorAll('.keys');
	for( i =0; i < keys.length; i++)
	{
		keys[i].addEventListener('click', function(event)
		{
			var elements = this.parentElement.querySelector(".calculatorDisplay");
			if (this.className === "keys keysOperator")
			{
				/*Checks whether operator has already been called*/
				if (elements.textContent.length === 0)
				{
					return;
				}
				if (isNaN(parseInt(elements.textContent.slice(-1))))
				{
					/*Replaces operator if the two aren't equal */
					if (elements.textContent.slice(-1) !== this.value)
					{
						elements.textContent = elements.textContent.substr(0, elements.textContent.length -1) + this.value;
					}
					return;
				}
			}
			elements.textContent += this.value;
		}
		, false);
	}
	this.clearButton.addEventListener('click', function(event)
	{
		var elements = this.parentElement.querySelector(".calculatorDisplay");
		elements.textContent = "";
	}
	)
	this.equalsOperator.addEventListener('click', function(event)
	{
		var elements = this.parentElement.querySelector(".calculatorDisplay");
		if (isNaN(parseInt(elements.textContent.slice(-1))))
		{
			elements.textContent = elements.textContent.substr(0, elements.textContent.length -1) ;
		}
		var total = eval(elements.textContent);
		elements.textContent = total;
	}
	)
}
newCalculatorButton.addEventListener('click', function(event)
{
	var currentCalc = new Calculator();
	this.parentElement.appendChild(currentCalc.calculatorBackground);
}
)