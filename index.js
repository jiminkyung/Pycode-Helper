document.addEventListener('DOMContentLoaded', (event) => {
    let p = document.createElement("p");
    p.classList.add("answer");
    p.innerText = `환영합니다!
    작성하신 코드를 입력해주세요.`
    $chatList.appendChild(p);
});

const $form = document.querySelector("form");
const $input = document.querySelector("input");
const $chatList = document.querySelector("#chatbox");

$input.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {  // 엔터키가 눌렸을 때
        if (event.shiftKey) {  // 쉬프트키와 함께 눌렸을 때
            event.preventDefault();  // 기본 동작(폼 제출)을 막음
            // 줄바꿈 추가
            this.value += "\n";
        } else {
            // 여기에 엔터키만 눌렸을 때 실행할 코드를 넣음
            // 예: sendButton.click();
        }
    }
});
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
$input.addEventListener("input", (e) => {
    question = e.target.value;
});

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
        // 백틱 3개로 시작하고 끝나는 경우
        if (el.content.startsWith('```') && el.content.endsWith('```')) {
            let pre = document.createElement("pre");
            pre.textContent = el.content.slice(3, -3); // 백틱 제거
            p.appendChild(pre);
        } else {
            p.textContent = el.content;
        }
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

    if (answer.startsWith('```') && answer.endsWith('```')) {
        let pre = document.createElement("pre");
        pre.textContent = answer.slice(3, -3);  // 백틱 제거
        p.appendChild(pre);
    } else {
        p.textContent = answer;
    }

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
$form.addEventListener("submit", (e) => {
    e.preventDefault();
    $input.value = null;
    sendQuestion(question);
    apiPost();
    printQuestion();
});

