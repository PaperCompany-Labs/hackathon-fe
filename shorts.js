document.addEventListener('DOMContentLoaded', () => {
  // 전역 변수 및 DOM 요소들
  let posts = [];
  let currentIndex = 0;
  let isRequestInProgress = false;
  
  // 추가된 전역 변수
  let startY = 0;  // 마우스 시작 위치 (Y축)
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
      const response = await fetch('https://novelshorts-be.duckdns.org/shorts?limit=10&offset=0', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
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

    // 좋아요 아이콘 초기화 (예: 빈 하트)
    const likeIcon = likeButton.querySelector('i');
    likeIcon.classList.remove('fas');
    likeIcon.classList.add('far');
    likeIcon.style.color = 'white';
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

      commentsArray.forEach(comment => {
        addCommentToUI(comment.content, comment.user_no, comment.no);  // 댓글 추가
      });
    } catch (error) {
      console.error("댓글 불러오기 오류:", error);
    }
  }

  // 댓글을 UI에 추가하는 함수
  function addCommentToUI(content, userNo, commentNo) {
    const li = document.createElement('li');
    li.textContent = content;

    // 수정 버튼 추가
    const editButton = document.createElement('button');
    editButton.textContent = '수정';
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', () => editComment(commentNo)); // 수정 버튼 클릭 시 수정 함수 실행

    // 삭제 버튼 추가
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '삭제';
    deleteButton.classList.add('delete-button');
    deleteButton.addEventListener('click', () => deleteComment(commentNo)); // 삭제 버튼 클릭 시 삭제 함수 실행
    
    // 댓글 항목에 수정, 삭제 버튼 추가
    li.appendChild(editButton);
    li.appendChild(deleteButton);

    commentList.appendChild(li); // 댓글 목록에 추가
  }

  // 댓글 수정 함수 (버튼 클릭 시 수정 가능)
  function editComment(commentNo) {
    const newContent = prompt('댓글을 수정하세요:');
    if (newContent) {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('로그인이 필요합니다!');
        window.location.href = 'login.html';
        return;
      }

      const updatedBody = {
        content: newContent
      };

      try {
        fetch(`https://novelshorts-be.duckdns.org/shorts/comment/${commentNo}`, {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedBody)
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            alert('댓글이 수정되었습니다.');
            loadComments(); // 댓글 새로고침
          } else {
            alert('댓글 수정에 실패했습니다.');
          }
        });
      } catch (error) {
        console.error('댓글 수정 요청 실패:', error);
      }
    }
  }

  // 댓글 삭제 함수
  async function deleteComment(commentNo) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다!');
      window.location.href = 'login.html';
      return;
    }

    try {
      const response = await fetch(`https://novelshorts-be.duckdns.org/shorts/comment/${commentNo}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        console.log(`댓글 ${commentNo} 삭제 성공`);
        await loadComments(); // 댓글 새로고침
      } else {
        console.error(`댓글 삭제 실패: ${response.status}`);
      }
    } catch (error) {
      console.error('댓글 삭제 요청 실패:', error);
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
      }
    } catch (error) {
      console.error('좋아요 요청 실패:', error);
    } finally {
      setTimeout(() => { isRequestInProgress = false; }, 500);
    }
  });

  // 좋아요 UI 업데이트 함수
  function updateLikeUI(likeIcon) {
    if (likeIcon.classList.contains('far')) {
      likeIcon.classList.remove('far');
      likeIcon.classList.add('fas');
      likeIcon.style.color = 'red';
    } else {
      likeIcon.classList.remove('fas');
      likeIcon.classList.add('far');
      likeIcon.style.color = 'white';
    }
  }

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

  // 마우스 이동 및 클릭 이벤트 추가 (스크롤과 일시정지)
  swipeArea.addEventListener('mousedown', (e) => {
    startY = e.clientY;
    
    if (postAudio.paused) {
      postAudio.play(); // 음악 재생
    } else {
      postAudio.pause(); // 음악 일시정지
    }
  });

  swipeArea.addEventListener('mouseup', (e) => {
    isMouseDown = false;
    const endY = e.clientY;
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
