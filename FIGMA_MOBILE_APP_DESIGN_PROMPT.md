# Figma Design Prompt: SwipeUpRight Mobile App

**Purpose:** Use this document as a detailed brief to design the mobile app (iOS/Android) for SwipeUpRight in Figma. It includes brand, design system, every screen, feature, and interaction so designs are complete and implementation-ready.

---

## 1. App Overview & Brand

**App name:** SwipeUpRight  
**Tagline:** Dating with intent. Marriage by choice.  
**Product type:** Matrimonial / matchmaking platform (India-focused, marriage-intent).  
**Platform:** Native mobile app (iOS and Android); design for 375×812 (iPhone X) as base, with safe areas and scalable layouts.

**Tone:** Trustworthy, warm, premium, respectful. Avoid casual dating visuals; emphasize commitment, family, and compatibility.

---

## 2. Design System

### 2.1 Color Palette

**Primary (Pink – brand)**  
- `#fdf2f8` – Primary 50 (lightest backgrounds)  
- `#fce7f3` – Primary 100  
- `#fbcfe8` – Primary 200 (borders, light accents)  
- `#f9a8d4` – Primary 300  
- `#f472b6` – Primary 400  
- **`#ec4899` – Primary 500 (main CTA, links, key UI)**  
- `#db2777` – Primary 600 (hover, active)  
- `#be185d` – Primary 700  
- `#9f1239` – Primary 800  
- `#831843` – Primary 900  

**Secondary / Gradient**  
- Rose: `#f43f5e` (rose-500) – used with primary for gradients (e.g. buttons: `from-pink-500 to-rose-500`)  
- Purple (backgrounds): `#faf5ff` (purple-50) – body gradient: `from-pink-50 via-white to-purple-50`  

**Semantic**  
- Success / Online: `#22c55e` (green-500)  
- Error / Reject: `#ef4444` (red-500), `#f43f5e` (rose)  
- Warning / Favorite: `#facc15` (yellow-400), `#f59e0b` (amber-500)  
- Info / Message: `#3b82f6` (blue-500)  

**Neutrals**  
- Background: `#f9fafb` (gray-50), `#ffffff`  
- Text primary: `#111827` (gray-900)  
- Text secondary: `#6b7280` (gray-500), `#4b5563` (gray-600)  
- Borders: `#e5e7eb` (gray-200), `#fbcfe8` (primary-200)  

**Gradients (reusable)**  
- Primary CTA: linear gradient `#ec4899` → `#f43f5e`  
- Hero/background: `from-pink-50 via-white to-purple-50`  
- Dark CTA section: `from-pink-600 via-rose-600 to-purple-600`  

### 2.2 Typography

- **Headings / Serif:** Playfair Display (400, 500, 600, 700)  
- **Body / UI:** Inter (300, 400, 500, 600, 700)  

**Mobile scale (examples):**  
- Hero / H1: 28–32px, bold  
- H2: 22–24px, bold  
- H3: 18–20px, semibold  
- Body: 16px regular, 14px secondary  
- Caption / labels: 12px  
- Buttons: 16px semibold  

### 2.3 Spacing & Layout

- Base unit: 4px (e.g. 4, 8, 12, 16, 20, 24, 32, 40, 48, 64)  
- Screen padding: 16–24px  
- Card padding: 16–24px  
- Border radius: 8px (small), 12px (cards), 16–24px (large cards, modals)  
- Bottom nav / key actions: respect safe area (e.g. 34pt bottom on iPhone X+)  

### 2.4 Components (Design Tokens)

- **Primary button:** Full-width or inline; bg gradient pink→rose; white text; 48px height; 12–16px radius; shadow.  
- **Secondary button:** White bg; border 2px primary-300; text primary-600; same height/radius.  
- **Input:** Border 1px primary-200/gray-200; 12px radius; focus ring 2px primary-500.  
- **Card:** White bg; shadow sm; 12–16px radius; optional border gray-100.  
- **Chips / tags:** Pill shape; bg primary-100 or gray-100; text gray-700/primary-700.  
- **Avatar:** Circle; default placeholder (e.g. initials or icon) when no photo.  
- **Badge (count):** Small circle; gradient pink→rose; white bold number; e.g. on notification bell.  

---

## 3. Logo & Iconography

