"use strict";

// HELPER FUNCTIONS
const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


// ==========================================
// 1. MOBILE NAVIGATION
// ==========================================

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
});

$$(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.textContent = "☰";
    });
});


// ==========================================
// 2. LIGHT / DARK THEME
// ==========================================

const themeToggle = $("#themeToggle");

function updateThemeButton() {
    const dark = document.body.classList.contains("dark-theme");

    themeToggle.textContent = dark ? "☀" : "☾";

    themeToggle.setAttribute(
        "aria-label",
        dark ? "Switch to light theme" : "Switch to dark theme"
    );
}

// Restore the saved theme when possible.
try {
    if (localStorage.getItem("devspace-theme") === "dark") {
        document.body.classList.add("dark-theme");
    }
} catch (error) {
    // Theme switching still works if storage is unavailable.
}

updateThemeButton();

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const dark = document.body.classList.contains("dark-theme");

    try {
        localStorage.setItem(
            "devspace-theme",
            dark ? "dark" : "light"
        );
    } catch (error) {
        // Continue without persistence if storage is blocked.
    }

    updateThemeButton();
});


// ==========================================
// 3. PROJECT CATEGORY FILTER
// ==========================================

const filterButtons = $$(".filter-btn");
const projectCards = $$(".project-card");
const projectCount = $("#projectCount");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        const category = button.dataset.filter;

        filterButtons.forEach(item => {
            const active = item === button;

            item.classList.toggle("active", active);
            item.setAttribute("aria-pressed", String(active));
        });

        let visible = 0;

        projectCards.forEach(card => {
            const show =
                category === "all" ||
                card.dataset.category === category;

            card.hidden = !show;

            if (show) {
                visible++;
            }
        });

        projectCount.textContent =
            `Showing ${visible} project${visible === 1 ? "" : "s"}`;
    });
});


// ==========================================
// 4. PROJECT DETAILS DIALOG
// ==========================================

const projectDialog = $("#projectDialog");

$$(".project-details").forEach(button => {
    button.addEventListener("click", () => {
        $("#dialogTitle").textContent = button.dataset.title;

        $("#dialogDescription").textContent =
            button.dataset.description;

        // Fallback for browsers without the native dialog API.
        if (typeof projectDialog.showModal === "function") {
            projectDialog.showModal();
        } else {
            window.alert(
                `${button.dataset.title}\n\n${button.dataset.description}`
            );
        }
    });
});

$("#closeDialog").addEventListener("click", () => {
    projectDialog.close();
});

projectDialog.addEventListener("click", event => {
    if (event.target === projectDialog) {
        projectDialog.close();
    }
});


// ==========================================
// 5. TASK MANAGER WITH LOCAL STORAGE
// ==========================================

const taskForm = $("#taskForm");
const taskInput = $("#taskInput");
const taskList = $("#taskList");
const taskStatus = $("#taskStatus");

const STORAGE_KEY = "devspace-tasks";

let tasks = [];

// Restore previously saved tasks.
try {
    const savedTasks = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    if (
        Array.isArray(savedTasks) &&
        savedTasks.every(task =>
            task &&
            typeof task.text === "string" &&
            typeof task.completed === "boolean" &&
            Number.isSafeInteger(task.id)
        )
    ) {
        tasks = savedTasks;
    }
} catch (error) {
    tasks = [];
}


// Save tasks to the browser.
function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

        taskStatus.textContent = "";
    } catch (error) {
        taskStatus.textContent =
            "Browser storage is unavailable. Tasks may not persist.";
    }
}


// Display tasks.
function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const empty = document.createElement("li");

        empty.className = "status-message";
        empty.textContent =
            "No tasks yet. Add your first task!";

        taskList.appendChild(empty);
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement("li");

        item.className =
            `task-item${task.completed ? " completed" : ""}`;

        // Completion checkbox.
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;

        checkbox.setAttribute(
            "aria-label",
            `Mark ${task.text} as completed`
        );

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;

            saveTasks();
            renderTasks();
        });

        // Task text. textContent avoids inserting user HTML.
        const label = document.createElement("span");

        label.className = "task-label";
        label.textContent = task.text;

        // Delete button.
        const removeButton = document.createElement("button");

        removeButton.className = "delete-task";
        removeButton.type = "button";
        removeButton.textContent = "Delete";

        removeButton.setAttribute(
            "aria-label",
            `Delete task ${task.text}`
        );

        removeButton.addEventListener("click", () => {
            tasks = tasks.filter(item => item.id !== task.id);

            saveTasks();
            renderTasks();

            taskStatus.textContent = "Task deleted.";
        });

        item.append(checkbox, label, removeButton);
        taskList.appendChild(item);
    });
}


