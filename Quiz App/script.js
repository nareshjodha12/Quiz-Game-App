const container = document.querySelector('.container');
const questionBox = document.querySelector('.question');
const choicesBox = document.querySelector('.choices');
const nextBtn = document.querySelector('.nextBtn');
const scoreCard = document.querySelector('.scoreCard');
const alert = document.querySelector('.alert');
const startBtn = document.querySelector('.startBtn');
const timer = document.querySelector('.timer');
const progressWrap = document.querySelector('.progressWrap');
const progressFill = document.querySelector('.progressFill');
const progressCompleted = document.querySelector('.progressLabel .completed');
const progressTotal = document.querySelector('.progressLabel .total');
const themeToggle = document.querySelector('.themeToggle');
const themeLabel = document.querySelector('.themeLabel');
const toolbar = document.querySelector('.toolbar');
// difficultySelect removed from DOM per user request
const resultsDetail = document.querySelector('.resultsDetail');
const badgesWrap = document.querySelector('.badges');
const leaderboardEl = document.querySelector('.leaderboard');
const leaderList = document.querySelector('.leaderList');
const clearLeaderboardBtn = document.querySelector('.clearLeaderboard');

// Apply persisted theme/palette
const applyTheme = () => {
    const theme = localStorage.getItem('quiz_theme');
    const palette = localStorage.getItem('quiz_palette');
    if (theme === 'light') document.body.setAttribute('data-theme', 'light');
    else document.body.removeAttribute('data-theme');
    if (palette) document.body.setAttribute('data-palette', palette);
    else document.body.removeAttribute('data-palette');
    if (themeToggle) themeToggle.setAttribute('aria-pressed', theme === 'light' ? 'true' : 'false');
    const iconEl = document.querySelector('.themeIcon');
    const labelEl = document.querySelector('.themeLabel');
    if (iconEl) iconEl.textContent = (theme === 'light') ? '☀️' : '🌙';
    if (labelEl) labelEl.textContent = (theme === 'light') ? 'Light' : 'Dark';
}
applyTheme();

if (themeToggle) themeToggle.addEventListener('click', ()=>{
    const isLight = document.body.getAttribute('data-theme') === 'light';
    if (isLight) {
        document.body.removeAttribute('data-theme');
        localStorage.removeItem('quiz_theme');
        themeToggle.setAttribute('aria-pressed', 'false');
    } else {
        document.body.setAttribute('data-theme', 'light');
        localStorage.setItem('quiz_theme', 'light');
        themeToggle.setAttribute('aria-pressed', 'true');
    }
    // update visual icon and sr-only label
    const iconEl2 = document.querySelector('.themeIcon');
    const labelEl2 = document.querySelector('.themeLabel');
    if (iconEl2) iconEl2.textContent = (document.body.getAttribute('data-theme') === 'light') ? '☀️' : '🌙';
    if (labelEl2) labelEl2.textContent = (document.body.getAttribute('data-theme') === 'light') ? 'Light' : 'Dark';
    // update title for sighted users
    themeToggle.title = (document.body.getAttribute('data-theme') === 'light') ? 'Switch to Dark mode' : 'Switch to Light mode';
});

// themeSelect removed; palette can be adjusted via code or reintroduced later if needed


