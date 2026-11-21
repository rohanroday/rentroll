# Connect RentRoll to Supabase

Never paste your secret key into a chat, email or screenshot. It only goes in `.env.local`.

## 1. Create the project
1. Go to [supabase.com](https://supabase.com) and sign up or log in.
2. Click **New project**.
3. Name it `rentroll`.
4. Click **Generate a password** and save it in a safe place.
5. Choose the **Mumbai** region.
6. Click **Create new project** and wait until it finishes.

## 2. Create the database tables
1. In the left menu, open **SQL Editor** and start a new query.
2. Open `supabase/migrations/20261121000000_init.sql` in this folder.
3. Select everything with **Ctrl+A**, copy it, and paste it into the SQL Editor.
4. Click **Run**. You should see a success message.

Run this file only once.

## 3. Allow login links
1. Open **Authentication**, then **URL Configuration**.
2. Set **Site URL** to `http://localhost:3000`.
3. Under **Redirect URLs**, add `http://localhost:3000/**`.
4. Save.

## 4. Add your keys
1. In this folder, run:

```powershell
Copy-Item .env.example .env.local
```

2. Open `.env.local`.
3. In Supabase, open **Project Settings**, then **API Keys** and the project's connection details.
4. Fill in these three lines:
   - `NEXT_PUBLIC_SUPABASE_URL`: your Project URL
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: the **publishable** key
   - `SUPABASE_SECRET_KEY`: the **secret** key
5. Create a random `CRON_SECRET` with the command below and paste the result into `.env.local`:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

6. Save the file.

## 5. Start the app

```powershell
npm run dev
```

Open <http://localhost:3000>, create an account, tap the confirmation link in your email, then add your building and first tenant.

## 6. Send real emails with Gmail
Use a separate Gmail account for RentRoll, not your personal one.

1. Create a new Gmail account just for sending reminders.
2. Turn on **2-Step Verification** in that Google account.
3. Open <https://myaccount.google.com/apppasswords>.
4. Name it `RentRoll` and click **Create**.
5. Copy the 16-letter password. Google shows it only once.
6. In `.env.local`, fill in:
   - `GMAIL_USER`: the Gmail address
   - `GMAIL_APP_PASSWORD`: the 16-letter password
7. Stop the app with **Ctrl+C** and run `npm run dev` again.

Never share the App Password. If it leaks, delete it on the same Google page and create a new one.

## 7. Send sign-up emails through Gmail too
Supabase's built-in sign-up emails have a low hourly limit.

1. In Supabase, open **Authentication**, then the email or **SMTP Settings** page.
2. Turn on **custom SMTP**.
3. Enter:
   - Sender email: your RentRoll Gmail address
   - Sender name: `RentRoll`
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: your RentRoll Gmail address
   - Password: the same App Password
4. Save.

A normal Gmail account can send roughly 500 emails a day. Move to your own domain and an email service before you outgrow that or start charging customers.
