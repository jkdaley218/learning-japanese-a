document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('lesson-video');
    const startReviewBtn = document.getElementById('start-review-btn');
    const nextReviewBtn = document.getElementById('next-review-btn');
    const takeQuizBtn = document.getElementById('take-quiz-btn');
    
    const mainHeader = document.getElementById('main-header');
    const videoSection = document.getElementById('video-section');
    const reviewSection = document.getElementById('review-section');
    const summary = document.getElementById('review-summary');
    
    const quizSection = document.getElementById('quiz-section');
    const questionContainer = document.getElementById('question-container');
    const feedbackContainer = document.getElementById('feedback-container');
    const quizActionBtn = document.getElementById('quiz-action-btn');

    let currentReviewStep = 0;
    let currentQuizIndex = 0;
    let isShowingFeedback = false;
    let userScore = 0;

    const quizData = [
        {
            question: "Drag the images into the correct writing sequence (1 to 3):",
            correct: 'abc', 
            explanation: "Correct! In Hiragana 'あ', you start with the horizontal cross-stroke (1), follow with the vertical downward stroke (2), and finish with the large base loop (3).",
            errorMsg: "Not quite. Remember the 'rule of three' for あ: Horizontal first, then the vertical cross, then the big loop at the bottom."
        },
        {
            question: "In which direction is the long vertical stroke (the final element) drawn?",
            options: [
                { val: 'a', label: 'Top to bottom' },
                { val: 'b', label: 'Bottom to top' }
            ],
            correct: 'a',
            explanation: "Correct! In Japanese calligraphy and Hiragana, vertical strokes almost always move from top to bottom."
        },
        {
            question: "How many new, major strokes are added AFTER the first curve is drawn?",
            options: [
                { val: 'a', label: 'One' },
                { val: 'b', label: 'Two' },
                { val: 'c', label: 'Three' }
            ],
            correct: 'b',
            explanation: "Correct! After the first curve, you add the cross-stroke and then the final looping stroke."
        },
        {
            question: "Select ALL of the characters that are written correctly:",
            type: "multi-select",
            options: [
                { id: "g1", img: "images/good1.jpg", isCorrect: true, feedback: "Correct! Good balance and cross-stroke placement." },
                { id: "g2", img: "images/good2.jpg", isCorrect: true, feedback: "Correct! The loop is well-proportioned." },
                { id: "g3", img: "images/good3.jpg", isCorrect: true, feedback: "Correct! Clear stroke definition." },
                { id: "b1", img: "images/bad1.jpg", isCorrect: false, feedback: "Incorrect. The vertical stroke is curved too much to the right instead of left." },
                { id: "b2", img: "images/bad2.jpg", isCorrect: false, feedback: "Incorrect. The loop stroke does not cross through the bottom of the vertical line and the loop is not fully completed." },
                { id: "b3", img: "images/bad3.jpg", isCorrect: false, feedback: "Incorrect. The horizontal stroke is tilted downwards instead of straight." },
                { id: "b4", img: "images/bad4.jpg", isCorrect: false, feedback: "Incorrect. The loop is too proportionally small compared to the rest of the character strokes." }
            ]
        }
    ];

    // --- Review Logic ---
    video.addEventListener('ended', () => startReviewBtn.classList.remove('hidden'));

    startReviewBtn.addEventListener('click', () => {
        reviewSection.classList.remove('hidden');
        startReviewBtn.classList.add('hidden');
        progressReview(); 
    });

    nextReviewBtn.addEventListener('click', progressReview);

    function progressReview() {
        currentReviewStep++;
        if (currentReviewStep <= 3) {
            document.getElementById(`row-${currentReviewStep}`).classList.remove('hidden');
        }
        if (currentReviewStep === 3) {
            summary.classList.remove('hidden');
            nextReviewBtn.classList.add('hidden');
            takeQuizBtn.classList.remove('hidden');
        }
    }

    // --- Quiz Transition (HIDE EVERYTHING) ---
    takeQuizBtn.addEventListener('click', () => {
        mainHeader.classList.add('hidden');    
        videoSection.classList.add('hidden');   
        reviewSection.classList.add('hidden');  
        
        quizSection.classList.remove('hidden'); 
        window.scrollTo(0, 0);                 
        loadQuestion();                         
    });

    function loadQuestion() {
        const data = quizData[currentQuizIndex];
        feedbackContainer.classList.add('hidden');
        isShowingFeedback = false;
        quizActionBtn.textContent = "Submit Answer";

        if (currentQuizIndex === 0) {
            setupDragAndDrop(data);
        } else if (data.type === "multi-select") {
            renderMultiSelect(data);
        } else {
            renderStandardQuestion(data);
        }
    }

    function setupDragAndDrop(data) {
        questionContainer.innerHTML = `
            <p class="question-text">Question ${currentQuizIndex + 1} of ${quizData.length}</p>
            <p>${data.question}</p>
            <div class="drag-container">
                <div class="drop-zones">
                    <div class="zone" data-index="0">1</div>
                    <div class="zone" data-index="1">2</div>
                    <div class="zone" data-index="2">3</div>
                </div>
                <div class="drag-items">
                    <div class="drag-card" draggable="true" id="card-b" data-val="b"><img src="images/secondstroke.png"></div>
                    <div class="drag-card" draggable="true" id="card-c" data-val="c"><img src="images/thirdstroke.png"></div>
                    <div class="drag-card" draggable="true" id="card-a" data-val="a"><img src="images/firststroke.png"></div>
                </div>
            </div>
        `;

        const cards = document.querySelectorAll('.drag-card');
        const zones = document.querySelectorAll('.zone');

        cards.forEach(card => {
            card.addEventListener('dragstart', e => {
                e.dataTransfer.setData('text/plain', e.target.id);
            });
        });

        zones.forEach(zone => {
            zone.addEventListener('dragover', e => e.preventDefault());
            zone.addEventListener('drop', e => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain');
                const card = document.getElementById(id);
                
                // If zone has a number, clear it; otherwise swap card
                if (zone.innerText.length === 1) zone.innerHTML = ''; 
                zone.appendChild(card);
            });
        });
    }

    function renderMultiSelect(data) {
        // Shuffle the options array before rendering
        const shuffledOptions = [...data.options].sort(() => Math.random() - 0.5);

        const optionsHTML = shuffledOptions.map(opt => `
            <div class="multi-option-card" id="card-${opt.id}">
                <label>
                    <input type="checkbox" name="quiz-opt" value="${opt.id}">
                    <div class="multi-thumb"><img src="${opt.img}"></div>
                </label>
                <div class="individual-feedback hidden" id="feedback-${opt.id}"></div>
            </div>
        `).join('');

        questionContainer.innerHTML = `
            <p class="question-text">Question ${currentQuizIndex + 1} of ${quizData.length}</p>
            <p>${data.question}</p>
            <div class="multi-grid">${optionsHTML}</div>
        `;
    }

    function renderStandardQuestion(data) {
        const optionsHTML = data.options.map(opt => `
            <label class="text-option">
                <input type="radio" name="quiz-opt" value="${opt.val}"> ${opt.label}
            </label>
        `).join('');

        questionContainer.innerHTML = `
            <p class="question-text">Question ${currentQuizIndex + 1} of ${quizData.length}</p>
            <p>${data.question}</p>
            <div class="options-group">${optionsHTML}</div>
        `;
    }

   quizActionBtn.addEventListener('click', () => {
        const data = quizData[currentQuizIndex];

        if (!isShowingFeedback) {
            let isCorrect = false;

            // --- 1. CAPTURE & VALIDATE ---
            if (currentQuizIndex === 0) {
                const zones = document.querySelectorAll('.zone');
                const userSequence = Array.from(zones).map(z => z.firstChild?.dataset?.val || "");
                isCorrect = (userSequence.join('') === data.correct);
            } 
            else if (data.type === "multi-select") {
                const selectedCheckboxes = document.querySelectorAll('input[name="quiz-opt"]:checked');
                const selectedValues = Array.from(selectedCheckboxes).map(cb => cb.value);
                let totalMistakes = 0;

                data.options.forEach(opt => {
                    const isChecked = selectedValues.includes(opt.id);
                    if (isChecked !== opt.isCorrect) totalMistakes++;
                    
                    // Visual feedback for multi-select
                    const cardEl = document.getElementById(`card-${opt.id}`);
                    const feedbackEl = document.getElementById(`feedback-${opt.id}`);
                    feedbackEl.classList.remove('hidden');
                    feedbackEl.textContent = opt.feedback;
                    if (isChecked && opt.isCorrect) cardEl.classList.add('correct-border');
                    else if (isChecked && !opt.isCorrect) cardEl.classList.add('wrong-border');
                    else if (!isChecked && opt.isCorrect) cardEl.classList.add('missed-border');
                });
                isCorrect = (totalMistakes === 0);
            } 
            else {
                // STANDARD RADIO LOGIC (Questions 2 & 3)
                const selected = document.querySelector('input[name="quiz-opt"]:checked');
                if (!selected) return alert("Please select an answer!");
                
                // FIX: Explicitly compare the string value of the radio to data.correct
                isCorrect = (selected.value === data.correct);
            }

            // --- 2. LOCK DOWN UI ---
            isShowingFeedback = true;
            const allInputs = questionContainer.querySelectorAll('input');
            allInputs.forEach(input => input.disabled = true);

            if (currentQuizIndex === 0) {
                document.querySelectorAll('.drag-card').forEach(card => card.setAttribute('draggable', 'false'));
            }

            // --- 3. SHOW FEEDBACK ---
            feedbackContainer.classList.remove('hidden');
            if (isCorrect) {
                userScore++;
                feedbackContainer.className = "success-msg";
                feedbackContainer.textContent = data.explanation || "Correct!";
            } else {
                feedbackContainer.className = "error-msg";
                feedbackContainer.textContent = data.errorMsg || "Incorrect. Take another look at the lesson material.";
            }

            quizActionBtn.textContent = currentQuizIndex < quizData.length - 1 ? "Next Question" : "See Results";

        } else {
            // NEXT QUESTION LOGIC
            currentQuizIndex++;
            if (currentQuizIndex < quizData.length) {
                loadQuestion();
            } else {
                showFinalResults();
            }
        }
    });

    function showFinalResults() {
        const percentage = Math.round((userScore / quizData.length) * 100);
        let grade = "F";
        if (percentage >= 90) grade = "A";
        else if (percentage >= 80) grade = "B";
        else if (percentage >= 70) grade = "C";
        else if (percentage >= 60) grade = "D";

        questionContainer.innerHTML = `
            <div class="final-results">
                <h3>Quiz Complete</h3>
                <p class="score-display">Your Score: ${userScore} / ${quizData.length}</p>
                <p class="percentage-display">${percentage}%</p>
                <div class="grade-circle">${grade}</div>
            </div>
        `;
        feedbackContainer.classList.add('hidden');
        quizActionBtn.textContent = "Restart Lesson";
        quizActionBtn.onclick = () => location.reload();
    }
});
