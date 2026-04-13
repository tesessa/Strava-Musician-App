import { Comment } from "@strava-musician-app/shared";
import { CommentsDAO } from "../commentsDao";
import db from "./config/SupabaseKnexConnection";

export class SupabaseCommentsDao implements CommentsDAO {
  async addComment(comment: Comment): Promise<void> {
    await db("Comments").insert({
      commentId: comment.commentId,
      practiceLogId: comment.practiceLogId,
      userId: comment.userId,
      text: comment.text,
      createdAt: new Date(comment.createdAt),
    });
  }

  async getCommentsForPracticeLog(practiceLogId: string): Promise<Comment[]> {
    const comments = await db("Comments")
      .select("*")
      .where({ practiceLogId })
      .orderBy("createdAt", "asc");
    return comments.map((c) => ({
      commentId: c.commentId,
      practiceLogId: c.practiceLogId,
      userId: c.userId,
      text: c.text,
      createdAt:
        c.createdAt instanceof Date
          ? c.createdAt.toISOString()
          : new Date(c.createdAt).toISOString(),
    }));
  }

  async getCommentById(commentId: string): Promise<Comment | undefined> {
    const comment = await db("Comments")
      .select("*")
      .where({ commentId })
      .first();
    if (!comment) {
      return undefined;
    }
    return {
      commentId: comment.commentId,
      practiceLogId: comment.practiceLogId,
      userId: comment.userId,
      text: comment.text,
      createdAt:
        comment.createdAt instanceof Date
          ? comment.createdAt.toISOString()
          : new Date(comment.createdAt).toISOString(),
    };
  }

  async removeComment(commentId: string): Promise<void> {
    await db("Comments").where({ commentId }).del();
  }

  async clearAll(): Promise<void> {
    await db("Comments").del();
  }
}
