interface User {
    id?: number;
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
    accountStatus: 'Active' | 'Deactivated' | 'Pending' ;
    accountPrivacy: 'Private' | 'Public';
}

interface Post {
    id? : number ;
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

interface Chat {
    chatId: number;
    participants: number[];
    messages?: Message[];
}

interface Message {
    id? : number; 
    content: string ;
    senderId: number ;
    receiverId: number ;
    timestamp: Date ;
    status: 'Read' | 'Delivered' | 'Sent' ;

}

interface Like {
    id?: number;
    likerId: number ;
    postId: number ;
}

interface Dislike {
    id?: number;
    dislikerId: number ;
    postId: number ;
}

interface CommentText {
    id? : number ;
    content: string ;
    commentatorId: number ;
    postId: number ;
    
}

interface FriendRequest {
    senderId: number ;
    receiverId: number ;
    status: 'Accepted' | 'Pending' | 'Rejected' ;
    timestamp: Date ;
}


