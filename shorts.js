let isRequestInProgress = false;

document.getElementById('likeButton').addEventListener('click', async () => {
    if (isRequestInProgress) return; // 이미 요청 중이면 무시
    isRequestInProgress = true;

    const token = localStorage.getItem('access_token');
    const likeIcon = document.querySelector('#likeButton i');
    const likeUrl = 'https://novelshorts-be.duckdns.org/shorts/502/like';

    if (!token) {
        alert('로그인이 필요합니다!');
        window.location.href = "login.html"; 
        isRequestInProgress = false;
        return;
    }

    try {
        let response;
        
        if (likeIcon.classList.contains('far')) {
            response = await fetch(likeUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        } else {
            response = await fetch(likeUrl, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
        }

        if (response.ok) {
            updateLikeUI(likeIcon);
        } else {
            console.error(`서버 응답 실패: ${response.status}`);
            //alert('오류가 발생했습니다!');
        }
    } catch (error) {
        console.error('좋아요 요청 실패:', error);
        //alert('네트워크 오류가 발생했습니다!');
    } finally {
        setTimeout(() => {
            isRequestInProgress = false; // 요청 후 500ms 동안 클릭 방지
        }, 500);
    }
});

function updateLikeUI(likeIcon) {
    if (likeIcon.classList.contains('far')) {
        likeIcon.classList.remove('far', 'fa-heart');
        likeIcon.classList.add('fas', 'fa-heart');
        likeIcon.style.color = 'red';
    } else {
        likeIcon.classList.remove('fas', 'fa-heart');
        likeIcon.classList.add('far', 'fa-heart');
        likeIcon.style.color = 'white';
    }
}
