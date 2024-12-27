export const getElement = (selection) => {
  const element = document.querySelector(selection);
  if (element) return element;
  throw new Error(
    `Pls check the "${selection}" selector, no such element exist`
  );
};

const getLocalStorage = (item) => {
  const storageItem = localStorage.getItem(item)
    ? JSON.parse(localStorage.getItem(item))
    : {
        state: "light",
        reState: "dark",
        slide: "left",
        star: ["sun", "moon"],
      };
  return storageItem;
};
export const getLocalStorage1 = (item) => {
  const storageItem = localStorage.getItem(item)
    ? JSON.parse(localStorage.getItem(item))
    : [];
  return storageItem;
};

const bodyWidth = document.body.getBoundingClientRect().width;
const lightIcon = getElement(".light-icon");
const darkIcon = getElement(".dark-icon");
const toggleBtn = getElement(".toggle-btn");
const toggleSpan = getElement(".toggle");
const starIcons = document.querySelectorAll(".icon-img");

let theme = getLocalStorage("themeState");

export const setStorageItem = (name, item) => {
  localStorage.setItem(name, JSON.stringify(item));
};
const changeState = () => {
  const theme = getLocalStorage("themeState");
  let scrn;
  if (bodyWidth < 768) scrn = "mobile";
  else if (bodyWidth < 1440 && bodyWidth >= 768) scrn = "tablet";
  else scrn = "desktop";

  document.body.style.background = `url("./assets/images/pattern-background-${scrn}-${theme.state}.svg") fixed no-repeat,var(--bcg-color) fixed`;

  starIcons.forEach((icon, index) => {
    icon.src = `./assets/images/icon-${theme.star[index]}-${theme.reState}.svg`;
  });
};

window.addEventListener("DOMContentLoaded", () => {
  if (theme.slide == "left") {
    toggleSpan.style.transform = "translateX(-0.375rem)";
    toggleSpan.classList.remove("slide");
    document.documentElement.classList.remove("dark-theme");
  } else {
    toggleSpan.classList.add("slide");
    toggleSpan.style.transform = "translateX(0.375rem)";
    document.documentElement.classList.add("dark-theme");
  }
  changeState();
});

toggleBtn.addEventListener("click", () => {
  toggleSpan.classList.toggle("slide");
  if (toggleSpan.classList.contains("slide")) {
    document.documentElement.classList.add("dark-theme");
    theme = { ...theme, state: "dark", reState: "light", slide: "right" };
    toggleSpan.style.transform = "translateX(0.375rem)";
  } else {
    document.documentElement.classList.remove("dark-theme");
    theme = { ...theme, state: "light", reState: "dark", slide: "left" };
    toggleSpan.style.transform = "translateX(-0.375rem)";
  }
  setStorageItem("themeState", theme);
  changeState();
});
