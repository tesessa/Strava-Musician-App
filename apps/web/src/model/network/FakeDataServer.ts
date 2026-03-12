import type { KodaServerApi } from "./KodaServerApi";
import type { User, Visibility, PracticeSession } from "@strava-musician-app/shared";

/** Fake user for demo mode. */
const FAKE_USER: User = {
  userId: "demo-user-1",
  username: "demomusician",
  email: "demo@koda.example",
  postVisibility: "public",
  instruments: [],
  createdAt: "2026-02-20T08:09:00Z",
  updatedAt: "2024-01-15T12:00:00.000Z",
};


const fakeUsers: Array<User> = [
  { ...FAKE_USER },
];

/** Fake array of posts **/
const fakePosts: PracticeSession[] = [
  {
      userId: "1",
      sessionId: '1',
      title: 'New post',
      postText: "started off strong today with...",
      privateText: "Some notes on having fun",
      instrument: "Violin",
      createdAt: "2026-02-20T08:09:00Z",
      durationMinutes: 120,
      tempo: 60,
      pieceTitle: "chopin etude in E major op 10 no 3",
      composer: "Fredric Chopin"
  },
    {
      userId: "2",
      sessionId: '2',
      title: 'New post',
      postText: "started off strong today with...",
      privateText: "Some notes on having fun",
      instrument: "Violin",
      createdAt: "2026-02-20T08:09:00Z",
      durationMinutes: 120,
      tempo: 60,
      pieceTitle: "chopin etude in E major op 10 no 3",
      composer: "Fredric Chopin"
  },
    {
      userId: "1",
      sessionId: '3',
      title: 'New post',
      postText: "started off strong today with...",
      privateText: "Some notes on having fun",
      instrument: "Violin",
      createdAt: "2026-02-20T08:09:00Z",
      durationMinutes: 120,
      tempo: 60,
      pieceTitle: "chopin etude in E major op 10 no 3",
      composer: "Fredric Chopin"
  }
]

// const fakePosts: FeedPost[] = [
//   {
//     id: "feed-1",
//     userId: "demo-user-1",
//     name: "Tessa A.",
//     title: "Long tones",
//     details: "Clarinet • 35m • Tempo: 96",
//     instrument: "Clarinet",
//     createdAt: new Date("2026-02-20T08:09:00Z"),
//     likeCount: 2,
//     likedByMe: false,
//     commentCount: 1,
//     comments: [
//       {
//         id: "comment-1",
//         authorName: "Jocelyn E.",
//         text: "nice job lol",
//         createdAt: new Date("2026-02-20T09:00:00Z"),
//       },
//     ],
//   },
//   {
//     id: "feed-2",
//     userId: "demo-user-2",
//     name: "Jocelyn E.",
//     title: "Example Op. 10 No. 4",
//     details: "Piano • 50m • Tempo: 132",
//     instrument: "Piano",
//     createdAt: new Date("2026-02-19T18:30:00Z"),
//     likeCount: 5,
//     likedByMe: true,
//     commentCount: 2,
//     comments: [
//       {
//         id: "comment-2",
//         authorName: "Kona V.",
//         text: "lesgooo.",
//         createdAt: new Date("2026-02-19T19:20:00Z"),
//       },
//       {
//         id: "comment-3",
//         authorName: "Tessa A.",
//         text: "yuh yuh.",
//         createdAt: new Date("2026-02-19T19:20:00Z"),
//       }
//     ],
//   },
//   {
//     id: "feed-3",
//     userId: "demo-user-3",
//     name: "Kona V.",
//     title: "Reading sesh",
//     details: "Violin • 25m • Tempo: 88",
//     instrument: "Violin",
//     createdAt: new Date("2026-02-18T12:15:00Z"),
//     likeCount: 0,
//     likedByMe: false,
//     commentCount: 0,
//     comments: [],
//   },
// ];

/**
 * Returns fake data for demo/development. No network calls.
 */
export class FakeDataServer implements KodaServerApi {
  async getMe(): Promise<User | null> {
    return { ...FAKE_USER };
  }

  async login(email: string, password: string): Promise<User | null> {
    const found = fakeUsers.find((u) => u.email === email);
    return found
      ? {
          userId: found.userId,
          username: found.username,
          email: found.email,
          postVisibility: found.postVisibility,
          instruments: found.instruments,
          createdAt: found.createdAt,
          updatedAt: found.updatedAt,
        }
      : null;
  }

  async register(
    username: string,
    email: string,
    password: string
  ): Promise<User | null> {
    const now = new Date().toISOString();
    const newUser: User & { password: string } = {
      userId: `user-${Date.now()}`,
      username,
      email,
      postVisibility: "friends",
      instruments: [],
      createdAt: now,
      updatedAt: now,
      password,
    };
    fakeUsers.push(newUser);
    return {
      userId: newUser.userId,
      username: newUser.username,
      email: newUser.email,
      postVisibility: newUser.postVisibility,
      instruments: newUser.instruments,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };
  }

  async savePost(userId: string, title: string, _visibility: Visibility, _duration: number, _postText?: string, _privateText?: string, _instrument?: string, _tempo?: number, _pieceTitle?: string, _composer?: string): Promise<string> {
    const fakeId = `post-${Date.now()}`;
    console.log("[FakeDataServer] Saving post:", fakeId, title);

    fakePosts.push(  {
      userId: userId,
      sessionId: '5',
      title: title,
      postText: _postText,
      privateText: _privateText,
      instrument: _instrument,
      createdAt: "2026-02-20T08:09:00Z",
      durationMinutes: _duration,
      tempo: _tempo,
      pieceTitle: _pieceTitle,
      composer: _composer
  })
    return fakeId;
  }

  async discardPost(sessionId: string): Promise<void> {
    console.log("[FakeDataServer] Discarding post:", sessionId);
  }

  async getFeed(): Promise<PracticeSession[]> {
    return [...fakePosts];
  }

  async likePost(postId: string): Promise<void> {
    // const post = fakePosts.find((p) => p.id === postId);
    // if (post && !post.likedByMe) {
    //   post.likedByMe = true;
    //   post.likeCount = (post.likeCount ?? 0) + 1;
    // }
  }

  async unlikePost(postId: string): Promise<void> {
  //   const post = fakePosts.find((p) => p.id === postId);
  // if (post && post.likedByMe) {
  //   post.likedByMe = false;
  //   post.likeCount = Math.max((post.likeCount ?? 0) - 1, 0);
  //   }
  }

  async commentOnPost(postId: string, text: string): Promise<void> {
    // const post = fakePosts.find((p) => p.id === postId);
    // if (!post) return;

    // const newComment: FeedComment = {
    //   id: `comment-${Date.now()}`,
    //   authorName: "Demo Musician",
    //   text,
    //   createdAt: new Date(),
    // };

    // if (!post.comments) {
    //   post.comments = [];
    // }

    // post.comments.push(newComment);
    // post.commentCount = post.comments.length;
  }

  async sharePost(postId: string): Promise<void> {
    console.log("[FakeDataServer] Share post:", postId);
  }

}
