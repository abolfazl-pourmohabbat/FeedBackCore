// =============================================== Global variables =======================================================

const MAX_CHARS = 150;
const API_URL = "https://bytegrad.com/course-assets/js/1/api";

// =================================================== Elements ==========================================================

// getting elements from document
const textareaInput = document.querySelector("#textarea");
const counter = document.querySelector(".counter");
const form = document.querySelector(".form");
const feedbacks = document.querySelector(".feedbacks");
const submitBtn = document.querySelector(".submit-btn");
const spinner = document.querySelector(".spinner");
const hashtags = document.querySelector(".hashtags");
counter.textContent = MAX_CHARS;

// =================================================== Functions ==========================================================

// remove class with timeout (function)
function removeClass(element, className, timeout) {
  form.classList.add(className);
  setTimeout(() => element.classList.remove(className), timeout);
}

// textareaInput event function
function inputCondition() {
  // Change counter value
  let charsLength = textareaInput.value.length;
  counter.textContent = MAX_CHARS - charsLength;

  // Change counter when the number of characters you entered exceeds the maximum allowed.
  if (counter.textContent < 0) {
    counter.classList.replace("text-gray", "text-red");
  } else {
    counter.classList.replace("text-red", "text-gray");
  }

  // Getting the input value at the moment you type
  let text = textareaInput.value;

  // Conditions for controlling the input you enter
  if (
    !text.includes("#") ||
    text === "" ||
    text.length < 5 ||
    counter.classList.contains("text-red")
  ) {
    removeClass(form, "form--invalid", 1500);
    textareaInput.focus();
    return;
  } else {
    removeClass(form, "form--valid", 1500);
  }
}

// Form event function
function preventSubmit(event) {
  // Prevent page refresh when clicking the submit button
  event.preventDefault();

  let text = textareaInput.value;

  // Conditions for entering input value
  inputCondition();

  const hashtag = text.split(" ").find((words) => words.includes("#")),
    company = hashtag.substring(1),
    badgeLetter = company.substring(0, 1).toUpperCase(),
    upvoteCount = 0,
    daysAgo = 0;

  const INFO = {
    company,
    badgeLetter,
    upvoteCount,
    daysAgo,
    text,
  };

  createfeedEL(INFO);

  // sent feedback to server
  fetch(`${API_URL}/feedbacks`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(INFO),
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("PROBLEM !!!");
      }
    })
    .catch((error) => {
      console.log(error);
    });

  // Clear form after clicking the submit button
  form.reset();
  // یا textareaInput.value = "";
  // Remove focus from the submit button after clicking it
  submitBtn.blur();
  // Reset counter value
  counter.textContent = MAX_CHARS;
}

function createfeedEL(infoObject) {
  let feedItem = `
  <li class="feedback">
            <button class="upvote">
                <i class="fa-solid fa-caret-up upvote__icon"></i>
                <span class="upvote__count">${infoObject.upvoteCount}</span>
            </button>
            <section class="feedback__badge">
                <p class="feedback__letter">${infoObject.badgeLetter}</p>
            </section>
            <div class="feedback__content">
                <p class="feedback__company">${infoObject.company}</p>
                <p class="feedback__text">${infoObject.text}</p>
            </div>
            <p class="feedback__date">${infoObject.daysAgo === 0 ? "NEW" : `${infoObject.daysAgo}d`}</p>
        </li>
  `;

  feedbacks.insertAdjacentHTML("beforeend", feedItem);
}

// feedback event function
function clickHandler(event) {
  const clickedEL = event.target;
  const upvoteButton = clickedEL.closest(".upvote");

  if (upvoteButton) {
    const upvoteCount = upvoteButton.querySelector(".upvote__count");
    const upvoteIcon = upvoteButton.querySelector(".upvote__icon");

    upvoteButton.classList.toggle("upvote--active");
    const isUpvoted = upvoteButton.classList.contains("upvote--active");

    if (isUpvoted) {
      upvoteCount.textContent++;
      upvoteIcon.classList.add("hidden");
    } else {
      upvoteCount.textContent--;
      upvoteIcon.classList.remove("hidden");
    }
  } else {
    clickedEL.closest(".feedback").classList.toggle("feedback--expand");
  }
}

// feedback event function
function hashtagClickHandler(event) {
  const clickedEL = event.target;
  const feedbackELs = feedbacks.querySelectorAll(".feedback");

  if (clickedEL.className === "hashtags") return;

  const companyHashtag = clickedEL.textContent.substring(1).trim();
  feedbackELs.forEach((feedbackEL) => {
    feedbackEL.classList.remove("hidden");
    const companies = feedbackEL.querySelectorAll(".feedback__company");

    companies.forEach((company) => {
      const companyName = company.textContent;
      if (clickedEL.className === "Reset") {
        feedbackELs.forEach((feedbackEL) => {
          feedbackEL.classList.remove("hidden");
        });
        return;
      } else if (companyName === companyHashtag) return;

      feedbackEL.classList.add("hidden");
    });
  });
}

//====================================================== Events ==========================================================

textareaInput.addEventListener("input", inputCondition);

form.addEventListener("submit", preventSubmit);

feedbacks.addEventListener("click", clickHandler);

hashtags.addEventListener("click", hashtagClickHandler);

//============================================ fetch Api (Saved Feedbacks) ===============================================

fetch(`${API_URL}/feedbacks`)
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    spinner.remove();
    const savedFeedbacksObj = data.feedbacks;
    savedFeedbacksObj.forEach((feedback) => createfeedEL(feedback));
  })
  .catch(
    (error) =>
      (feedbacks.textContent =
        "Faild to load feedback items! please check your internet or contact support."),
  );
