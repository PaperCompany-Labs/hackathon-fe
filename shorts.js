document.addEventListener('DOMContentLoaded', () => {
    // 게시글 불러오기 함수 호출
    loadPosts();
  
    // 좋아요 버튼 관련 코드
    let isRequestInProgress = false;
  
    document.getElementById('likeButton').addEventListener('click', async () => {
        if (isRequestInProgress) return; // 이미 요청 중이면 무시
        isRequestInProgress = true;
  
        const token = localStorage.getItem('access_token');
        const likeIcon = document.querySelector('#likeButton i');
        // 좋아요 대상 게시글 번호 예시: 502
        const likeUrl = 'https://novelshorts-be.duckdns.org/shorts/502/like';
  
        if (!token) {
            alert('로그인이 필요합니다!');
            window.location.href = "login.html";
            isRequestInProgress = false;
            return;
        }
  
        try {
            let response;
            
            // 아이콘이 '빈 하트'(좋아요 안한 상태)면 POST, 아니라면 DELETE 요청
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
            }
        } catch (error) {
            console.error('좋아요 요청 실패:', error);
        } finally {
            // 요청 후 500ms 동안 클릭 방지
            setTimeout(() => {
                isRequestInProgress = false;
            }, 500);
        }
    });
  });
  
  // 게시글을 가져와서 페이지에 표시하는 함수
  async function loadPosts() {
      try {
          const response = await fetch('https://novelshorts-be.duckdns.org/shorts?limit=10&offset=0', {
              method: 'GET',
              headers: {
                  'Accept': 'application/json'
              }
          });
          if (!response.ok) {
              console.error('게시글 불러오기 실패', response.status);
              return;
          }
          const posts = await response.json();
  
          // 게시글들을 표시할 HTML 요소 (반드시 HTML에 해당 id의 요소가 있어야 합니다)
          const container = document.getElementById('postsContainer');
          container.innerHTML = ''; // 기존 내용 초기화
  
          posts.forEach(post => {
              // 게시글 하나를 감싸는 div 생성
              const postDiv = document.createElement('div');
              postDiv.classList.add('post');
  
              // 게시글 제목 생성 (있다면)
              if (post.title) {
                  const title = document.createElement('h2');
                  title.textContent = post.title;
                  postDiv.appendChild(title);
              }
  
              // 게시글 내용 생성
              const content = document.createElement('p');
              content.textContent = post.content;
              postDiv.appendChild(content);
  
              // 음악 재생을 위한 오디오 플레이어 생성 (music URL이 있을 경우)
              if (post.music) {
                  const audio = document.createElement('audio');
                  audio.controls = true;
                  const source = document.createElement('source');
                  source.src = post.music;
                  
                  source.type = 'audio/wav';
                  audio.appendChild(source);
                  postDiv.appendChild(audio);
              }
  
              container.appendChild(postDiv);
          });
      } catch (error) {
          console.error('게시글 불러오기 오류:', error);
      }
  }
  
  // 좋아요 아이콘 UI 업데이트 함수
  function updateLikeUI(likeIcon) {
      if (likeIcon.classList.contains('far')) {
          // 좋아요 추가 시: 빈 하트(far)를 채워진 하트(fas)로 변경하고 색상 변경
          likeIcon.classList.remove('far', 'fa-heart');
          likeIcon.classList.add('fas', 'fa-heart');
          likeIcon.style.color = 'red';
      } else {
          // 좋아요 취소 시: 채워진 하트(fas)를 빈 하트(far)로 변경하고 색상 복원
          likeIcon.classList.remove('fas', 'fa-heart');
          likeIcon.classList.add('far', 'fa-heart');
          likeIcon.style.color = 'white';
      }
  }
  
    // 댓글 작성 이벤트
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

        const requestData = {
            novel_shorts_no : 1,
            content : commentText
        };

        console.log("요청 데이터:", requestData); // 디버깅 로그

        try {
            const response = await fetch('https://novelshorts-be.duckdns.org/shorts/comment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });
            
            const responseData = await response.json();
            console.log("서버 응답:", responseData); // API 응답 확인

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
        const currentPost = posts[currentIndex];
        
        // 현재 게시글 번호(no)를 이용해서 좋아요 URL 구성
        const commentUrl = `https://novelshorts-be.duckdns.org/shorts/${currentPost.no}/like`;

        try {
            const response = await fetch(commentUrl, {
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
  