// Add a new task.
taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        taskStatus.textContent = "Please enter a task.";
        return;
    }

    tasks.push({
        id: Date.now(),
        text: text,
        completed: false
    });

    saveTasks();
    renderTasks();

    taskForm.reset();
    taskInput.focus();

    taskStatus.textContent = "Task added successfully.";
});

renderTasks();


// ==========================================
// 6. FIVE-QUESTION WEB DEVELOPMENT QUIZ
// ==========================================

const questions = [
    {
        question: "1. Which language structures a web page?",
        options: ["CSS", "HTML", "JavaScript", "SQL"],
        answer: 1,
        explanation:
            "HTML defines the structure and content of a web page."
    },
    {
        question: "2. Which technology styles a website?",
        options: ["CSS", "HTML", "Python", "C"],
        answer: 0,
        explanation:
            "CSS controls colors, typography, spacing and layout."
    },
    {
        question: "3. Which keyword declares a block-scoped variable?",
        options: ["define", "dim", "let", "echo"],
        answer: 2,
        explanation:
            "The let keyword declares a block-scoped variable."
    },
    {
        question: "4. What helps layouts adapt to screen size?",
        options: [
            "Media queries",
            "Console logs",
            "HTML comments",
            "String methods"
        ],
        answer: 0,
        explanation:
            "CSS media queries apply styles based on viewport conditions."
    },
    {
        question: "5. Which method selects the first matching CSS selector?",
        options: [
            "getNumber()",
            "querySelector()",
            "makeElement()",
            "findStyle()"
        ],
        answer: 1,
        explanation:
            "querySelector() returns the first matching element."
    }
];

let questionIndex = 0;
let score = 0;
let answered = false;

const quizQuestion = $("#quizQuestion");
const quizOptions = $("#quizOptions");
const quizProgress = $("#quizProgress");
const quizFeedback = $("#quizFeedback");
const nextQuestion = $("#nextQuestion");


// Display the current question.
function renderQuestion() {
    answered = false;

    const question = questions[questionIndex];

    quizProgress.textContent =
        `Question ${questionIndex + 1} of ${questions.length}`;

    quizQuestion.textContent = question.question;
    quizFeedback.textContent = "";

    quizOptions.replaceChildren();

    question.options.forEach((option, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "quiz-option";
        button.textContent = option;

        button.addEventListener("click", () => {
            if (answered) {
                return;
            }

            answered = true;

            const correct = index === question.answer;

            if (correct) {
                score++;
            }

            // Disable answers after the user selects one.
            $$(".quiz-option", quizOptions).forEach((item, i) => {
                item.disabled = true;

                if (i === question.answer) {
                    item.classList.add("correct");
                } else if (i === index && !correct) {
                    item.classList.add("incorrect");
                }
            });

            quizFeedback.textContent =
                `${correct ? "Correct!" : "Not quite."} ` +
                question.explanation;

            nextQuestion.disabled = false;

            nextQuestion.textContent =
                questionIndex === questions.length - 1
                    ? "See Results"
                    : "Next Question →";
        });

        quizOptions.appendChild(button);
    });

    nextQuestion.disabled = true;
    nextQuestion.textContent = "Next Question →";
}


// Restart the quiz.
function restartQuiz() {
    questionIndex = 0;
    score = 0;

    nextQuestion.dataset.mode = "";

    renderQuestion();
}


// Move to the next question or display the final score.
nextQuestion.addEventListener("click", () => {
    if (nextQuestion.dataset.mode === "restart") {
        restartQuiz();
        return;
    }

    if (!answered) {
        return;
    }

    if (questionIndex < questions.length - 1) {
        questionIndex++;
        renderQuestion();
        return;
    }

    // Quiz finished.
    quizProgress.textContent = "Quiz completed!";

    quizQuestion.textContent =
        `Your score: ${score}/${questions.length}`;

    quizOptions.replaceChildren();

    quizFeedback.textContent =
        score >= 4
            ? "Excellent work! You understand the basics."
            : "Good attempt! Review the answers and try again.";

    nextQuestion.disabled = false;
    nextQuestion.textContent = "Try Again";
    nextQuestion.dataset.mode = "restart";
});

renderQuestion();


// ==========================================
// 7. CONTACT FORM VALIDATION
// ==========================================

const contactForm = $("#contactForm");
const formStatus = $("#formStatus");

contactForm.addEventListener("submit", event => {
    event.preventDefault();

    // Validate required fields and email format.
    if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
    }

    const name = $("#name").value.trim();
    const email = $("#email").value.trim();
    const message = $("#message").value.trim();

    if (!name || !email || !message) {
        formStatus.textContent = "Please fill in all fields.";
        return;
    }

    formStatus.textContent =
        `Thank you, ${name}! The form passed validation. ` +
        "This demo does not send or store messages on a server.";

    contactForm.reset();
});


// ==========================================
// 8. DYNAMIC FOOTER YEAR
// ==========================================

$("#currentYear").textContent = new Date().getFullYear();
