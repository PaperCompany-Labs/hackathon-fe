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
  
  // 댓글 추가 함수
  function addCommentToUI(comment, cm_user_no) {
    const commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-item");

    // 현재 로그인한 사용자 번호 가져오기
    const currentUserNo = localStorage.getItem("user_no");

    commentDiv.innerHTML = `
      <span class="comment-content">${comment}</span>
      <div class="comment-actions"></div>
    `;

    const actionsContainer = commentDiv.querySelector(".comment-actions");

    // 댓글 작성자와 현재 로그인한 사용자가 같을 때만 수정 & 삭제 버튼 추가
    if (currentUserNo && Number(currentUserNo) === cm_user_no) {
      const editButton = document.createElement("button");
      editButton.classList.add("edit-comment");
      editButton.innerHTML = "✏️";
      editButton.addEventListener("click", () => editComment(commentDiv));

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-comment");
      deleteButton.innerHTML = "❌";
      deleteButton.style.color = "red";
      deleteButton.addEventListener("click", () => deleteComment(commentDiv));

      actionsContainer.appendChild(editButton);
      actionsContainer.appendChild(deleteButton);
    }

    document.getElementById("commentList").prepend(commentDiv);
  }