- **Logo:** Heart shape with gradient fill (#ec4899 → #f43f5e), optional white stroke; can sit next to wordmark “SwipeUpRight”.  
- **Icons:** Outline style, 24px default; use for nav, actions, list items.  
- **Key icons:** Heart (interest/favorite), Message, User/Profile, Search, Bell (notifications), Check (accept), X (reject), Star (favorite), Settings.  

---

## 4. Screens & Features (Full List)

Design each screen in **mobile-first** (portrait). Include: default state, loading state, empty state, and error state where relevant.

---

### 4.1 Unauthenticated

**Landing / Onboarding (optional)**  
- Hero: logo, “SwipeUpRight”, tagline “Dating with intent. Marriage by choice.”  
- Headline: “Find Your Perfect Life Partner”  
- Short value props (e.g. verified profiles, privacy, success stories)  
- Primary CTA: “Get Started Free” → Sign up  
- Secondary: “Sign In” → Login  
- Trust line: e.g. “10,000+ Successful Matches”, “Verified Profiles”, “100% Privacy Protected”  
- Optional: one or two more sections (features, stats) and final CTA.  

**Login**  
- Logo or app name at top  
- Title: “Welcome Back”  
- Fields: Email (email keyboard), Password (password, mask)  
- Optional: “Remember me” checkbox, “Forgot password?” link  
- Primary: “Sign In”  
- Footer: “Don’t have an account? Sign up for free” (link to Sign up)  
- Use same card/container style as web (white card on soft gradient bg).  

**Sign Up**  
- “Create Account”  
- Fields: Email, Password, Confirm Password  
- Hint: “Password must be at least 6 characters”  
- Primary: “Create Account”  
- Footer: “Already have an account? Sign in”  
- Same layout/card style as Login.  

**Forgot Password (if in scope)**  
- Title and short copy  
- Single field: Email  
- Primary: “Send reset link”  
- Link back to Login.  

---

### 4.2 Main Navigation (Logged-in)

Use **bottom tab bar** (5 items):

1. **Home / Dashboard** – icon: home  
2. **Discover / Search** – icon: search  
3. **Matches** – icon: heart or users  
4. **Messages** – icon: message; show unread count badge if > 0  
5. **Profile** – icon: user  

Optional: top app bar with logo, title (or screen title), and **notification bell** (with unread badge).  
Optional: “Subscriptions” and “Favorites” as items in Profile or Discover, or as secondary nav.

---

### 4.3 Dashboard (Home)

- **Header:** “Welcome back, [First name]” with small greeting icon; optional profile completion widget.  
- **Profile completion (if profile exists):**  
  - Label “Profile Completion”  
  - Progress bar (0–100%) with primary gradient  
  - “Complete profile” link if &lt; 100%  
- **Stats row (4 cards or 2×2):**  
  - Received Interests (count; link to My Profile → Received)  
  - Sent Interests (count)  
  - Favorites (count)  
  - Conversations (count)  
  Use distinct soft colors (pink, blue, yellow, green) and icons.  
- **Section: “Suggested Matches”**  
  - Subtitle: “Handpicked based on your preferences”  
  - “Discover All” link → Search  
- **Suggested match cards (vertical list or horizontal scroll):**  
  - Large profile image (or placeholder)  
  - Overlay: age badge, “Active” pill (green dot) if online  
  - Bottom overlay: name, city/state  
  - Row of quick info: height, education (icons + text)  
  - Actions: “Send Interest” (primary), “View Profile” (secondary)  
  - On “Send Interest”: optional heart animation (hearts rising); card can disappear or update.  
- **Empty state (no profile):**  
  - Illustration or icon  
  - “Complete Your Profile”  
  - Copy: unlock matches, increase chances  
  - CTA: “Create Profile”  
- **Empty state (profile complete, no matches):**  
  - “No matches found yet”  
  - Copy: complete profile/preferences or browse all  
  - CTAs: “Complete Profile” and “Browse All Profiles”  

---

### 4.4 Profile Creation / Edit (Profile Builder)

Multi-step form (5 steps). Use **stepper** at top (e.g. 1–2–3–4–5) and Next/Back.

**Step 1 – Photos**  
- “Add Photos” (up to 6)  
- Grid of slots: filled = thumbnail + delete; empty = “+” upload area  
- Drag to reorder (indicate reorderable)  
- Primary/cover: first image = profile picture  
- Validation message if &lt; 1 photo  

**Step 2 – Basic Info**  
- First Name, Last Name  
- Date of Birth (date picker)  
- Gender (dropdown or chips: Male, Female, Other)  
- Height (number, cm)  

**Step 3 – Family & Lifestyle**  
- Religion, Caste, Sub Caste (text)  
- Marital Status (Never Married, Divorced, Widowed, etc.)  
- Diet (Vegetarian, Non-Vegetarian, Eggetarian, etc.)  
- Drinking (Yes/No/Socially)  
- Smoking (Yes/No)  

**Step 4 – Education & Career**  
- Education (e.g. B.Tech, MBA)  
- Profession  
- Annual Income (number)  

**Step 5 – Location & More**  
- City, State, Country  
- About Me (multiline)  
- Family Details (multiline)  
- Father’s Name, Mother’s Name  
- Siblings (e.g. “1 brother, 1 sister”)  
- Native Place  
- Languages Spoken  

- **Actions:** Back, Next (step &lt; 5), “Save” or “Complete” (step 5)  
- Loading: disable buttons, show spinner on submit  

---

### 4.5 Partner Preferences (Optional Screen)

- Same filters as search: Min/Max Age, Min/Max Height, Religion, Caste, Education, Profession, City, State, Marital Status.  
- Save button.  
- Can be a separate screen under Profile or a modal from Dashboard/Search.  

---

### 4.6 Search (Discover)

- **Top:** Search bar (placeholder: “Name, profession, city…”)  
- **Filter chip or “Filters” button** opening filter sheet/modal:  
  - Min/Max Age, Min/Max Height  
  - Religion, Caste, Education, Profession  
  - City, State  
  - Apply / Clear  
- **Results:**  
  - List or card stack of profile cards.  
  - Each card: photo(s), name, age, location, height, education; “Send Interest” and “View Profile”.  
  - If multiple photos: horizontal swipe or dots for carousel.  
- **Pagination:** “Load more” or infinite scroll.  
- **Empty:** “No profiles match your filters” + suggest clearing filters.  
- **Pass / Like:** Optional swipe gestures (e.g. swipe left = pass, right = like) with visual feedback.  

---

### 4.7 Profile Detail (View Other User)

- **Photo section:**  
  - Full-width image carousel (swipe left/right); dots or “1/4” indicator  
  - Overlays: “Active Now” (green dot + text), optional “Message” icon button  
- **Info section (scrollable):**  
  - Name, age  
  - Location (city, state)  
  - Height, religion, caste, education, profession, etc. (same as profile fields)  
  - About Me, Family Details, etc.  
- **Sticky bottom bar or floating actions:**  
  - “Send Interest” (primary) – or “Interest Sent” (disabled) if already sent  
  - “Add to Favorites” (heart icon; filled when favorited)  
  - “Message” (only if interest accepted; starts conversation)  
- **Back:** Top-left arrow to previous screen.  

---

### 4.8 My Profile (Own Profile)

- **Tabs:** “Profile” | “Received Interests” | “Sent Interests”  

**Tab: Profile**  
- Same layout as Profile Detail but for current user: photo carousel, all details.  
- “Edit Profile” button → Profile Builder (edit mode).  
- “Partner Preferences” link if implemented.  

**Tab: Received Interests**  
- List of users who sent interest: avatar, name, age, short info, “Accept” (green) and “Reject” (red).  
- After action: show “Accepted” or “Rejected” badge; optional “Message” if accepted.  

**Tab: Sent Interests**  
- List of users you sent interest to: avatar, name, status (Pending / Accepted / Rejected).  
- If accepted: “Message” to open conversation.  

- Empty states for no received/sent interests.  

---

### 4.9 Matches

- **Modes:** “Suggested” (default) vs “Search”.  
- **Suggested:** List/grid of match cards (same data as Dashboard suggested matches); filters optional.  
- **Search:** Same filter UI as Search screen; results as profile cards.  
- Each card: photo, name, age, location, “Send Interest” / “View Profile”.  
- Empty: “No matches yet” + complete profile or adjust preferences.  

---

### 4.10 Favorites

- List or grid of favorited profiles.  
- Each item: photo, name, age, location; “Remove from Favorites” (icon or menu); tap → Profile Detail.  
- Empty: “No favorites yet” + “Discover profiles”.  

---

### 4.11 Messages

- **Two sub-views:** Conversations | Connections  

**Conversations**  
- List of conversations: other user’s avatar, name, last message preview, time, unread indicator.  
- Tap → Chat thread.  

**Connections**  
- List of accepted interests with no conversation yet: avatar, name, “Start conversation”.  
- Tap or “Start conversation” → create conversation and open thread.  

**Chat thread**  
- Header: back, other user’s name, optional “Active” or “Online”.  
- Message list: bubbles (sent = primary/gradient right, received = gray left); timestamp.  
- Input: text field + Send button; optional emoji picker.  
- Empty: “Send a message to start the conversation.”  
- Loading: skeleton or spinner for messages.  

---

### 4.12 Notifications

- **Entry:** Bell icon in app bar; red/pink badge with count (hide if 0).  
- **Panel/drawer (or full screen):**  
  - Header: “Notifications”, “Mark all as read” if unread &gt; 0  
  - List:  
    - Avatar, title, message, time  
    - Types: “New connection request” (interest received), “Interest accepted”, “New message”, “Added you to favorites”  
    - For “Interest received”: inline “Accept” and “Reject” buttons  
    - Unread: distinct background (e.g. light pink)  
    - Dismiss (X) per item  
  - Optional: “View all” link to full notifications screen  
- Empty: “No notifications yet” / “You’re all caught up”.  

---

### 4.13 Subscriptions

- Title: “Choose Your Plan”  
- **Plans (cards):**  
  - Basic: price (e.g. ₹999/1 month), feature list, “Subscribe”  
  - Premium: “Popular” badge, price (e.g. ₹2499/3 months), more features, primary CTA  
  - Platinum: highest price (e.g. ₹4999/6 months), top features  
- Feature list per plan with checkmark icon.  
- If user has active subscription: “Your plan” / “Active until …”; “Already Subscribed” on buttons where relevant.  
- Section “Your Subscriptions”: list of current/past with plan name, dates, status (Active/Expired).  

---

### 4.14 Settings / Account (Optional)

- Account: email, change password, logout.  
- Notifications: on/off toggles.  
- Privacy, Help, Terms.  
- “Delete account” (destructive, with confirmation).  

---

### 4.15 Admin (Optional – Admin Users Only)

- **Dashboard:**  
  - KPI cards: Total Users, Active Subscriptions, Total Profiles, Pending Interests  
- **Users list:** Table or card list: email, role, profile yes/no, subscriptions count, created date.  
- **User detail (if needed):** Same fields + edit role, delete user.  
- **Subscriptions list:** Plan, user, status.  
- Design for tablet or large phone if admin is mobile-only.  

---

## 5. States & Micro-interactions

- **Loading:** Full-screen or inline spinner (primary color); skeleton for lists/cards where appropriate.  
- **Empty:** Illustration or icon + title + short copy + CTA.  
- **Error:** Inline message (red) or toast; retry button where relevant.  
- **Success:** Toast “Interest sent”, “Added to favorites”, “Profile saved”, etc.  
- **Buttons:** Disabled (opacity 50%); loading (spinner inside button).  
- **Heart animation:** When user sends interest, optional burst of hearts from card (reference web).  
- **Pull-to-refresh:** On lists (matches, messages, notifications).  

---

## 6. Mobile-Specific Notes

- **Touch targets:** Min 44×44pt for buttons and list rows.  
- **Safe areas:** Notch, home indicator; keep primary actions above bottom safe area.  
- **Orientation:** Portrait primary; support landscape for chat if needed.  
- **Accessibility:** Contrast (WCAG AA), focus order, labels for icons.  
- **Platform:** Use iOS Human Interface and Material Design guidelines for nav, back, and modals; align with existing SwipeUpRight web styling (colors, typography, components) so the mobile app feels part of the same product.  

---

## 7. Deliverables Checklist (Figma)

- [ ] Design system page: colors, type, spacing, components  
- [ ] All screens listed above in default state  
- [ ] Key screens: loading, empty, error where applicable  
- [ ] Main user flows: Sign up → Create profile → Dashboard → Send interest → Notifications → Accept → Messages  
- [ ] Bottom navigation + app bar variants  
- [ ] Notification panel and notification list item (all types)  
- [ ] Profile Builder: all 5 steps  
- [ ] Chat thread: sent/received bubbles, input, optional emoji  
- [ ] Subscription plan cards (all 3)  
- [ ] Component set: buttons, inputs, cards, avatars, badges  
- [ ] Optional: simple prototype (tap-through for main flow)  

Use this document as the single source of truth for building the SwipeUpRight mobile app designs in Figma.
