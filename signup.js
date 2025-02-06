document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // 기본 폼 제출 방지

    // 입력값 가져오기
    const name = document.getElementById('name').value.trim();
    const userId = document.getElementById('id').value.trim();
    const password = document.getElementById('password').value;
    const age = document.getElementById('age').value.trim();
    const gender = document.querySelector('input[name="gender"]:checked')?.value;

    // **입력값 검증 추가**
    if (userId.length > 10) {
        alert("아이디는 최대 10자까지만 가능합니다.");
        return;
    }
    
    if (password.length < 8) {
        alert("비밀번호는 최소 8자 이상이어야 합니다.");
        return;
    }

    if (!gender) {
        alert("성별을 선택해주세요.");
        return;
    }

    // 서버에 보낼 JSON 데이터
    const requestData = {
        age: age ? parseInt(age) : 0,
        gender: gender,
        id: userId,
        name: name,
        password: password
    };

    console.log("요청 데이터:", requestData); // 디버깅 로그

    try {
        const response = await fetch('https://novelshorts-be.duckdns.org/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log("응답 데이터:", result); // API 응답 확인용 로그

        if (response.ok) {
            alert('회원가입 성공! 로그인 페이지로 이동합니다.');
            window.location.href = 'login.html'; // 로그인 페이지로 이동
        } else {
            alert('회원가입 실패: ' + (result.detail ? result.detail.map(e => e.msg).join(', ') : JSON.stringify(result)));
        }
    } catch (error) {
        console.error('회원가입 요청 오류:', error);
        alert('회원가입 중 오류가 발생했습니다.');
    }
});
