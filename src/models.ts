export interface User {

    _id?: number;
    name: string ;
    email: string;
    password: string;
    role: 'User' | 'Admin';
    friends?: User[];
    posts?: Post[];
    profilePic?: string;
    bio?: string ;
    chats?: Chat[];
    isOnline: boolean ;
    likes?: Like[] ;
    dislikes: Dislike[] ;
    comments?: CommentText[] ;
    friendRequests?: FriendRequest[] ;
    accountStatus: 'Active' | 'Deactivated' | 'Suspended' ;
    accountPrivacy: 'Private' | 'Public';
    emailToken?: EmailVerificationToken;
    resetToken?: ResetToken;
    notificiations: boolean;
}

export interface ResetToken {
    _id: number;
    token: string;
    email: string;
    createdAt: Date;
}

export interface EmailVerificationToken {
    _id: number;
    token: string;
    expiryDate: Date;
    userId: number;
}

export interface Notification {
    _id?: number;
    user: User;
    notificationMessage: string;
    notificationType : string;
    createdAt: Date;
    isRead: boolean;
    read: boolean;
}

export interface Story {
    _id?: number;
    user: User;
    mediaUrl: string;
    views: number;
    createdAt: Date;
    expiresAt: Date;
    likes: Like[];
    dislikes: Dislike[];
    comments: CommentText[];
}


export interface Post {
    _id?: number;
    likes?: Like[];
    dislikes?: Dislike[];
    comments?: CommentText[];
    createdAt: Date ;
    lastUpdateDate?: Date ;
    contentType: string;
    text?: string;
    mediaUrl? : string ;
    privacyStatus: 'public' | 'private' | 'friends only';
    user:User ;
    shares: number;
}

export interface Chat {
    _id?: number;
    participants: User[];
    messages?: Message[];
}

export interface Message {
    _id?: number
    content: string ;
    sender: User ;
    chat: Chat ;
    receiver: User ;
    timestamp: Date ;
    status: 'read' | 'delivered' | 'sent' ;

}

export interface Like {
    _id?: number;
    user: User ;
    postId: number ;
}

export interface Dislike {
    _id?: number;
    user: User ;
    postId: number ;
}

export interface CommentText {
    _id?: number;
    text: string ;
    user: User ;
    postId: number ;
    createdAt: Date ;
    replies: CommentText[] ;
    likes: Like[] ;
    dislikes: Dislike[] ;
    parent: CommentText;

}

export interface FriendRequest {
    _id?: number;
    sender: User ;
    receiver: User ;
    status: 'Accepted' | 'Pending' | 'Rejected' ;
    timestamp: Date ;
}


