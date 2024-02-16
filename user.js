// 첫 화면에 출력될 답변
document.addEventListener("DOMContentLoaded", (event) => {
  let p = document.createElement("p");
  p.classList.add("answer");
  p.innerText = `환영합니다!
    작성하신 코드를 입력해주세요.`;
  $chatList.appendChild(p);
  p.classList.add("done");
});

// 아이콘, 로고 클릭 시 index로 이동
const $banners = document.querySelectorAll(".banner");
$banners.forEach(($banner) => {
  $banner.addEventListener("click", function () {
    location.href = "index.html";
  });
});

// 각 태그별 변수 지정
const $form = document.querySelector("form");
const $chatList = document.querySelector("#chatbox");
const $input1 = document.querySelector("#ipt_code");
const $input2 = document.querySelector("#ipt_describe");

// 두 입력 필드 값 합치는 함수
const combineInputs = () => {
  let input1Value = $input1.value.trim();
  let input2Value = $input2.value.trim();

  // 둘 다 값이 있을 경우, 두 값을 공백으로 구분하여 합친다.
  if (input1Value && input2Value) {
    return input1Value + " " + input2Value;
  }
  // 하나의 값만 있을 경우, 해당 값만 반환한다.
  else if (input1Value) {
    return input1Value;
  } else if (input2Value) {
    return input2Value;
  }
  // 둘 다 값이 없을 경우, null을 반환한다.
  else {
    return null;
  }
};

// openAI API
let url = `https://open-api.jejucodingcamp.workers.dev/`;

// 입력창 크기 자동조절
$input1.addEventListener("input", function () {
  this.style.height = "1px";
  this.style.height = this.scrollHeight + "px";
});

$input2.addEventListener("input", function () {
  this.style.height = "1px";
  this.style.height = this.scrollHeight + "px";
});

// 사용자의 질문
let question;

// 질문과 답변 저장 => data.js에서 import
import data from "./data.js";

// 화면에 뿌려줄 데이터, 질문들
let questionData = [];

// 사용자의 질문을 객체를 만들어서 push
const sendQuestion = (question) => {
  if (question) {
    // 질문을 세 부분으로 나눕니다.
    const parts = [
      "내가 작성한 코드는 " +
        question +
        " 이야. 오류가 있다면 어떤 것인지 알려줘.",
      question + "에 대한 더 좋은(간결한) 풀이가 있는지 알려줘.",
      question + "을(를) 다른 방법으로 풀어볼 수 있는 풀이를 제시해줘.",
    ];
    parts.forEach((part) => {
      data.push({
        role: "user",
        content: part,
      });
    });
    questionData.push({
      role: "user",
      content: question,
    });
  }
};

