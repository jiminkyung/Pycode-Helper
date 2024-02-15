
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
const $banners = document.querySelectorAll(".banner")
$banners.forEach(($banner) => {
  $banner.addEventListener("click", function() {
    location.href = "index.html";
  });
});

// 각 태그별 변수 지정
const $form = document.querySelector("form");
const $input = document.querySelector("textarea");
const $chatList = document.querySelector("#chatbox");

// openAI API
let url = `https://open-api.jejucodingcamp.workers.dev/`;

// 입력창 크기 자동조절
$input.addEventListener("input", function() {
  this.style.height = "1px";
  this.style.height = this.scrollHeight + "px";
})

// 사용자의 질문
let question;

// 질문과 답변 저장
import data from './data.js';

// 화면에 뿌려줄 데이터, 질문들
let questionData = [];

// 사용자의 질문을 객체를 만들어서 push
const sendQuestion = (question) => {
  if (question) {
    data.push({
      role: "user",
      content: question,
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
  }
};

// 화면에 답변 그려주는 함수
const printAnswer = (answer) => {
    let p = document.createElement("p");
    p.classList.add("answer");

    let regex = /```([^`]+)```/g;  // 백틱 안의 문자열을 찾는 정규표현식
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(answer)) !== null) {
        // 백틱이 시작되기 전까지의 문자열을 p에 추가
        let textNode = document.createTextNode(answer.slice(lastIndex, match.index));
        textNode.originalText = textNode.textContent;
        textNode.textContent = '';
        p.appendChild(textNode);

        // 백틱 제거 및 문자열 시작 부분의 줄바꿈 제거
        let content = match[1].replace(/^\n/, '');
        let pre = document.createElement("pre");
        let code = document.createElement("code");
        code.originalText = content;
        code.textContent = '';
        pre.appendChild(code);
        p.appendChild(pre);

        lastIndex = regex.lastIndex;  // 마지막으로 찾은 위치를 저장
    }

    // 남은 문자열을 p에 추가
    let remainingText = answer.slice(lastIndex);
    if (remainingText.indexOf("```") === -1) {
        let textNode = document.createTextNode(remainingText);
        textNode.originalText = textNode.textContent;
        textNode.textContent = '';
        p.appendChild(textNode);
    }

    $chatList.appendChild(p);

    let index = 0;
    let nodeIndex = 0;

    function typeNextCharacter() {
        if (nodeIndex < p.childNodes.length) {
            let node = p.childNodes[nodeIndex];
            let textNode = node.nodeType === Node.TEXT_NODE ? node : node.firstChild;
            
            if (index < textNode.originalText.length) {
                textNode.textContent += textNode.originalText.charAt(index);
                index++;
            }

            if (index < textNode.originalText.length) {
                let randomInterval = Math.floor(Math.random() * (50 - 1)) + 49; // 1에서 50 사이의 무작위 밀리초
                setTimeout(typeNextCharacter, randomInterval);
            } else {
                index = 0;
                nodeIndex++;
                if (nodeIndex < p.childNodes.length) {
                    typeNextCharacter();
                } else {
                    p.classList.add("done");
                    p.querySelectorAll('pre code').forEach((block) => {
                        hljs.highlightBlock(block);
                    });
                }
            }
        }
    }

    typeNextCharacter();
};



// api 요청보내는 함수
const apiPost = async () => {
  const result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    redirect: "follow",
  })
    .then((res) => res.json())
    .then((res) => {
      printAnswer(res.choices[0].message.content);
    })
    .catch((err) => {
      console.log(err);
    });
};

//  Shift+Enter 줄바꿈 기능
$input.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    // shift키 없이 enter키만 눌렸을 때
    event.preventDefault();
    question = $input.value;
    $input.value = null;
    sendQuestion(question);
    apiPost();
    printQuestion();
  }
});

// submit 기능
$form.addEventListener("submit", function (e) {
  e.preventDefault();
  if ($input.value.trim() !== "") {
    // 입력 필드가 비어있지 않을때만 동작
    question = $input.value;
    $input.value = null;
    sendQuestion(question);
    apiPost();
    printQuestion();
  }
});
