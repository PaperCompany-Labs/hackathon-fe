console.log("🔥 login.js가 실행됨!"); // JavaScript가 실행되는지 확인


document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // 기본 폼 제출 방지
    console.log("🔥 로그인 버튼이 클릭됨!");
    const userId = document.getElementById('id').value.trim();
    const password = document.getElementById('password').value;

    if (userId.length > 10) {
        alert("아이디는 최대 10자까지만 입력 가능합니다.");
        return;
    }

    if (password.length < 8) {
        alert("비밀번호는 최소 8자 이상이어야 합니다.");
        return;
    }

    const requestData = {
        id: userId,
        password: password
    };

    try {
        console.log("로그인 요청 데이터:", requestData);

        const response = await fetch('https://novelshorts-be.duckdns.org/user/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData),
        });
        

        console.log("API 응답 상태 코드:", response.status); // HTTP 상태 코드 출력

        const textResponse = await response.text(); // JSON이 아닐 가능성 대비
        console.log("응답 원본 데이터:", textResponse);

        try {
            var result = JSON.parse(textResponse); // JSON 파싱 시도
        } catch (jsonError) {
            console.error("JSON 파싱 오류:", jsonError);
            alert("서버 응답이 올바른 JSON 형식이 아닙니다.");
            return;
        }

        console.log("파싱된 응답 데이터:", result);

        if (response.ok) {
            alert("로그인 성공!");

            // access_token을 localStorage에 저장
            localStorage.setItem("access_token", result.access_token);

            // shorts.html로 이동
            //window.location.href = "shorts.html";
        } else {
            alert("로그인 실패: " + (result.detail || "아이디 또는 비밀번호를 확인하세요."));
        }
    } catch (error) {
        console.error("로그인 요청 오류:", error);
        alert("로그인 중 오류가 발생했습니다. (자세한 내용은 콘솔을 확인하세요.)");
    }
});
