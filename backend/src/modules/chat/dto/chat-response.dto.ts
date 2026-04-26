export class UserResponseDto {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export class MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  fileUrl: string | null;
  createdAt: Date;
  sender: UserResponseDto;
}

export class ConversationMemberResponseDto {
  id: string;
  userId: string;
  joinedAt: Date;
  user: UserResponseDto;
}

export class ConversationResponseDto {
  id: string;
  type: string;
  title: string | null;
  classroomId: string | null;
  createdAt: Date;
  members: ConversationMemberResponseDto[];
  messages?: MessageResponseDto[];
}