// Make an array of objects that stores question, choices of question and answer
const quiz = [
    {
        question: "Q. Which of the following is not a CSS box model property?",
        choices: ["margin", "padding", "border-radius", "border-collapse"],
        answer: "border-collapse",
        explanation: "border-collapse is a table property; it doesn't belong to the CSS box model which includes margin, border, padding, and content."
    },
     {
    question: "Q. What will be the output of typeof null in JavaScript?",
    choices: ["null", "undefined", "object", "number"],
    answer: "object"
  },
     {
    question: "Q. What is the purpose of the array method map()?",
    choices: [
      "To loop through an array and modify it in place.",
      "To create a new array with the results of calling a function on each element.",
      "To remove elements from an array.",
      "To sort an array alphabetically."
    ],
    answer: "To create a new array with the results of calling a function on each element."
  },
  {
    question: "Q. Which operator is used to check both value and type equality in JavaScript?",
    choices: ["==", "===", "!=", "="],
        answer: "===",
        explanation: "The triple-equals operator (===) checks both value and type equality."
  },
    {
        question: "Q. Which of the following is not a valid way to declare a function in JavaScript?",
        choices: ["function myFunction() {}", " let myFunction = function() {};", "myFunction: function() {}", "const myFunction = () => {};"],
        answer: "myFunction: function() {}"
    },
    {
        question: "Q. Which of the following is not a JavaScript data type?",
        choices: ["string", "boolean", "object", "float"],
        answer: "float"
    },
    {
    question: "Q. What will be the output of '2' + 2 in JavaScript?",
    choices: ["4", "'22'", "NaN", "Error"],
    answer: "'22'"
  },
    {
        question: "Q. What is the purpose of the this keyword in JavaScript?",
        choices: ["It refers to the current function.", "It refers to the current object.", "It refers to the parent object.", " It is used for comments."],
        answer: "It refers to the current object."
    },
    {
    question: "Q. Which of the following is used to declare a variable in JavaScript?",
    choices: ["var", "let", "const", "All of the above"],
    answer: "All of the above"
  },
   {
    question: "Q. Which method is used to convert a JSON string into a JavaScript object?",
    choices: ["JSON.parse()", "JSON.stringify()", "JSON.convert()", "JSON.objectify()"],
        answer: "JSON.parse()",
        explanation: "JSON.parse converts a JSON-formatted string into the equivalent JavaScript object."
  }
];

// Making Variables
let currentQuestionIndex = 0;
let score = 0;
let quizOver = false;
let timeLeft = 15;
let timerID = null;
let difficulty = 'medium';
let answersRecord = []; // track user's answers for review
let historyKey = 'quiz_history_v1';
let leaderboardKey = 'quiz_leaderboard_v1';
let isAnimating = false;

// Simple sound effects using WebAudio
const audioCtx = (window.AudioContext || window.webkitAudioContext) ? new (window.AudioContext || window.webkitAudioContext)() : null;
const playTone = (freq, duration=150, type='sine') => {
    if(!audioCtx) return;
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(audioCtx.destination);
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.01);
    o.start();
    setTimeout(()=>{ g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.02); o.stop(); }, duration);
}

const playCorrect = () => playTone(880,120,'sine');
const playWrong = () => { playTone(220,200,'square'); playTone(130,200,'sawtooth'); };

// Arrow Function to Show Questions
const showQuestions = () => {
    const questionDetails = quiz[currentQuestionIndex];
    // animate out then in
    questionBox.classList.remove('fade-enter-active');
    questionBox.classList.add('fade-exit-active');
    setTimeout(()=>{
        questionBox.classList.remove('fade-exit-active');
        questionBox.classList.add('fade-enter');
        questionBox.textContent = questionDetails.question;
        // reflow to kick animation
        void questionBox.offsetWidth;
        questionBox.classList.add('fade-enter-active');
        questionBox.classList.remove('fade-enter');
    }, 160);

    choicesBox.textContent = "";
    // Ensure progress region accessible
    if(progressFill) progressFill.setAttribute('aria-valuemin','0');
    if(progressFill) progressFill.setAttribute('aria-valuemax', quiz.length);

    for (let i = 0; i < questionDetails.choices.length; i++) {
        const currentChoice = questionDetails.choices[i];
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('choice');
        btn.textContent = currentChoice;
        btn.setAttribute('role','radio');
        btn.setAttribute('aria-checked','false');
        btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
        choicesBox.appendChild(btn);

        // click/keyboard behavior
        const selectChoice = () => {
            const all = choicesBox.querySelectorAll('.choice');
            all.forEach(c=>{ c.classList.remove('selected'); c.setAttribute('aria-checked','false'); c.setAttribute('tabindex','-1'); });
            btn.classList.add('selected');
            btn.setAttribute('aria-checked','true');
            btn.setAttribute('tabindex','0');
            btn.focus();
        };

        btn.addEventListener('click', selectChoice);
        btn.addEventListener('keydown', (ev)=>{
            const all = Array.from(choicesBox.querySelectorAll('.choice'));
            const idx = all.indexOf(btn);
            if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); selectChoice(); }
            else if(ev.key === 'ArrowDown' || ev.key === 'ArrowRight'){
                ev.preventDefault(); const next = all[(idx+1) % all.length]; next.focus();
            } else if(ev.key === 'ArrowUp' || ev.key === 'ArrowLeft'){
                ev.preventDefault(); const prev = all[(idx-1 + all.length) % all.length]; prev.focus();
            }
        });
    }

    if(currentQuestionIndex < quiz.length){
        startTimer();
    }
    // update progress UI
    const completed = currentQuestionIndex; // completed before answering current
    const total = quiz.length;
    if (progressCompleted && progressTotal && progressFill) {
        progressCompleted.textContent = completed;
        progressTotal.textContent = total;
        const pct = Math.round((completed / total) * 100);
        progressFill.style.width = pct + '%';
        progressFill.setAttribute('aria-valuenow', completed);
    }
}

