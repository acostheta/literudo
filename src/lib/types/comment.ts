export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at?: string;
}

export interface CommentWithProfile extends Comment {
  user_name: string;
  user_avatar: string | null;
  replies?: CommentWithProfile[];
  reply_count?: number;
  is_collapsed?: boolean;
}

export interface CommentSectionProps {
  postId: string;
}

export interface CommentItemProps {
  comment: CommentWithProfile;
  depth?: number;
  maxDepth?: number;
  currentUserId?: string | null;
  isAdmin?: boolean;
  onReply?: (parentId: string) => void;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  replyingTo?: string | null;
  onCancelReply?: () => void;
}

export interface CommentFormProps {
  postId: string;
  parentId?: string | null;
  onSubmit?: () => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}
