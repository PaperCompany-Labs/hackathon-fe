document.getElementById('likeButton').addEventListener('click', async () => {
    const token = localStorage.getItem('access_token'); // 저장된 토큰 가져오기
    console.log("🔍 저장된 토큰:", token); // 디버깅용

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
                'Authorization': `Bearer ${token}` // ✅ 토큰 추가
            }
        });

        console.log("🔍 요청 헤더 확인:", {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
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

// Comment Input
document.getElementById('submitComment').addEventListener('click', async () => {
    const token = localStorage.getItem('access_token');
    console.log("🔍 저장된 토큰:", token);

    const commentText = document.getElementById('commentInput').value.trim(); // text 가져오기

    if (!token) {
        alert('로그인이 필요합니다!');
        window.location.href = "login.html";
        return;
    }

    if (!commentText) {
        alert('댓글을 입력하세요!');
        return;
    }

    try {
        const response = await fetch('https://novelshorts-be.duckdns.org/shorts/1/comments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content: commentText })
        });

        console.log("🔍 요청 헤더 확인:", {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
        });

        const responseData = await response.json();

        if (response.ok) {
            alert('댓글이 작성되었습니다!');
            addCommentToUI(commentText); // UI에 댓글 추가
            document.getElementById('commentInput').value = ''; // 입력 필드 초기화
        } else {
            alert('댓글 작성 실패: ' + responseData.message);
        }
    } catch (error) {
        console.error('댓글 작성 요청 실패:', error);
        alert('네트워크 오류가 발생했습니다!');
    }
});

// UI에 댓글 추가하는 함수
function addCommentToUI(commentText) {
    const commentDiv = document.createElement('div');
    commentDiv.classList.add('comment-item');
    commentDiv.textContent = commentText;
    commentList.insertBefore(commentDiv, commentList.firstChild);
}

// 댓글 불러오기 함수
async function loadComments() {
    try {
        const response = await fetch('https://novelshorts-be.duckdns.org/shorts/1/comments', {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        const responseData = await response.json();

        if (response.ok) {
            commentList.innerHTML = ''; // 기존 댓글 초기화

            responseData.comments.forEach(comment => {
                addCommentToUI(comment.content);
            });
        } else {
            console.error('댓글 불러오기 실패:', responseData);
        }
    } catch (error) {
        console.error('댓글 불러오기 요청 실패:', error);
    }
}