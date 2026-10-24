const STORAGE_KEY = "studyRoomTasksV1";

const taskForm = document.getElementById("taskForm");
const taskTitle = document.getElementById("taskTitle");
const taskSubject = document.getElementById("taskSubject");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const searchInput = document.getElementById("searchInput");
const submitTask = document.getElementById("submitTask");
const cancelEdit = document.getElementById("cancelEdit");

let tasks = [];
let editingId = null;
let activeFilter = "all";

try {
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? JSON.parse(stored) : [];

  if (Array.isArray(parsed)) {
    tasks = parsed.filter(task =>
      task &&
      typeof task.id === "string" &&
      typeof task.title === "string"
    );
  }
} catch (error) {
  tasks = [];
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    alert("Your browser could not save the tasks. Check storage settings.");
  }
}

function updateStats() {
  const completed = tasks.filter(task => task.completed).length;

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("remainingCount").textContent =
    tasks.length - completed;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}

function renderTasks() {
  taskList.replaceChildren();

  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = tasks.filter(task => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "active" && !task.completed) ||
      (activeFilter === "completed" && task.completed);

    const searchableText =
      `${task.title} ${task.subject || ""}`.toLowerCase();

    return matchesFilter && searchableText.includes(searchTerm);
  });

  emptyMessage.hidden = filtered.length !== 0;

  if (filtered.length === 0) {
    emptyMessage.textContent = tasks.length === 0
      ? "Your study list is empty. Add a task to begin."
      : "No tasks match your search or filter.";
  }

  filtered.forEach(task => {
    const item = createElement(
      "article",
      `task-item${task.completed ? " is-complete" : ""}`
    );

    const checkbox = createElement("input", "task-checkbox");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute(
      "aria-label",
      `Mark ${task.title} as ${task.completed ? "incomplete" : "complete"}`
    );

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const main = createElement("div", "task-main");
    const topline = createElement("div", "task-topline");
    const title = createElement("h3", "task-title", task.title);

    const priority = createElement(
      "span",
      `priority priority-${task.priority.toLowerCase()}`,
      task.priority
    );

    topline.append(title, priority);

    const metadata = [];
    if (task.subject) metadata.push(task.subject);
    if (task.date) metadata.push(`Due: ${task.date}`);

    const meta = createElement(
      "p",
      "task-meta",
      metadata.join(" · ") || "No subject or due date"
    );

    const actions = createElement("div", "task-actions");

    const editButton = createElement("button", "task-action", "Edit");
    editButton.type = "button";
    editButton.addEventListener("click", () => beginEdit(task.id));

    const deleteButton = createElement(
      "button",
      "task-action delete",
      "Delete"
    );
    deleteButton.type = "button";
    deleteButton.addEventListener("click", () => deleteTask(task.id));

    actions.append(editButton, deleteButton);
    main.append(topline, meta, actions);
    item.append(checkbox, main);
    taskList.append(item);
  });

  updateStats();
}

function resetForm() {
  taskForm.reset();
  taskPriority.value = "Medium";
  editingId = null;
  submitTask.textContent = "Add task +";
  cancelEdit.hidden = true;
}

function beginEdit(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  editingId = id;
  taskTitle.value = task.title;
  taskSubject.value = task.subject || "";
  taskDate.value = task.date || "";
  taskPriority.value = task.priority;

  submitTask.textContent = "Save changes";
  cancelEdit.hidden = false;
  taskTitle.focus();

  taskForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

function deleteTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  if (!confirm(`Delete "${task.title}"?`)) return;

  tasks = tasks.filter(item => item.id !== id);

  if (editingId === id) {
    resetForm();
  }

  saveTasks();
  renderTasks();
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();

  const title = taskTitle.value.trim();
  if (!title) {
    taskTitle.focus();
    return;
  }

  const subject = taskSubject.value.trim();
  const date = taskDate.value;
  const priority = taskPriority.value;

  if (editingId) {
    const task = tasks.find(item => item.id === editingId);

    if (task) {
      task.title = title;
      task.subject = subject;
      task.date = date;
      task.priority = priority;
    }
  } else {
    tasks.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      title,
      subject,
      date,
      priority,
      completed: false
    });
  }

  saveTasks();
  resetForm();
  renderTasks();
});

cancelEdit.addEventListener("click", resetForm);
searchInput.addEventListener("input", renderTasks);

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-button").forEach(item => {
      const isActive = item === button;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    renderTasks();
  });

  button.setAttribute(
    "aria-pressed",
    String(button.dataset.filter === activeFilter)
  );
});

/* Focus timer */

const timerDisplay = document.getElementById("timerDisplay");
const timerStatus = document.getElementById("timerStatus");
const durationSelect = document.getElementById("durationSelect");

let remainingSeconds = Number(durationSelect.value) * 60;
let timerInterval = null;
let deadline = null;

function displayTime() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function pauseTimer() {
  if (timerInterval !== null) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  deadline = null;
}

function startTimer() {
  if (timerInterval !== null) return;

  if (remainingSeconds <= 0) {
    remainingSeconds = Number(durationSelect.value) * 60;
  }

  deadline = Date.now() + remainingSeconds * 1000;
  timerStatus.textContent = "Focus session in progress.";

  timerInterval = setInterval(() => {
    remainingSeconds = Math.max(
      0,
      Math.ceil((deadline - Date.now()) / 1000)
    );

    displayTime();

    if (remainingSeconds <= 0) {
      pauseTimer();
      timerStatus.textContent = "Session complete. Take a short break!";
      alert("Your focus session is complete. Time for a short break!");
    }
  }, 250);
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = Number(durationSelect.value) * 60;
  displayTime();
  timerStatus.textContent = "Timer reset. Ready when you are.";
}

document.getElementById("startTimer").addEventListener("click", startTimer);

document.getElementById("pauseTimer").addEventListener("click", () => {
  pauseTimer();
  timerStatus.textContent = "Timer paused.";
});

document.getElementById("resetTimer").addEventListener("click", resetTimer);

durationSelect.addEventListener("change", resetTimer);

/* Installable app prompt */

let installPrompt = null;
const installButton = document.getElementById("installButton");

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
  if (!installPrompt) return;

  installPrompt.prompt();
  await installPrompt.userChoice;

  installPrompt = null;
  installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
  installButton.hidden = true;
});

/* Register the service worker for the planner folder */

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(error => {
      console.error("Service worker registration failed:", error);
    });
  });
}

displayTime();
renderTasks();