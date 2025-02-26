"use client";

import { useState } from "react";
import { Button } from "@/app/(main)/components/ui/button";
import { Textarea } from "@/app/(main)/components/ui/textarea";

interface Comment {
  id: number;
  text: string;
}

export default function CommentSection() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now(),
      text: newComment.trim(),
    };

    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  return (
    <div className="w-full max-w-7xl mt-6 p-4 border rounded-lg shadow-sm">
      <h4 className="text-xl font-bold mb-4">댓글</h4>
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p>작성된 댓글이 없습니다.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-2 border rounded-md">
              <p>{comment.text}</p>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex flex-col space-y-2">
        <Textarea
          placeholder="댓글을 입력하세요"
          className="w-full h-24 resize-none"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button onClick={handleSubmitComment}>댓글 등록</Button>
      </div>
    </div>
  );
} 