// 화면에 질문 그려주는 함수
const printQuestion = async () => {
  if (question) {
    let p = document.createElement("p");
    p.classList.add("question");

    questionData.map((el) => {
      let regex = /```([^`]+)```/g; // 백틱 안의 문자열을 찾는 정규표현식
      let match;
      let lastIndex = 0;

      while ((match = regex.exec(el.content)) !== null) {
        // 백틱이 시작되기 전까지의 문자열을 p에 추가
        p.appendChild(
          document.createTextNode(el.content.slice(lastIndex, match.index))
        );
        let pre = document.createElement("pre");
        let code = document.createElement("code");

        // 백틱 제거 및 문자열 시작 부분의 줄바꿈 제거
        let content = match[1].replace(/^\n/, "");
        code.textContent = content;
        hljs.highlightBlock(code);
        pre.appendChild(code);
        p.appendChild(pre);
        lastIndex = regex.lastIndex; // 마지막으로 찾은 위치를 저장
      }
      // 남은 문자열을 p에 추가
      p.appendChild(document.createTextNode(el.content.slice(lastIndex)));
    });
    $chatList.appendChild(p);
    questionData = [];
    question = false;
    // 항상 스크롤 아래에 위치하도록
    $chatList.scrollTop = $chatList.scrollHeight;
  }
};

// 화면에 답변 그려주는 함수
const printAnswer = (answer) => {
  let p = document.createElement("p");
  p.classList.add("answer");

  let regex = /```([^`]+)```/g; // 백틱 안의 문자열을 찾는 정규표현식
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(answer)) !== null) {
    // 백틱이 시작되기 전까지의 문자열을 p에 추가
    let textNode = document.createTextNode(
      answer.slice(lastIndex, match.index)
    );
    textNode.originalText = textNode.textContent;
    textNode.textContent = "";
    p.appendChild(textNode);

    // 백틱이 시작되는 부분에서 .done 클래스를 추가
    p.classList.add("done");

    // 백틱 제거 및 문자열 시작 부분의 줄바꿈 제거
    let content = match[1].replace(/^\n/, "");
    let pre = document.createElement("pre");
    let code = document.createElement("code");
    code.originalText = content;
    code.textContent = "";
    pre.appendChild(code);
    p.appendChild(pre);

    lastIndex = regex.lastIndex; // 마지막으로 찾은 위치를 저장

    // 백틱이 끝나는 부분에서 .done 클래스를 삭제
    p.classList.remove("done");
  }

  // 남은 문자열을 p에 추가
  let remainingText = answer.slice(lastIndex);
  if (remainingText.indexOf("```") === -1) {
    let textNode = document.createTextNode(remainingText);
    textNode.originalText = textNode.textContent;
    textNode.textContent = "";
    p.appendChild(textNode);
  }

  $chatList.appendChild(p);

  let index = 0;
  let nodeIndex = 0;

  // 타이핑 효과(삭제 고려중)
  function typeNextCharacter() {
    if (nodeIndex < p.childNodes.length) {
      let node = p.childNodes[nodeIndex];
      let textNode = node.nodeType === Node.TEXT_NODE ? node : node.firstChild;

      if (index < textNode.originalText.length) {
        textNode.textContent += textNode.originalText.charAt(index);
        index++;

        // 항상 스크롤 아래에 위치하도록
        $chatList.scrollTop = $chatList.scrollHeight;

        let randomInterval = Math.floor(Math.random() * (50 - 30 + 1)) + 30; // 30에서 50 사이의 무작위 밀리초
        setTimeout(typeNextCharacter, randomInterval);
      } else {
        index = 0;
        nodeIndex++;

        // <pre><code></code></pre>를 찾아 코드 하이라이트 효과를 부여
        p.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightBlock(block);
        });

        if (nodeIndex < p.childNodes.length) {
          typeNextCharacter();
        } else {
          p.classList.add("done");
        }
      }
    }
  }
  typeNextCharacter();
};

// api 요청보내는 함수
const apiPost = async () => {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    redirect: "follow",
  })
    .then((res) => res.json())
    .then((res) => {
      console.log(res);
      printAnswer(res.choices[0].message.content);
    })
    .catch((err) => {
      console.log(err);
    });
};

// Shift+Enter 줄바꿈 기능
$input1.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    // shift키 없이 enter키만 눌렸을 때
    event.preventDefault();
    question = combineInputs();
    $input1.value = $input2.value = null;
    $input1.style.height = $input2.style.height = "initial";
    if (question) {
      sendQuestion(question);
      apiPost();
      printQuestion();
    }
  }
});

$input2.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    // shift키 없이 enter키만 눌렸을 때
    event.preventDefault();
    question = combineInputs();
    $input1.value = $input2.value = null;
    $input1.style.height = $input2.style.height = "initial";
    if (question) {
      sendQuestion(question);
      apiPost();
      printQuestion();
    }
  }
});

// submit 기능
$form.addEventListener("submit", function (e) {
  e.preventDefault();
  let combinedInputs = combineInputs();
  if (combinedInputs) {
    // 합쳐진 값이 있을 때만 동작
    question = combinedInputs;
    $input1.value = $input2.value = null;
    sendQuestion(question);
    apiPost();
    printQuestion();
  }
});