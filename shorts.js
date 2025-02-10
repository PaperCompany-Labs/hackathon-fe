document.addEventListener('DOMContentLoaded', () => {
  // 전역 변수 및 DOM 요소들
  let posts = [];
  let currentIndex = 0;
  let isRequestInProgress = false;
  
  // 추가된 전역 변수
  let startY = 0;  // 터치/마우스 시작 위치 (Y축)
  let isMouseDown = false;  // 마우스를 누르고 있는지 확인하는 변수

  const postDisplay = document.getElementById('postDisplay');
  const postTitle = document.getElementById('postTitle');
  const postContent = document.getElementById('postContent');
  const postAudio = document.getElementById('postAudio');
  const likeButton = document.getElementById('likeButton');
  const commentButton = document.getElementById('commentButton');
  const commentBox = document.getElementById('commentBox');
  const closeCommentBox = document.getElementById('closeCommentBox');
  const commentList = document.getElementById('commentList');
  const commentInput = document.getElementById('commentInput');
  const submitComment = document.getElementById('submitComment');
  const swipeArea = document.querySelector('.swipe-area');
  
  // 노래 처음에는 재생
  postAudio.play();
  
  // 게시글 불러오기
  async function loadPosts() {
    try {
      // 사용자 토큰을 헤더에 포함
      const token = localStorage.getItem('access_token');
      const headers = { 'Accept': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('https://novelshorts-be.duckdns.org/shorts?limit=30&offset=0', {
        method: 'GET',
        headers: headers
      });
      if (!response.ok) {
        console.error('게시글 불러오기 실패', response.status);
        return;
      }
      posts = await response.json();
      shuffleArray(posts);
      if (posts.length > 0) updatePostDisplay();
    } catch (error) {
      console.error('게시글 불러오기 오류:', error);
    }
  }

  // 게시글 업데이트 함수
  function updatePostDisplay() {
    const currentPost = posts[currentIndex];
    postTitle.textContent = currentPost.title || '';
    postContent.textContent = currentPost.content || '';

    if (currentPost.music) {
      postAudio.src = currentPost.music;
    } else {
      postAudio.src = '';
    }

    // 좋아요 아이콘 초기화: 
    // 게시글의 is_like 필드가 true이면 빨간 하트(눌린 상태),
    // 아니면 빈 하트로 표시
    const likeIcon = likeButton.querySelector('i');
    setLikeUI(likeIcon, currentPost.is_like);
  }

  // 배열 섞기 함수 (Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // 댓글 불러오기 함수 (현재 게시글의 no를 이용)
  async function loadComments() {
    try {
      const currentPost = posts[currentIndex];
      const response = await fetch(`https://novelshorts-be.duckdns.org/shorts/${currentPost.no}/comments`, {
        method: "GET",
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) {
        console.error("댓글 불러오기 실패", response.status);
        return;
      }
      const data = await response.json();
      console.log("현재 쇼츠 번호:", currentPost.no);
      console.log("불러온 댓글:", data);

      const commentsArray = data.comments;
      commentList.innerHTML = '';  // 기존 댓글을 비운다

      // 댓글 각각에 대해 작성자 이름, 내용, 그리고 본인 댓글일 경우 삭제 버튼 추가
      commentsArray.forEach(comment => {
        addCommentToUI(comment.content, comment.user_no, comment.no, comment.user_name);
      });
    } catch (error) {
      console.error("댓글 불러오기 오류:", error);
    }
  }

  // 댓글을 UI에 추가하는 함수  
  // 댓글의 작성자 이름을 상단에 표시하고, 현재 로그인한 사용자의 댓글일 경우 삭제 버튼 추가
  function addCommentToUI(content, userNo, commentNo, userName) {
    const li = document.createElement('li');
    
    // 작성자 이름 요소 (댓글 위에 표시)
    const userNameElement = document.createElement('div');
    userNameElement.classList.add('comment-user-name');
    userNameElement.textContent = userName;
    
    // 댓글 내용 요소
    const contentElement = document.createElement('div');
    contentElement.classList.add('comment-content');
    contentElement.textContent = content;
    
    li.appendChild(userNameElement);
    li.appendChild(contentElement);
    
    // 현재 로그인한 사용자의 번호
    const currentUserNo = localStorage.getItem('user_no');
    // 본인 댓글인 경우 삭제 버튼 추가 (원한다면 수정 버튼도 추가 가능)
    if (currentUserNo && currentUserNo === String(userNo)) {
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '삭제';
      deleteButton.classList.add('delete-button');
      deleteButton.addEventListener('click', () => deleteComment(commentNo));
      li.appendChild(deleteButton);
    }
    commentList.appendChild(li); // 댓글 목록에 추가
  }

  // 좋아요 상태를 명시적으로 설정하는 함수
  function setLikeUI(likeIcon, isLiked) {
    if (isLiked) {
      likeIcon.classList.remove('far');
      likeIcon.classList.add('fas');
      likeIcon.style.color = 'red';
    } else {
      likeIcon.classList.remove('fas');
      likeIcon.classList.add('far');
      likeIcon.style.color = 'white';
    }
  }

  // 좋아요 버튼 이벤트
  likeButton.addEventListener('click', async () => {
    if (isRequestInProgress) return;
    isRequestInProgress = true;
  
    const token = localStorage.getItem('access_token');
    const likeIcon = likeButton.querySelector('i');
    const currentPost = posts[currentIndex];
  
    if (!token) {
      alert('로그인이 필요합니다!');
      window.location.href = 'login.html';
      isRequestInProgress = false;
      return;
    }
  
    const likeUrl = `https://novelshorts-be.duckdns.org/shorts/${currentPost.no}/like`;
    let response;
    let newLikeState = currentPost.is_like; // 현재 좋아요 상태 저장
  
    try {
      if (!currentPost.is_like) {
        // 좋아요가 안 되어있다면 POST로 좋아요 추가 시도
        response = await fetch(likeUrl, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          newLikeState = true;
        } else if (response.status === 400) {
          // 400 응답은 이미 좋아요 상태라는 의미로 해석하고 DELETE 요청(좋아요 취소) 진행
          response = await fetch(likeUrl, {
            method: 'DELETE',
            headers: {
              'Accept': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            newLikeState = false;
          }
        }
      } else {
        // 이미 좋아요 상태라면 DELETE로 좋아요 취소 시도
        response = await fetch(likeUrl, {
          method: 'DELETE',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          newLikeState = false;
        }
      }
  
      if (response.ok) {
        // 서버 응답에 따라 currentPost의 is_like 상태 업데이트 및 UI 갱신
        currentPost.is_like = newLikeState;
        setLikeUI(likeIcon, newLikeState);
      } else {
        console.error(`서버 응답 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('좋아요 요청 실패:', error);
    } finally {
      setTimeout(() => { isRequestInProgress = false; }, 500);
    }
  });
  
  // 댓글 버튼 클릭 시: 댓글 창 토글 및 현재 게시글의 댓글 불러오기
  commentButton.addEventListener('click', async () => {
    commentBox.classList.toggle('show');
    if (commentBox.classList.contains('show')) {
      await loadComments();
    }
  });
  
  // 댓글 창 닫기
  closeCommentBox.addEventListener('click', () => {
    commentBox.classList.remove('show');
  });
  
  // 댓글 작성하기
  submitComment.addEventListener('click', async () => {
    const content = commentInput.value.trim();
    if (!content) {
      alert('댓글 내용을 입력하세요.');
      return;
    }
  
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다!');
      window.location.href = 'login.html';
      return;
    }
  
    const currentPost = posts[currentIndex];
    const commentUrl = 'https://novelshorts-be.duckdns.org/shorts/comment';
  
    const body = {
      content: content,
      novel_shorts_no: currentPost.no
    };
  
    try {
      const response = await fetch(commentUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
  
      if (response.ok) {
        commentInput.value = ''; // 댓글 입력창 초기화
        await loadComments(); // 댓글 새로고침
      } else {
        console.error('댓글 전송 실패', response.status);
      }
    } catch (error) {
      console.error('댓글 요청 실패:', error);
    }
  });
  
  // 터치 및 마우스 이동 및 클릭 이벤트 추가 (스크롤과 일시정지)
  swipeArea.addEventListener('touchstart', (e) => {
    startY = e.touches[0].clientY; // 터치 시작 Y좌표
    
    if (postAudio.paused) {
      postAudio.play(); // 음악 재생
    } else {
      postAudio.pause(); // 음악 일시정지
    }
  });

  swipeArea.addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY; // 터치 종료 Y좌표
    if (startY - endY > 40) changePost(1); // 위로 스와이프
    if (endY - startY > 40) changePost(-1); // 아래로 스와이프
    if (!postAudio.paused) postAudio.play(); // 일시정지에서 재생
  });

  swipeArea.addEventListener('mousedown', (e) => {
    startY = e.clientY; // 마우스 시작 Y좌표
    
    if (postAudio.paused) {
      postAudio.play(); // 음악 재생
    } else {
      postAudio.pause(); // 음악 일시정지
    }
  });

  swipeArea.addEventListener('mouseup', (e) => {
    const endY = e.clientY; // 마우스 종료 Y좌표
    if (startY - endY > 40) changePost(1); // 위로 스와이프
    if (endY - startY > 40) changePost(-1); // 아래로 스와이프
    if (!postAudio.paused) postAudio.play(); // 일시정지에서 재생
  });

  swipeArea.addEventListener('mouseleave', () => {
    isMouseDown = false;
  });

  // 게시글 전환 함수
  function changePost(direction = 1) {
    if (posts.length === 0) return;
    currentIndex = (currentIndex + direction + posts.length) % posts.length;
    updatePostDisplay();
    if (commentBox.classList.contains('show')) loadComments();
  }
  
  // 초기 데이터 로드
  loadPosts();
});
