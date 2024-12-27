import "./src/src.js";
import { getElement, getLocalStorage1, setStorageItem } from "./src/src.js";

const quizzes = getLocalStorage1("quizzes");
if (!quizzes) {
  window.location.replace("index.html");
}

const loading = getElement(".page-loading");
const pageSection = getElement(".quiz-section");
const navHeader = getElement(".nav-header");
const quizSection = getElement(".quiz-section");

let quizType;

const fetchQuizzes = async () => {
  try {
    const resp = await fetch("./src/data.json");
    if (!resp.ok) {
      pageSection.innerHTML = `<div class="page-error">
      <h1>Sorry, there was an error.</h1>
      <a href="index.html">Back Home</a>
      </div>`;
      loading.style.display = "none";
      console.log("sorry,there was an error");
      throw new Error("sorry,there was an error");
    }
    return resp.json();
  } catch (error) {
    console.log(error);
  }
};

const formatTag = (item) => {
  return item.replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

let currState = getLocalStorage1("currState");

let slide = localStorage.getItem("slide") ? localStorage.getItem("slide") : 0;
// console.log(slide);

const setQuiz = (data, title) => {
  const list = ["A", "B", "C", "D"];

  data.forEach((item, index) => {
    const { answer, options, question } = item;
    let newAnswer = formatTag(answer);
    const optionList = options
      .map((item1, index1) => {
        item1 = formatTag(item1);
        return `<button type="button" class="quiz-btn quiz" data-id=${title}-${index}${
          list[index1]
        }>
              <span class="quiz-icon">${list[index1]}</span>
              <span class ="opt ${
                item1 === newAnswer ? "correct" : ""
              }">${item1}</span>
              <img src="" alt="" class="result" />
            </button>`;
      })
      .join("");

    const element = document.createElement("div");
    element.classList.add("quiz-container", "quiz-cnt");
    element.setAttribute("data-id", `${title}-${index}`);
    const value = index + 1;
    element.innerHTML = `<div class="qst-block">
          <div>
          <p class="qst i-text">Question ${value} of 10</p>
          <p class="qst-text">${formatTag(question)}</p>
          </div>
          <progress class="quiz-progress" min="0" value=${value} max="10"></progress>
        </div>
        <div class="option-block">
          <div class="options option-list">
            ${optionList}
          </div>
          <button type="submit" class="submit-btn btn" data-id="${title.toLowerCase()}Quiz">submit answer</button>
          <p class="answer" style ="opacity:0; display=none;">${newAnswer}</p>
          <button type="button" data-id="${title.toLowerCase()}Quiz" class="next-btn btn">next question</button>
          <p class="error">
            <img src="./assets/images/icon-error.svg" alt="" />
            <span>Please select an answer</span>
          </p>
        </div>`;
    quizSection.appendChild(element);

    const percntg = index * 100;
    element.style.left = `${percntg}%`;
    const nextBtn = element.querySelector(".next-btn");
    const submitBtn = element.querySelector(".submit-btn");
    const err = element.querySelector(".error");

    const submitID = submitBtn.dataset.id;
    quizType = getLocalStorage1(submitID);

    // submit answer
    submitBtn.addEventListener("click", () => {
      const result = currQuizState(submitBtn, err, "submit");
      const options = [...submitBtn.previousElementSibling.children];
      if (result !== undefined) {
        submitBtn.style.display = "block";
        nextBtn.style.display = "none";
        quizType = { ...quizType, submit: "block" };
      } else {
        submitBtn.style.display = "none";
        nextBtn.style.display = "block";
        quizType = { ...quizType, submit: "none" };
        options.forEach((opt) => opt.removeEventListener("click", () => {}));
      }
      // 2nd bug fix (slide:NaN) step 1
      if (!quizType.hasOwnProperty("slide")) {
        quizType = { ...quizType, slide: 0 };
      }
      setStorageItem(submitID, quizType);
    });

    // next slide
    nextBtn.addEventListener("click", () => {
      const id = nextBtn.dataset.id;
      quizType = getLocalStorage1(id);
      quizType = { ...quizType, submit: "block" };
      let score = quizType.score ? quizType.score : 0;
      // 2nd bug fix (slide:NaN) step 2
      let slide = quizType.slide;

      const ans = nextBtn.parentElement.querySelector(".right");
      slide++;
      container.forEach((item) => {
        item.style.transform = `translateX(-${slide * 100}%)`;
      });
      if (ans !== null) {
        score++;
      }

      if (slide > 9) {
        const navHeaderCon = navHeader.innerHTML;
        const headerClass = [...navHeader.classList][2];
        const result = finalResult(navHeaderCon, score, headerClass, id);
        quizSection.appendChild(result);
        console.log(result, headerClass, id);
      }

      quizType = { ...quizType, slide, score };
      setStorageItem(id, quizType);
      localStorage.setItem("slide", slide);
    });
  });

  // Preserve state for quiz slide on session/page refresh
  const container = [...quizSection.querySelectorAll(".quiz-container")];
  container.forEach((item) => {
    item.style.transform = `translateX(-${parseInt(slide) * 100}%)`;

    const err = item.querySelector(".error");
    const optionList = [...item.querySelectorAll(".quiz-btn")];
    quizBtnFunctionality(optionList, err);
  });

  // Preserve state for clicked button on session/page refresh
  const curItem = getLocalStorage1("currState");
  const { id, text } = curItem;
  // console.log(quizType);
  const currContainer = container.find((cur) => cur.dataset.id === id);
  if (currContainer) {
    [...currContainer.querySelectorAll(".quiz-btn")].forEach((btn) => {
      if (btn.children[1].textContent === text) btn.classList.add("active");
    });
  }
};

const finalResult = (con, score, iClass, id) => {
  const element = document.createElement("div");
  element.classList.add("results", "quiz-cnt");
  element.innerHTML = `<h1>
        <span>Quiz completed</span> <br />
        <span class="_score">You scored...</span>
      </h1>
      <div>
      <article class="result-container">
        <div>
          <div class="quiz ${iClass}">
            ${con}
          </div>
          <div class="score-con">
            <span class="score">${score}</span>
            <span>out of 10</span>
          </div>
        </div>
      </article>
      <a href="index.html" class="btn play">play again</a>
      </div>`;

  element.querySelector(".btn.play").addEventListener("click", () => {
    localStorage.removeItem(id);
  });
  return element;
};

const quizSessionData = (quiz, pageID) => {
  const { icon, title } = quiz[0];
  if (quiz) {
    const quizID = `${pageID}Quiz`;
    let quizClass = title.slice(0, 1).toLowerCase();
    navHeader.classList.add(`quiz`, `${quizClass}-quiz`);
    navHeader.innerHTML = `<img src="${icon}" alt="" class="header-icon quiz-icon" /> <span>${title}</span>`;
    loading.style.display = "none";

    const quizType = getLocalStorage1(`${quizID}`);
    if (quizType) {
      if (
        quizType.hasOwnProperty("newID") ||
        quizType.hasOwnProperty("slide")
      ) {
        const { id, text, slide } = quizType;
        currState = { id, text };
        setStorageItem("currState", currState);
        localStorage.setItem("slide", slide);
        const activeBtn = document.querySelectorAll(".quiz-btn");
        activeBtn.forEach((btn) => {
          const btnText = btn.children[1].textContent;
          if (btnText === text) btn.classList.add("active");
        });
      } else {
        localStorage.removeItem("currState");
        localStorage.removeItem("slide");
      }
    }

    // Session page slide && button selection
    const { id, submit } = quizType;
    if (submit == "none") {
      const item = [...quizSection.children].find(
        (child) => child.dataset.id === id
      );
      if (item) {
        // console.log(item);
        const submitBtn = item.querySelector(".submit-btn");
        const nextBtn = item.querySelector(".next-btn");
        currQuizState(submitBtn);
        submitBtn.style.display = "none";
        nextBtn.style.display = "block";
      }
    }
    // Load final result on session/page refresh
    const slide = localStorage.getItem("slide");
    if (slide > 9) {
      const navHeaderCon = navHeader.innerHTML;
      const headerClass = [...navHeader.classList][2];
      const score = quizType.score;
      const result = finalResult(navHeaderCon, score, headerClass, quizID);
      quizSection.appendChild(result);
      // console.log(result);
    }
  }
};
const init = async () => {
  const data = await fetchQuizzes();
  const params = new URLSearchParams(window.location.search);
  const pageID = params.get("id");
  const quiz = data.quizzes.filter((item) => {
    const title = item.title.toLowerCase();
    if (title === pageID) return item;
  });

  const quizzes = getLocalStorage1("quizzes");
  const quizKey = quiz[0].title.toLowerCase();
  if (!quizzes || !quizzes.hasOwnProperty(quizKey)) {
    window.location.replace("index.html");
  }
  setQuiz(quiz[0].questions, quiz[0].title);
  quizSessionData(quiz, pageID);
};

const quizBtnFunctionality = (item, err) => {
  item.forEach((btn) => {
    btn.addEventListener("click", () => {
      err.style.display = "none";
      btn.classList.add("active");
      item.forEach((btn1) => {
        if (btn1 !== btn) btn1.classList.remove("active");
        else {
          let text = btn.children[1].textContent;
          const id = btn.parentElement.parentElement.parentElement.dataset.id;
          let newID = id.slice(0, -2).toLowerCase();
          currState = { ...currState, id, text };
          quizType = { ...quizType, newID, ...currState, submit: "block" };
          setStorageItem("currState", currState);
          setStorageItem(`${newID}Quiz`, quizType);
        }
      });
    });
  });
};

const currQuizState = (con, err, type) => {
  const optionBlock = con.previousElementSibling;
  const choiceBtn = optionBlock.querySelector(".active");

  if (type) {
    if (!choiceBtn) {
      err.style.display = "flex";
      return "error";
    }
  }

  choiceBtn.classList.remove("active");
  const ans = con.nextElementSibling.textContent;
  const choice = choiceBtn.children[1].textContent;

  if (choice === ans) {
    choiceBtn.classList.add("right");
    choiceBtn.children[2].src = "./assets/images/icon-correct.svg";
  } else {
    choiceBtn.classList.add("wrong");
    choiceBtn.children[2].src = "./assets/images/icon-incorrect.svg";
    optionBlock.querySelector(".correct").nextElementSibling.src =
      "./assets/images/icon-correct.svg";
  }

  const btns = [...optionBlock.children];
  btns.forEach((btn) => (btn.disabled = true));
};

window.addEventListener("DOMContentLoaded", () => {
  init();
});
