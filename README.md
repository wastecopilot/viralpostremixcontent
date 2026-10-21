# ContentRemix — Viral Post Remixer

This app helps you take a post that did well, rewrite it in your own words, and make a new picture for it with your own photo, name and @handle.

It has 6 ways to start:

1. **Remix a post**: upload a screenshot of a post. The AI reads it and rewrites it.
2. **Rewrite a caption**: paste text. The AI rewrites it in fresh words.
3. **Caption → Image**: paste a Facebook caption. The AI makes a picture to go with it.
4. **Pinned comment**: turn a comment into a short question to pin under your post.
5. **Start with my own text**: type your words and pick one of 19 picture styles.
6. **Start with an idea**: type or speak an idea. You get the picture text, a caption and a pinned comment.

Nothing is saved on a server. Everything (credits, profiles, saved posts) stays in your own web browser.

---

## 1. Start the app

You need **Node.js** installed (version 20 or newer). Get it from https://nodejs.org.

Open a terminal in this folder (`remix`) and run:

```bash
npm install
```

(You only need this the first time.) Then:

```bash
npm run dev
```

Open this address in your browser: **http://localhost:3000/remix**

> If the terminal says it is using a different number, like `3001`, use that number instead (for example http://localhost:3001/remix). This happens when another program is already using 3000.

To stop the app: click in the terminal and press **Ctrl + C**.

---

## 2. Demo mode (no key yet)

Without a Gemini key, the app runs in **demo mode**. Every AI button still works, but it gives **sample answers** and a **colorful placeholder picture** instead of a real AI picture. You will see a yellow "Demo mode" tag at the top of the page.

---

## 3. Turn on real AI (free Gemini key)

1. Go to **https://aistudio.google.com** and sign in with a Google account.
2. Click **Get API key** → **Create API key**. Copy the long key.
3. In this folder, open the file named **`.env.local`**.
4. Paste your key after the equals sign, so the line looks like this (with your own key):

   ```
   GEMINI_API_KEY=AIzaSyYourLongKeyGoesHere
   ```

5. Save the file.
6. Restart the app: in the terminal press **Ctrl + C**, then run `npm run dev` again.

The "Demo mode" tag disappears and the buttons now use real AI. Never share this key or put it anywhere else.

**About AI pictures:** Google's free plan includes the text AI but **no AI pictures**. The "Create Image" button (Caption → Image) and "Generate AI background" (Dark Quote) only work after you turn on billing for your key in Google AI Studio (look for "Set up billing" next to your key). Until then, those two buttons show a message explaining this, and everything else keeps working.

**If Google is busy:** sometimes Google says its newest model is overloaded. The app then switches to a backup model by itself, so it can take a little longer but still works. Both models are listed in `src/config/models.ts`.

---

## 4. Where to change things

| What you want to change | File |
| --- | --- |
| App name, logo letters, colors | `src/config/brand.ts` |
| Dropdown and button choices | `src/config/options.ts` |
| How many credits each button costs | `src/config/credits.ts` |
| Which AI models are used | `src/config/models.ts` |
| The instructions sent to the AI | `src/lib/prompts.ts` |
| The 19 picture styles (names, sizes) | `src/config/templates.ts` |
| How each picture style is drawn | `src/components/graphic/PostGraphic.tsx` |

---

## 5. Put it online for free (Vercel)

1. Make a free account at **https://github.com** and create a new, empty repository.
2. Upload this folder to it. (Easiest: install **GitHub Desktop**, choose *Add existing repository*, pick this folder, then *Publish*.) The `.env.local` file is **not** uploaded on purpose — your key stays private.
3. Make a free account at **https://vercel.com** and sign in with GitHub.
4. Click **Add New → Project**, pick your repository, and click **Import**.
5. Open **Environment Variables**. Add one:
   - Name: `GEMINI_API_KEY`
   - Value: your key
6. Click **Deploy**. After a minute you get a web address. Add `/remix` to the end of it.

If you skip step 5, the online version runs in demo mode.

---

## 6. Good to know

- **Credits** (30 to start) and **free downloads** (5) are counted in your browser. In demo mode, when credits reach 0, a "Reset demo credits" link appears.
- **Saved posts** are kept in your browser. Clearing your browser data deletes them. Browsers only allow a few MB, so delete old posts if saving stops working.
- **Voice typing** (the microphone) works best in Google Chrome or Microsoft Edge.
- The AI is told to keep the meaning but use new words, never pretend someone else's story is yours, and never invent numbers or facts.