// Function to check answers
const checkAnswer = () => {
    const selectedChoice = document.querySelector('.choice.selected');
    const q = quiz[currentQuestionIndex];
    const given = selectedChoice ? selectedChoice.textContent : null;
    let correct = false;
    if (given === q.answer) { displayAlert("Correct Answer!"); score++; correct = true; playCorrect(); }
    else { displayAlert(`Wrong Answer! ${q.answer} is the Correct Answer`); playWrong(); }
    answersRecord.push({ question: q.question, given, correct, correctAnswer: q.answer, explanation: q.explanation || '' });
    timeLeft = 15;
    currentQuestionIndex++;
    // update progress after answering (so completed increases)
    if (progressCompleted && progressTotal && progressFill) {
        const completed = Math.min(currentQuestionIndex, quiz.length);
        const total = quiz.length;
        progressCompleted.textContent = completed;
        progressTotal.textContent = total;
        const pct = Math.round((completed / total) * 100);
        progressFill.style.width = pct + '%';
    }
    if (currentQuestionIndex < quiz.length) {
        showQuestions();
    }
    else {
        stopTimer();
        // animate to results
        questionBox.classList.add('fade-exit-active');
        setTimeout(()=>{
            showScore();
            questionBox.classList.remove('fade-exit-active');
            questionBox.classList.add('fade-enter-active');
        }, 220);
    }
}

