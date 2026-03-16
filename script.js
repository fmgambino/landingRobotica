const GOOGLE_SCRIPT_URL = "https://script.google.com/a/macros/institutosanmiguel.edu.ar/s/AKfycbxHdkXe5DQAeXDriFIN8xvotSMaPNgeLJ_-PmEzsLx00iRylc6fMdaJFy-R8jCUHuxNHA/exec";

const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const fullscreenToggle = document.getElementById("fullscreenToggle");
const fullscreenEnterIcon = document.getElementById("fullscreenEnterIcon");
const fullscreenExitIcon = document.getElementById("fullscreenExitIcon");
const form = document.getElementById("inscriptionForm");
const messageBox = document.getElementById("formMessage");
const submitButton = form.querySelector('button[type="submit"]');

const THEME_KEY = "ism-theme";

function applyTheme(theme) {
  if (theme === "dark") {
    body.classList.add("dark-theme");
  } else {
    body.classList.remove("dark-theme");
  }
  localStorage.setItem(THEME_KEY, theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme) {
    applyTheme(savedTheme);
    return;
  }

  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  applyTheme(prefersDark ? "dark" : "light");
}

themeToggle.addEventListener("click", () => {
  const nextTheme = body.classList.contains("dark-theme") ? "light" : "dark";
  applyTheme(nextTheme);
});

async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  } catch (error) {
    console.error("No se pudo cambiar a pantalla completa:", error);
  }
}

function syncFullscreenIcons() {
  const isFullscreen = Boolean(document.fullscreenElement);
  fullscreenEnterIcon.classList.toggle("hidden", isFullscreen);
  fullscreenExitIcon.classList.toggle("hidden", !isFullscreen);
}

fullscreenToggle.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", syncFullscreenIcons);

function getSelectedCompetitions() {
  const checked = form.querySelectorAll('input[name="competition"]:checked');
  return Array.from(checked).map((item) => item.value);
}

function showMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "form-message";
  if (type) {
    messageBox.classList.add(type);
  }
}

function validateFormData(data) {
  if (data.competitions.length === 0) {
    showMessage("Seleccioná al menos una competición.", "error");
    return false;
  }

  if (Number(data.forecastGrade) < 1 || Number(data.forecastGrade) > 10) {
    showMessage("La nota pronóstico debe estar entre 1 y 10.", "error");
    return false;
  }

  return true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    fullName: document.getElementById("fullName").value.trim(),
    age: document.getElementById("age").value.trim(),
    course: document.getElementById("course").value,
    division: document.getElementById("division").value,
    forecastGrade: document.getElementById("forecastGrade").value.trim(),
    competitions: getSelectedCompetitions(),
    createdAt: new Date().toISOString()
  };

  if (!validateFormData(payload)) {
    return;
  }

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PEGAR_AQUI")) {
    showMessage("Configurá la URL de Google Apps Script en script.js antes de enviar.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  showMessage("Enviando inscripción...");

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "No se pudo guardar la inscripción.");
    }

    showMessage("Inscripción enviada correctamente.", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    showMessage("Ocurrió un error al enviar los datos. Revisá la URL del Web App y los permisos.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar inscripción";
  }
});

initTheme();
syncFullscreenIcons();
