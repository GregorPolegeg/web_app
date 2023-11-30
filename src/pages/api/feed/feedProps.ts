export type PostProp = {
  id: string;
  title: string;
  image: string;
  description: string;
  postUsername: string;
  postUserProfileImage: string;
  likeCount: number;
  commentCount: number;
  liked: boolean;
};
export type DeletePostProps = {
  postId: string;
  memberId: string;
  setPostsChanged: React.Dispatch<React.SetStateAction<boolean>>;
  postsChanged: boolean;
};

export type PostComponentProps = PostProp & {
  setPosts: React.Dispatch<React.SetStateAction<PostProp[]>>;
  setPostsChanged: React.Dispatch<React.SetStateAction<boolean>>;
  postsChanged: boolean;
  posts: PostProp[];
};

export type CommentProps = {
  id: string;
  userName: string;
  comment: string;
  postId: string;
};
