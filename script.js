const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxHdkXe5DQAeXDriFIN8xvotSMaPNgeLJ_-PmEzsLx00iRylc6fMdaJFy-R8jCUHuxNHA/exec";

const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const fullscreenToggle = document.getElementById("fullscreenToggle");
const fullscreenEnterIcon = document.getElementById("fullscreenEnterIcon");
const fullscreenExitIcon = document.getElementById("fullscreenExitIcon");
const form = document.getElementById("inscriptionForm");
const messageBox = document.getElementById("formMessage");
const submitButton = form.querySelector('button[type="submit"]');

const modal = document.getElementById("competitionModal");
const modalTitle = document.getElementById("modalTitle");
const modalDescription = document.getElementById("modalDescription");
const modalVideo = document.getElementById("modalVideo");
const modalClose = document.getElementById("modalClose");
const infoButtons = document.querySelectorAll(".info-button");

const THEME_KEY = "ism-theme";

const competitionInfo = {
  "mini-sumo": {
    title: "Mini Sumo",
    description: "En Mini Sumo, dos robots autónomos se enfrentan dentro de un área circular llamada dohyo. El objetivo es detectar al oponente, empujarlo y sacarlo de la pista sin salir uno mismo. Esta competencia desarrolla estrategia, sensores, programación y diseño mecánico.",
    videoUrl: "https://www.youtube.com/embed/REEMPLAZAR_ID_VIDEO_MINI_SUMO"
  },
  "velocista": {
    title: "Velocista",
    description: "En Velocista, el robot debe recorrer una pista en el menor tiempo posible manteniendo precisión y estabilidad. Se trabaja mucho con control de movimiento, velocidad, calibración, sensores y optimización del recorrido.",
    videoUrl: "https://www.youtube.com/embed/REEMPLAZAR_ID_VIDEO_VELOCISTA"
  },
  "laberinto": {
    title: "Laberinto",
    description: "En Laberinto, el desafío consiste en diseñar y programar un robot capaz de orientarse y encontrar la salida de un recorrido con obstáculos o pasillos. Se ponen en juego la lógica, la navegación autónoma y la toma de decisiones.",
    videoUrl: "https://www.youtube.com/embed/REEMPLAZAR_ID_VIDEO_LABERINTO"
  },
  "futbot": {
    title: "Futbot",
    description: "Futbot propone una experiencia dinámica donde el robot debe desplazarse, controlar el movimiento y responder estratégicamente dentro de una prueba inspirada en el fútbol robótico. Favorece la coordinación, la rapidez de respuesta y el trabajo en equipo.",
    videoUrl: "https://www.youtube.com/embed/REEMPLAZAR_ID_VIDEO_FUTBOT"
  },
  "ia": {
    title: "Inteligencia Artificial",
    description: "La categoría IA invita a explorar ideas vinculadas con automatización, visión, análisis de datos, algoritmos inteligentes y soluciones creativas. Es una propuesta ideal para quienes quieren combinar programación, innovación y pensamiento computacional.",
    videoUrl: "https://www.youtube.com/embed/REEMPLAZAR_ID_VIDEO_IA"
  }
};

function applyTheme(theme) {
  body.classList.toggle("dark-theme", theme === "dark");
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

function toggleTheme() {
  const nextTheme = body.classList.contains("dark-theme") ? "light" : "dark";
  applyTheme(nextTheme);
}

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

function getSelectedCompetitions() {
  return Array.from(form.querySelectorAll('input[name="competition"]:checked')).map((item) => item.value);
}

function showMessage(text, type = "") {
  messageBox.textContent = text;
  messageBox.className = "form-message";
  if (type) messageBox.classList.add(type);
}

function validateFormData(data) {
  if (!data.fullName) {
    showMessage("Ingresá nombre y apellido.", "error");
    return false;
  }

  const age = Number(data.age);
  if (!Number.isInteger(age) || age < 10 || age > 25) {
    showMessage("Ingresá una edad válida entre 10 y 25.", "error");
    return false;
  }

  if (!data.course || !data.division) {
    showMessage("Seleccioná curso y división.", "error");
    return false;
  }

  if (data.competitions.length === 0) {
    showMessage("Seleccioná al menos una competición.", "error");
    return false;
  }

  return true;
}

function openCompetitionModal(key) {
  const item = competitionInfo[key];
  if (!item) return;

  modalTitle.textContent = item.title;
  modalDescription.textContent = item.description;
  modalVideo.src = item.videoUrl;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  body.classList.add("modal-open");
}

function closeCompetitionModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  modalVideo.src = "";
  body.classList.remove("modal-open");
}

async function handleSubmit(event) {
  event.preventDefault();

  const payload = {
    fullName: document.getElementById("fullName").value.trim(),
    age: document.getElementById("age").value.trim(),
    course: document.getElementById("course").value,
    division: document.getElementById("division").value,
    competitions: getSelectedCompetitions(),
    createdAt: new Date().toISOString()
  };

  if (!validateFormData(payload)) return;

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PEGAR_AQUI")) {
    showMessage("Configurá la URL pública de Google Apps Script en script.js antes de enviar.", "error");
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "Enviando...";
  showMessage("Enviando inscripción...");

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error("La respuesta del servidor no es JSON válido.");
    }

    if (!response.ok || result.result !== "success") {
      throw new Error(result.message || "No se pudo guardar la inscripción.");
    }

    showMessage("Inscripción enviada correctamente.", "success");
    form.reset();
  } catch (error) {
    console.error(error);
    showMessage("Ocurrió un error al enviar los datos. Revisá la URL pública del Web App y los permisos.", "error");
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Enviar inscripción";
  }
}

themeToggle.addEventListener("click", toggleTheme);
fullscreenToggle.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", syncFullscreenIcons);

infoButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openCompetitionModal(button.dataset.competition);
  });
});

modalClose.addEventListener("click", closeCompetitionModal);
modal.addEventListener("click", (event) => {
  if (event.target.dataset.closeModal === "true") closeCompetitionModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) {
    closeCompetitionModal();
  }
});

form.addEventListener("submit", handleSubmit);

initTheme();
syncFullscreenIcons();
