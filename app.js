import "./src/src.js";
import { getLocalStorage1, setStorageItem } from "./src/src.js";

// bug fix for current slide for each quiz
[...document.querySelectorAll("a.quiz")].forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const linkAddress = link.getAttribute("href");
    const quiz = linkAddress.slice(15);

    // check that pages.html is landing from index.html
    let quizzes = {};
    quizzes[quiz] = "";
    setStorageItem("quizzes", quizzes);

    const quizType = getLocalStorage1(`${quiz}Quiz`);
    if (quizType) {
      const quizSlide = quizType.slide;
      let slide = localStorage.getItem("slide");
      slide = quizSlide;
      localStorage.setItem("slide", slide);
      window.location.assign(linkAddress);
    }
    console.log(quiz);
  });
});
