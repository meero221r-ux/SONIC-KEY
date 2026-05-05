const tasks = {
    'A1': [
        { 
            text: "The cat sat on the mat. It was a sunny day.", 
            translation: "جلس القط على السجادة. كان يوماً مشمساً.",
            quiz: { question: "Where did the cat sit?", options: ["On the car", "On the mat", "In the garden"], answer: "On the mat" }
        }
    ],
    'B2': [
        { 
            text: "Artificial Intelligence is revolutionizing how we interact with technology daily.", 
            translation: "الذكاء الاصطناعي يحدث ثورة في كيفية تفاعلنا مع التكنولوجيا يومياً.",
            quiz: { question: "What is AI revolutionizing?", options: ["Cooking", "Technology", "Sports"], answer: "Technology" }
        }
    ],
    'C2': [
        { 
            text: "The philosophical implications of quantum mechanics challenge our perception of reality.", 
            translation: "الآثار الفلسفية لميكانيكا الكم تتحدى إدراكنا للواقع.",
            quiz: { question: "What does quantum mechanics challenge?", options: ["History", "Reality", "Math"], answer: "Reality" }
        }
    ]
};

let currentTask;
let currentLevel = 'A1';
let mistakes = 0;
let timerInterval;
let startTime;

const textDisplay = document.getElementById('text-display');
const translationDisplay = document.getElementById('translation-display');
const userInput = document.getElementById('user-input');
const timerDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');
const speedRateInput = document.getElementById('speedRate');

function setLevel(lvl) {
    currentLevel = lvl;
    document.getElementById('level-selector').style.display = 'none';
    document.getElementById('exercise-area').style.display = 'block';
    startExercise();
}

function resetToLevels() {
    document.getElementById('level-selector').style.display = 'block';
    document.getElementById('exercise-area').style.display = 'none';
    clearInterval(timerInterval);
    window.speechSynthesis.cancel();
}

function startExercise() {
    const levelTasks = tasks[currentLevel];
    currentTask = levelTasks[Math.floor(Math.random() * levelTasks.length)];
    mistakes = 0;
    
    textDisplay.innerHTML = "";
    currentTask.text.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.innerText = char;
        span.className = 'letter' + (i === 0 ? ' current' : '');
        textDisplay.appendChild(span);
    });

    translationDisplay.innerText = currentTask.translation;
    userInput.value = "";
    userInput.disabled = false;
    messageDisplay.innerText = "";
    
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(currentTask.text);
    speech.lang = 'en-US';
    speech.rate = speedRateInput ? parseFloat(speedRateInput.value) : 0.8;
    window.speechSynthesis.speak(speech);

    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerDisplay.innerText = ((Date.now() - startTime) / 1000).toFixed(2);
    }, 100);
    userInput.focus();
}

userInput.addEventListener('input', () => {
    const arrayQuote = textDisplay.querySelectorAll('.letter');
    const arrayValue = userInput.value.split('');
    let isAllCorrect = true;
    messageDisplay.innerText = "";

    arrayQuote.forEach((span, i) => {
        const typed = arrayValue[i];
        const original = span.innerText;
        span.classList.remove('current', 'correct', 'incorrect');

        if (typed == null) {
            if (i === arrayValue.length) span.classList.add('current');
            isAllCorrect = false;
        } else if (typed === original) {
            span.classList.add('correct');
        } else {
            span.classList.add('incorrect');
            isAllCorrect = false;
            if (i === arrayValue.length - 1) {
                mistakes++;
                span.classList.add('current');
                if (typed.toLowerCase() === original.toLowerCase()) {
                    messageDisplay.innerText = "⚠️ Watch out! Check Capital/Small letters";messageDisplay.style.color = "#e2b714";
                } else {
                    messageDisplay.innerText = "❌ Wrong letter!";
                    messageDisplay.style.color = "#ca4754";
                }
            }
        }
    });

    if (isAllCorrect && arrayValue.length === arrayQuote.length) {
        clearInterval(timerInterval);
        const timeInMin = (Date.now() - startTime) / 60000;
        const wpm = ((currentTask.text.length / 5) / timeInMin).toFixed(0);
        const accuracy = Math.max(0, ((currentTask.text.length - mistakes) / currentTask.text.length) * 100).toFixed(0);
        
        messageDisplay.innerHTML = "✅ Clear! Speed: " + wpm + " WPM | Accuracy: " + accuracy + "%";
        messageDisplay.style.color = "#4caf50";
        userInput.disabled = true;
        
        setTimeout(showQuiz, 1000);
    }
});

function showQuiz() {
    const q = currentTask.quiz;
    if(!q) return;

    let quizHTML = `<div class="quiz-box">
        <h3>Quick Quiz: ${q.question}</h3>
        <div class="quiz-options">`;
    
    q.options.forEach(opt => {
        quizHTML += `<button onclick="checkQuizAnswer('${opt}')" class="quiz-btn">${opt}</button>`;
    });
    
    quizHTML += `</div></div>`;
    messageDisplay.innerHTML += quizHTML;
}

function checkQuizAnswer(selected) {
    if (selected === currentTask.quiz.answer) {
        messageDisplay.innerHTML = `<h2 style="color:#4caf50;">🎉 Correct!</h2>`;
        setTimeout(startExercise, 2000);
    } else {
        alert("Try again!");
    }
}