// Function to show score
const showScore = () => {
    questionBox.textContent = "";
    choicesBox.textContent = "";
    scoreCard.textContent = `You Scored ${score} out of ${quiz.length}!`;
    displayAlert("You have completed this quiz!");
    nextBtn.textContent = "Play Again";
    quizOver = true;
    timer.style.display = "none";

    // detailed results
    if (resultsDetail) {
        resultsDetail.classList.remove('hidden');
        resultsDetail.innerHTML = '<strong>Review</strong><ol>' + answersRecord.map(a=>`<li><strong>${a.question}</strong><div>Answer: ${a.given || '<em>no answer</em>'} — <strong>${a.correct ? 'Correct' : 'Wrong'}</strong></div><div style="font-size:13px;color:var(--muted)">${a.explanation || ''}</div></li>`).join('') + '</ol>';
    }

    // badges
    awardBadges();

    // persist to leaderboard and history
    const entry = { date: (new Date()).toISOString(), score, total: quiz.length, difficulty };
    saveHistory(entry);
    saveLeaderboard(entry);
    renderLeaderboard();
    // show and focus leaderboard
    if (leaderboardEl) {
        leaderboardEl.classList.remove('hidden');
        setTimeout(()=>{ leaderboardEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 120);
    }
    if (nextBtn) nextBtn.focus();
}

// difficultySelect removed from DOM; persist and apply difficulty from localStorage only
const applyPersistedDifficulty = ()=>{ const d = localStorage.getItem('quiz_difficulty'); if(d){ difficulty = d; } }
applyPersistedDifficulty();

// adjust timer based on difficulty
const difficultyTimeMap = { easy: 25, medium: 15, hard: 8 };
const startTimer = () => {
    clearInterval(timerID);
    timeLeft = difficultyTimeMap[difficulty] || 15;
    // make timer accessible
    timer.setAttribute('role','status');
    timer.setAttribute('aria-live','polite');
    timer.textContent = timeLeft;
    const countDown = ()=>{
        timeLeft--;
        timer.textContent = timeLeft;
        if(timeLeft === 0){
            displayAlert('Time Up for this question');
            // record as wrong if no answer
            answersRecord.push({ question: quiz[currentQuestionIndex].question, given: null, correct: false, correctAnswer: quiz[currentQuestionIndex].answer, explanation: quiz[currentQuestionIndex].explanation || '' });
            currentQuestionIndex++;
            if (currentQuestionIndex < quiz.length) showQuestions();
            else { stopTimer(); showScore(); }
        }
    }
    timerID = setInterval(countDown, 1000);
}

// leaderboard & history
const saveHistory = (entry)=>{
    const raw = localStorage.getItem(historyKey); const arr = raw ? JSON.parse(raw) : [];
    arr.unshift(entry);
    localStorage.setItem(historyKey, JSON.stringify(arr.slice(0,50)));
}

const saveLeaderboard = (entry)=>{
    // If remote requested but Firebase missing, warn and fallback to local
    // Remote Firebase integration removed/disabled. Save locally only.
    const raw = localStorage.getItem(leaderboardKey); const arr = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    arr.sort((a,b)=> (b.score/b.total) - (a.score/a.total));
    localStorage.setItem(leaderboardKey, JSON.stringify(arr.slice(0,10)));
}

const renderLeaderboard = ()=>{
    const raw = localStorage.getItem(leaderboardKey); const arr = raw ? JSON.parse(raw) : [];
    if(!leaderList) return;
    leaderList.innerHTML = arr.map(e=>`<li>${new Date(e.date).toLocaleString()}: ${e.score}/${e.total} (${e.difficulty})</li>`).join('') || '<li>No entries yet</li>';
    if(arr.length) leaderboardEl.classList.remove('hidden'); else leaderboardEl.classList.add('hidden');
}

if(clearLeaderboardBtn) clearLeaderboardBtn.addEventListener('click', ()=>{ localStorage.removeItem(leaderboardKey); renderLeaderboard(); });

// basic badges
const awardBadges = ()=>{
    const badges = [];
    if(score === quiz.length) badges.push('Perfect Score');
    if(score >= Math.ceil(quiz.length * 0.8)) badges.push('80%+');
    // streaks or other logic could be added using history
    badgesWrap.innerHTML = '';
    badges.forEach(b=>{ const el = document.createElement('div'); el.className = 'badge'; el.textContent = b; badgesWrap.appendChild(el); });
}

// init leaderboard on load
renderLeaderboard();

// Function to Show Alert
const displayAlert = (msg) => {
    alert.style.display = "block";
    alert.textContent = msg;
    setTimeout(()=>{
        alert.style.display = "none";
    }, 2000);
}

// Note: timer handled by difficulty-aware startTimer declared earlier

// Function to Stop Timer
const stopTimer = () =>{
    clearInterval(timerID);
}

// Function to shuffle question
const shuffleQuestions = () =>{
    for(let i=quiz.length-1; i>0; i--){
        const j = Math.floor(Math.random() * (i+1));
        [quiz[i], quiz[j]] = [quiz[j], quiz[i]];
    }
    currentQuestionIndex = 0;
    showQuestions();
}

// Function to Start Quiz
const startQuiz = () =>{
    timeLeft = 15;
    timer.style.display = "flex";
    shuffleQuestions();
}

// Adding Event Listener to Start Button
startBtn.addEventListener('click', ()=>{
    startBtn.style.display = "none";
    container.style.display = "block";
    startQuiz();
});

nextBtn.addEventListener('click', () => {
    const selectedChoice = document.querySelector('.choice.selected');
    if (isAnimating) return; // prevent double submit
    if (!selectedChoice && nextBtn.textContent === "Next") {
        displayAlert("Select your answer");
        return;
    }
    if (quizOver) {
        nextBtn.textContent = "Next";
        scoreCard.textContent = "";
        currentQuestionIndex = 0;
        quizOver = false;
        score = 0;
        answersRecord = [];
        badgesWrap.innerHTML = '';
        startQuiz();
    }
    else {
        // Highlight selection and lock UI
        isAnimating = true;
        const choices = document.querySelectorAll('.choice');
        choices.forEach(c => c.classList.add('disabled'));
        // show correct/wrong immediately
        const q = quiz[currentQuestionIndex];
        const given = selectedChoice ? selectedChoice.textContent : null;
        if (given === q.answer) {
            selectedChoice.classList.add('correct');
            playCorrect();
        } else {
            if (selectedChoice) selectedChoice.classList.add('wrong');
            // highlight correct choice
            const correctEl = Array.from(choices).find(c => c.textContent === q.answer);
            if (correctEl) correctEl.classList.add('correct');
            playWrong();
        }
        // wait then record and advance
        setTimeout(()=>{
            // remove feedback classes
            choices.forEach(c => { c.classList.remove('correct','wrong','disabled'); });
            // now perform existing checkAnswer logic but without repeating sounds
            checkAnswer();
            isAnimating = false;
        }, 900);
    }
});