document.querySelectorAll(".like-button").forEach(button => {
    button.addEventListener("click", async function () {
        const shortId = this.getAttribute("data-id");
        const isLiked = this.getAttribute("data-liked") === "true";

        try {
            const likeResponse = await fetch(`https://34.170.172.35:8000/shorts/${shortId}/like`, {
                method: isLiked ? "DELETE" : "POST",
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "Accept": "application/json"
                }
            });

            const likeResult = await likeResponse.json();
            console.log("좋아요 API 응답:", likeResult);

            if (likeResponse.ok) {
                // 서버 응답에 따라 좋아요 상태 업데이트
                const newLikedState = !isLiked;
                this.setAttribute("data-liked", newLikedState ? "true" : "false");

                // 버튼 텍스트 업데이트
                this.innerHTML = newLikedState ? "💔 좋아요 취소" : "❤️ 좋아요";

                // 좋아요 개수 업데이트
                document.getElementById(`like-count-${shortId}`).textContent = likeResult.likes;
            } else {
                alert("좋아요 변경 실패! 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("좋아요 요청 오류:", error);
        }
    });
});
