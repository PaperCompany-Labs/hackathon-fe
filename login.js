document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault(); // 기본 폼 제출 방지

    const userId = document.getElementById('id').value.trim();
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://novelshorts-be.duckdns.org/user/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: userId, password: password })
        });

        const data = await response.json();
        console.log("API 응답 상태 코드:", response.status);
        console.log("응답 원본 데이터:", data);

        if (response.status === 200 && data.access_token) {
            // 토큰과 유저 번호를 localStorage에 저장 (다른 페이지에서도 사용 가능)
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('user_no', data.user_no);
            console.log("로그인 후 저장된 토큰:", localStorage.getItem('access_token'));
            console.log("로그인 후 저장된 사용자 번호:", localStorage.getItem('user_no'));

            window.location.href = "shorts.html"; // 로그인 후 이동
        } else {
            //alert('로그인 실패! 아이디 또는 비밀번호를 확인하세요.');
        }
    } catch (error) {
        console.error('로그인 요청 실패:', error);
        alert('네트워크 오류가 발생했습니다!');
    }
});
