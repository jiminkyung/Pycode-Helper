document.addEventListener("DOMContentLoaded", (event) => {
  let p = document.createElement("p");
  p.classList.add("answer");
  p.innerText = `환영합니다!
    작성하신 코드를 입력해주세요.`;
  $chatList.appendChild(p);
});

const $form = document.querySelector("form");
const $input = document.querySelector("textarea");
const $chatList = document.querySelector("#chatbox");

// openAI API
let url = `https://open-api.jejucodingcamp.workers.dev/`;

// 사용자의 질문
let question;

// 질문과 답변 저장
let data = [
  {
    role: "system",
    content: "assistant는 Python coding에 도음을 주는 친절한 답변가이다.",
  },
];

// 화면에 뿌려줄 데이터, 질문들
let questionData = [];

// input에 입력된 질문 받아오는 함수
// $input.addEventListener("input", (e) => {
//     question = e.target.value;
// });

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
// const printAnswer = (answer) => {
//     let p = document.createElement("p");
//     p.classList.add("answer");
//     p.innerText = answer;
//     $chatList.appendChild(p);
// };
const printAnswer = (answer) => {
    let p = document.createElement("p");
    p.classList.add("answer");

    let regex = /```([^`]+)```/g;  // 백틱 안의 문자열을 찾는 정규표현식
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(answer)) !== null) {
        // 백틱이 시작되기 전까지의 문자열을 p에 추가
        p.appendChild(document.createTextNode(answer.slice(lastIndex, match.index)));

        let pre = document.createElement("pre");
        let code = document.createElement("code");

        // 백틱 제거 및 문자열 시작 부분의 줄바꿈 제거
        let content = match[1].replace(/^\n/, '');
        code.textContent = content;
        hljs.highlightBlock(code);

        pre.appendChild(code);
        p.appendChild(pre);

        lastIndex = regex.lastIndex;  // 마지막으로 찾은 위치를 저장
    }

    // 남은 문자열을 p에 추가
    p.appendChild(document.createTextNode(answer.slice(lastIndex)));

    $chatList.appendChild(p);

    let index = 0;

    function typeNextCharacter() {
        if (p.textContent.length < answer.length) {
            p.textContent += answer.charAt(index);
            index++;
            if (index <= answer.length - 1) {
                let randomInterval = Math.floor(Math.random() * (50 - 1)) + 49; // 1에서 50 사이의 무작위 밀리초
                setTimeout(typeNextCharacter, randomInterval);
            } else {
                p.classList.add("done");
                
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

// submit
// $form.addEventListener("submit", (e) => {
//     e.preventDefault();
//     $input.value = null;
//     sendQuestion(question);
//     apiPost();
//     printQuestion();
// });

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
