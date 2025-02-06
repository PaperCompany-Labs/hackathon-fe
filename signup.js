document.getElementById('likeButton').addEventListener('click', async () => {
    const token = localStorage.getItem('access_token'); // 저장된 토큰 가져오기
    console.log("shorts.html에서 저장된 토큰:", localStorage.getItem('access_token'));
    if (!token) {
        alert('로그인이 필요합니다!');
        window.location.href = "login.html"; // 로그인 페이지로 이동
        return;
    }

    try {
        const response = await fetch('https://novelshorts-be.duckdns.org/shorts/1/like', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}` // 토큰 추가
            }
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response body:', responseText);

        if (response.status === 200) {
            alert('좋아요를 눌렀습니다!');
            document.getElementById('likeButton').classList.add('liked'); // 스타일 변경 가능
        } else if (response.status === 400) {
            alert('이미 좋아요를 눌렀습니다!');
        } else {
            alert('오류가 발생했습니다! 서버 응답: ' + responseText);
        }
    } catch (error) {
        console.error('좋아요 요청 실패:', error);
        alert('네트워크 오류가 발생했습니다! ' + error.message);
    }
});
