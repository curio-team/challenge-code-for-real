const projectFormStorageKey = "code-for-real-invulformulier";
const projectForm = document.getElementById("project-form");

if (projectForm) {
  const saveStatus = document.getElementById("save-status");
  const fields = [...projectForm.querySelectorAll("input, textarea")];

  const readForm = () => {
    const data = {};
    fields.forEach((field) => {
      data[field.name] = field.value;
    });
    return data;
  };

  const writeForm = (data) => {
    if (!data || typeof data !== "object") return;

    if (typeof data.studenten !== "string") {
      const names = ["student-1", "student-2", "student-3", "student-4"]
        .map((key) => (typeof data[key] === "string" ? data[key].trim() : ""))
        .filter(Boolean);

      if (names.length) data.studenten = names.join(", ");
    }

    fields.forEach((field) => {
      if (typeof data[field.name] === "string") {
        field.value = data[field.name];
      }
    });
  };

  try {
    const stored = localStorage.getItem(projectFormStorageKey);
    if (stored) writeForm(JSON.parse(stored));
  } catch {
    // Een kapotte of geblokkeerde opslag mag het formulier niet tegenhouden.
  }

  const persistForm = () => {
    localStorage.setItem(projectFormStorageKey, JSON.stringify(readForm()));
  };

  const fitTextareas = () => {
    projectForm.querySelectorAll("textarea").forEach((field) => {
      field.style.height = "auto";
      field.style.height = `${field.scrollHeight}px`;
    });
  };

  projectForm.addEventListener("input", () => {
    try {
      persistForm();
    } catch {
      if (saveStatus) saveStatus.textContent = "Opslaan lukt niet in deze browser.";
    }
  });

  projectForm.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      persistForm();
      if (saveStatus) saveStatus.textContent = "Opgeslagen in deze browser.";
    } catch {
      if (saveStatus) saveStatus.textContent = "Opslaan lukt niet in deze browser.";
    }
  });

  const printForm = () => {
    try {
      persistForm();
    } catch {
      if (saveStatus) saveStatus.textContent = "Opslaan lukt niet in deze browser.";
    }

    fitTextareas();
    window.print();
  };

  document.querySelectorAll("[data-print-form]").forEach((button) => {
    button.addEventListener("click", printForm);
  });

  window.addEventListener("beforeprint", fitTextareas);
}

const printButton = document.getElementById("print-briefing");

if (printButton) {
  printButton.addEventListener("click", () => {
    window.print();
  });
}

const clientPageUrl = document.getElementById("client-page-url");

if (clientPageUrl) {
  clientPageUrl.textContent = new URL("opdrachtgever.html", window.location.href).href;
}

const copyMailButton = document.getElementById("copy-mail");
const mailTemplate = document.getElementById("mail-template");

function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }

  return new Promise((resolve, reject) => {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();

    const copied = document.execCommand("copy");
    area.remove();

    if (copied) {
      resolve();
      return;
    }

    reject(new Error("copy failed"));
  });
}

if (copyMailButton && mailTemplate) {
  copyMailButton.addEventListener("click", async () => {
    const originalLabel = copyMailButton.textContent;

    const subject = mailTemplate.dataset.subject;
    const text = subject
      ? `Onderwerp: ${subject}\n\n${mailTemplate.innerText.trim()}`
      : mailTemplate.innerText.trim();

    try {
      await copyText(text);
      copyMailButton.textContent = "Gekopieerd";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(mailTemplate);
      selection.removeAllRanges();
      selection.addRange(range);
      copyMailButton.textContent = "Tekst geselecteerd";
    }

    window.setTimeout(() => {
      copyMailButton.textContent = originalLabel;
      window.getSelection().removeAllRanges();
    }, 2000);
  });
}

const sectionNav = document.querySelector(".nav");

if (sectionNav) {
  const sections = [...sectionNav.querySelectorAll("a")].flatMap((link) => {
    const url = new URL(link.getAttribute("href"), window.location.href);
    const samePage = url.pathname === window.location.pathname;
    const section = samePage && url.hash ? document.getElementById(url.hash.slice(1)) : null;

    return section ? [{ link, section }] : [];
  });

  const markCurrentSection = () => {
    const marker = window.scrollY + 110;
    let active = null;

    sections.forEach((item) => {
      const top = item.section.getBoundingClientRect().top + window.scrollY;
      if (top <= marker) active = item;
    });

    sections.forEach(({ link }) => {
      if (active && link === active.link) {
        link.setAttribute("aria-current", "true");
      } else if (link.getAttribute("aria-current") === "true") {
        link.removeAttribute("aria-current");
      }
    });
  };

  if (sections.length) {
    markCurrentSection();
    window.addEventListener("scroll", markCurrentSection, { passive: true });
    window.addEventListener("hashchange", markCurrentSection);
  }
}
