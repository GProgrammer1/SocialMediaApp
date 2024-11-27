export interface User {
    id: string;
    _id?: number;
    name: string ;
    email: string;
    password: string;
    role: 'User' | 'Admin';
    friendsIds?: number[];
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



export interface Post {
    _id?: number;
    likes?: Like[];
    dislikes?: Dislike[];
    comments?: CommentText[];
    uploadDate: Date ;
    lastUpdateDate?: Date ;
    contentType: string;
    mediaUrl? : string ;
    privacyStatus: 'Public' | 'Private' | 'Friends Only';
    userId: number ;
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
    likerId: number ;
    postId: number ;
}

export interface Dislike {
    _id?: number;
    dislikerId: number ;
    postId: number ;
}

export interface CommentText {
    _id?: number;
    content: string ;
    commentatorId: number ;
    postId: number ;

}

export interface FriendRequest {
    _id?: number;
    senderId: number ;
    receiverId: number ;
    status: 'Accepted' | 'Pending' | 'Rejected' ;
    timestamp: Date ;
}


