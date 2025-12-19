# Journals — React + Firebase Blog

Journals is a simple, modern blog built with React and Firebase Realtime Database. It supports posts, reactions (👍 ❤️ 😊 🤔 👏), comments with per-user likes, search, and a light/dark theme toggle. The app uses client-side user IDs stored in `localStorage` to provide a lightweight, anonymous experience with per-user interactions.

**Highlights**
- **Blog Posts:** Friendly cards and detailed views with images and metadata.
- **Reactions:** Real-time reaction counts per post via [src/components/ReactionButtons.js](src/components/ReactionButtons.js).
- **Comments:** Add comments, see timestamps, and like/unlike individual comments via [src/components/Comments.js](src/components/Comments.js).
- **Search & Navigation:** Quick filtering and clean routing.
- **Theme Toggle:** Switch between light and dark themes.
- **Realtime Updates:** Subscriptions keep reaction and comment views in sync.

## Tech Stack
- **Frontend:** React (Create React App), CSS
- **Backend:** Firebase Realtime Database
- **Icons/UX:** MUI Icons (e.g., ThumbUp)
- **Testing:** Jest + React Testing Library (CRA defaults)

## Getting Started

1. Install dependencies:
```bash
npm install
```
2. Start the dev server:
```bash
npm start
```
3. If port 3000 is in use, CRA will prompt; choose “yes” to use another port.

## Configuration
- Firebase configuration is defined in [src/services/firebase.js](src/services/firebase.js).
- The app uses a generated `blog_user_id` stored in `localStorage` for per-user actions via `getUserId()`.

## Features & Data Model

**Reactions**
- Stored under `reactions/{postId}` with keys: `like`, `love`, `smile`, `think`, `clap`.
- Per-user mapping under `userReactions/{userId}/{postId}` storing the user’s current reaction.
- APIs in [src/services/firebase.js](src/services/firebase.js):
  - getReactions(postId): Fetch counts.
  - setReaction(postId, reactionType): Add/change/remove a reaction with safe count updates.
  - subscribeToReactions(postId, cb): Live updates.
  - getUserReaction(postId): Current user’s selected reaction.

**Comments**
- Stored under `comments/{postId}/{commentId}` with fields: `userId`, `username`, `text`, `timestamp`, `likes`, `likedBy`.
- `likedBy` is a map `{ userId: true }` for users who liked a comment.
- APIs in [src/services/firebase.js](src/services/firebase.js):
  - getComments(postId): Read and sort by newest.
  - addComment(postId, commentData): Create comment with `push()` key.
  - subscribeToComments(postId, cb): Live updates.
  - toggleCommentLike(postId, commentId): Increments/decrements `likes` and sets/removes `likedBy/{userId}`.
  - hasUserLikedComment(postId, commentId): Checks if current user liked the comment.

## Key Components
- [src/components/BlogList.js](src/components/BlogList.js): Post list view.
- [src/components/BlogPost.js](src/components/BlogPost.js): Post detail layout.
- [src/components/ReactionButtons.js](src/components/ReactionButtons.js): Reaction UI + logic.
- [src/components/Comments.js](src/components/Comments.js): Comments UI + likes.
- [src/components/SearchBar.js](src/components/SearchBar.js): Client-side search.
- [src/components/ThemeToggle.js](src/components/ThemeToggle.js): Theme switcher.

## Running & Scripts
- Development:
```bash
npm start
```
- Tests:
```bash
npm test
```
- Production build:
```bash
npm run build
```

## Folder Structure
Key files and directories:
- [src/index.js](src/index.js) — App bootstrap
- [src/App.js](src/App.js) — Top-level routes and layout
- [src/services/firebase.js](src/services/firebase.js) — Data access and realtime subscriptions
- [src/components/](src/components) — UI components (reactions, comments, header, footer, etc.)
- [src/pages/](src/pages) — Page-level components
- [src/data/blogPosts.js](src/data/blogPosts.js) — Sample/static post data

## Troubleshooting
- Port in use: CRA prompts to switch ports; choose “yes”.
- Dev server warnings: Webpack dev server may log deprecation warnings; functionality is unaffected.
- Firebase errors: Ensure internet connectivity; the Realtime Database rules allow reads/writes for your use case.

## Security & Privacy
- Firebase client keys are intended to be public in frontend apps; secure access via Realtime Database Rules.
- User identity is anonymous and stored locally via `blog_user_id`.

## Roadmap / Ideas
- Pagination for comments and posts.
- Rich text for comments.
- Post authoring and authentication.

---
Built with care for a simple, thoughtful reading and sharing experience.
