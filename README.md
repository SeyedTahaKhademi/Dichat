# 🔒 DIchat - Secure Enterprise Messenger & Collaboration Suite
### پیام‌رسان سازمانی امن و بستر همکاری ایمن دی‌آی‌چت

DIchat is a high-performance, self-hosted, end-to-end encrypted (E2EE) messenger designed for enterprise teams who value absolute data privacy, security, and low-latency communication. It operates completely in isolated private networks or public servers with seamless role-based access control (RBAC).

دی‌آی‌چت (DIchat) یک پیام‌رسان سازمانی با کارایی بالا، قابل میزبانی شخصی (Self-hosted) و مجهز به رمزگذاری سرتاسری (E2EE) است که برای سازمان‌هایی با حساسیت امنیتی بالا طراحی شده است. این سیستم به صورت کاملاً ایزوله در شبکه‌های خصوصی یا سرورهای عمومی کار می‌کند.

---

## 🌐 Table of Contents / فهرست مطالب
1. [English Documentation](#-english-documentation)
   - [Features](#-features)
   - [Tech Stack](#-tech-stack)
   - [Local Quick Start](#-local-quick-start)
   - [Server Deployment & Production Guide](#-server-deployment--production-guide)
   - [Adding & Onboarding Your Team](#-adding--onboarding-your-team)
2. [راهنما و داکیومنت فارسی](#-راهنما-و-داکیومنت-فارسی)
   - [ویژگی‌های کلیدی](#-ویژگی‌های-کلیدی)
   - [تکنولوژی‌های مورد استفاده](#-تکنولوژی‌های-مورد-استفاده)
   - [راه‌اندازی سریع محلی](#-راه‌اندازی-سریع-محلی)
   - [استقرار روی سرور واقعی و پروداکشن](#-استقرار-روی-سرور-واقعی-و-پروداکشن)
   - [نحوه اضافه کردن و ورود تیم شما](#-نحوه-اضافه-کردن-و-ورود-تیم-شما)

---

## 🇺🇸 English Documentation

### ✨ Features
- **🔑 Client-Side E2EE Cryptography:** Secure text messaging and file attachments. Keys are generated client-side using Diffie-Hellman (DH256) key exchanges.
- **🎙️ Secure Voice Calls:** Real-time end-to-end encrypted audio calling with matching cryptographic validation codes.
- **🛡️ Advanced Access Control (RBAC):** Admin dashboard to control room permissions (`read-only`, `write`, `none`) per user.
- **📂 Secure File Sharing:** Seamless drag-and-drop file uploading with automatic local and cloud storage handling.
- **💬 Real-Time Collaboration:** Active typing indicators, message reactions, advanced archive searching, and system-wide setting toggles.
- **🌐 Localization:** Instant toggle between English (LTR) and Persian/Farsi (RTL) layout.

### 🛠️ Tech Stack
- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS 4, Motion (Animations), Lucide Icons.
- **Backend Ready:** Built-in Express server compatibility with pre-configured bundler assets.
- **Storage:** Offline-first state persistence backed by robust client-side `localStorage` synchronization.

---

### 🚀 Local Quick Start

To run DIchat on your machine in development mode:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd dichat
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` to access the application.

---

### 🖥️ Server Deployment & Production Guide

To self-host DIchat on a production server (Ubuntu, Debian, CentOS, or VPS):

#### Option A: Running with Node.js & PM2 (Recommended)
This option compiles the frontend assets and starts the high-speed Node.js environment.

1. **Build the production package:**
   ```bash
   npm run build
   ```
   This generates the optimized static files in the `/dist` directory.

2. **Setup Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=production
   ```

3. **Install PM2 globally to keep the app running forever:**
   ```bash
   npm install -g pm2
   ```

4. **Start the service:**
   ```bash
   pm2 start npm --name "dichat-server" -- start
   ```

5. **Ensure it launches on system boot:**
   ```bash
   pm2 startup
   pm2 save
   ```

#### Option B: Deploying behind Nginx as a Reverse Proxy (Recommended for SSL/TLS)
For maximum security, you should serve DIchat over HTTPS using an Nginx reverse proxy.

1. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **Configure Nginx virtual host:**
   Create a configuration file at `/etc/nginx/sites-available/dichat`:
   ```nginx
   server {
       listen 80;
       server_name chat.yourcompany.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
3. **Enable configuration and restart Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/dichat /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

4. **Add SSL using Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d chat.yourcompany.com
   ```

---

### 👥 Adding & Onboarding Your Team

DIchat features an integrated local account and onboarding flow:

1. **First-Time Setup (Administrator Account):**
   - Use the preloaded Administrator profile (`ali.admin`) to log in and set up channels.
   - Access the **Admin Console** (کنسول مدیریت) in the upper-right corner to customize system-wide settings, permissions, and create initial communication channels.

2. **Adding Team Members:**
   - Share your server's deployment URL (e.g., `https://chat.yourcompany.com`) with your team.
   - Instruct team members to click on the **Sign Up** (ثبت‌نام کاربر جدید) tab on the home screen.
   - They can register with their custom **Username**, **Display Name**, and **Position/Bio**.
   - During signup, DIchat automatically generates a unique set of cryptographic **Diffie-Hellman E2EE keypairs** completely inside their local browser.
   - Once signed up, they are automatically added to the default `#general` channel with write permissions.

3. **Customizing Team Permissions:**
   - Open the **Admin Console** to change any user's role from `member` to `admin`.
   - Set individual user permission boundaries (`write`, `read-only`, `none`) for sensitive rooms (e.g., `#security-ops` or `#marketing-campaign`) to control exactly who can read or write in channels.

---

## 🇮🇷 راهنما و داکیومنت فارسی

### ✨ ویژگی‌های کلیدی
- **🔑 رمزنگاری سرتاسری محلی (E2EE):** رمزگذاری پیام‌های متنی و فایل‌های ضمیمه به صورت ۱۰۰٪ کلاینت-ساید. تولید خودکار کلیدهای امنیتی با الگوریتم تبادل کلید دیفی-هلمن (DH256).
- **🎙️ تماس‌های صوتی امن کلاینتی:** برقراری تماس‌های صوتی سرتاسر رمزگذاری‌شده به همراه کد تاییدیه صوتی مشترک جهت اطمینان از عدم وجود استراق سمع.
- **🛡️ کنترل دسترسی پیشرفته سازمانی (RBAC):** داشبورد مدیریت قدرتمند برای تغییر دسترسی کاربران در اتاق‌ها (`فقط-خواندنی`، `نوشتن کامل`، `عدم دسترسی`).
- **📂 اشتراک‌گذاری امن فایل:** آپلود سریع فایل به همراه قابلیت کشیدن و رها کردن (Drag-and-Drop) و پیش‌نمایش مستقیم در چت.
- **💬 همکاری آنی و مدرن:** نمایش وضعیت در حال نوشتن (Typing indicators)، اعمال اموجی روی پیام‌ها، جستجوی پیشرفته در آرشیو پیام‌ها و فعال/غیرفع‌سازی ویژگی‌های کلیدی پیام‌رسان.
- **🌐 راست‌چین کامل (RTL):** سازگاری بی‌نقص با زبان‌های فارسی و انگلیسی تنها با کلیک روی دکمه تغییر زبان.

### 🛠️ تکنولوژی‌های مورد استفاده
- **فرانت‌اند:** React 19 به همراه TypeScript، سرعت لود فوق‌العاده با Vite، فریمورک مدرن Tailwind CSS نسخه ۴ و انیمیشن‌های روان با Motion.
- **بک‌اند:** سازگار با معماری اکسپرس (Express server) به همراه پکیج ساختار یافته Esbuild برای کامپایل سرور.
- **ذخیره‌سازی:** سیستم آفلاین‌فرست با همگام‌سازی آنی پایگاه‌داده محلی مرورگر (`localStorage`).

---

### 🚀 راه‌اندازی سریع محلی

برای اجرای دی‌آی‌چت روی سیستم خود در حالت توسعه:

1. **مخزن را کلون کنید:**
   ```bash
   git clone <your-repo-url>
   cd dichat
   ```

2. **پکیج‌ها را نصب کنید:**
   ```bash
   npm install
   ```

3. **سرور توسعه را اجرا کنید:**
   ```bash
   npm run dev
   ```
   مرورگر خود را باز کرده و به آدرس `http://localhost:3000` بروید.

---

### 🖥️ استقرار روی سرور واقعی و پروداکشن

برای راه‌اندازی دائمی دی‌آی‌چت روی سرورهای واقعی (VPS، ابری یا سرورهای داخل سازمان):

#### روش اول: اجرا به وسیله Node.js و ابزار PM2 (پیشنهادی)
این روش خروجی بهینه شده و سریعی تولید کرده و سرویس پیام‌رسان را به صورت ۲۴ ساعته فعال نگه می‌دارد.

1. **ساخت نسخه پروداکشن:**
   ```bash
   npm run build
   ```
   فایل‌های بهینه‌سازی شده در پوشه `/dist` ایجاد خواهند شد.

2. **تنظیم متغیرهای محیطی:**
   یک فایل با نام `.env` در مسیر اصلی پروژه بسازید:
   ```env
   PORT=3000
   NODE_ENV=production
   ```

3. **نصب مدیریت پروسه PM2 به صورت سراسری:**
   ```bash
   npm install -g pm2
   ```

4. **راه‌اندازی سرویس:**
   ```bash
   pm2 start npm --name "dichat-server" -- start
   ```

5. **پیکربندی اجرای خودکار بعد از ریبوت سرور:**
   ```bash
   pm2 startup
   pm2 save
   ```

#### روش دوم: قرار دادن پشت پروکسی معکوس Nginx (مخصوص فعال‌سازی SSL/HTTPS)
جهت تضمین امنیت و استفاده از پروتکل رمزگذاری صوتی، حتماً از سرور Nginx و گواهی SSL استفاده کنید.

1. **نصب Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

2. **پیکربندی Nginx:**
   یک فایل پیکربندی جدید در مسیر `/etc/nginx/sites-available/dichat` بسازید:
   ```nginx
   server {
       listen 80;
       server_name chat.yourcompany.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       }
   }
   ```
3. **فعال‌سازی کانفیگ و راه‌اندازی مجدد Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/dichat /etc/nginx/sites-enabled/
   sudo systemctl restart nginx
   ```

4. **نصب گواهی SSL رایگان Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d chat.yourcompany.com
   ```

---

### 👥 نحوه اضافه کردن و ورود تیم شما

دی‌آی‌چت به سیستم ورود و ثبت‌نام کاملاً توزیع‌شده مجهز است:

1. **ورود اولیه (حساب مدیر سیستم):**
   - در بدو ورود می‌توانید با استفاده از اکانت تست مدیریت پیش‌فرض (`ali.admin`) وارد سیستم شوید.
   - با کلیک روی دکمه **کنسول مدیریت** در بالای صفحه، کانال‌های مورد نظر خود را بسازید یا تنظیمات سراسری سیستم را تغییر دهید.

2. **ثبت‌نام اعضای تیم:**
   - آدرس سرور خود (مثلاً `https://chat.yourcompany.com`) را با اعضای تیم به اشتراک بگذارید.
   - از همکاران خود بخواهید وارد تب **ثبت‌نام کاربر جدید** شوند.
   - نام کاربری دلخواه، نام نمایشی و سمت سازمانی خود را وارد کنند.
   - در زمان ثبت نام، به صورت کاملاً خودکار و محلی کلیدهای رمزگذاری صوتی و متنی امن با تبادل کلید دیفی-هلمن (DH) روی مرورگر آن‌ها تولید می‌شود و کلید خصوصی هرگز از دستگاهشان خارج نخواهد شد.
   - پس از زدن دکمه ثبت نام، آن‌ها مستقیماً عضو کانال عمومی `#general` شده و آماده گفتگو خواهند بود.

3. **تنظیم سطح دسترسی همکاران:**
   - مدیر سیستم می‌تواند با ورود به **کنسول مدیریت**، نقش اعضای جدید را از کاربر معمولی به مدیر سیستم ارتقا دهد.
   - همچنین برای اتاق‌های حساس سازمانی (مانند `#security-ops` یا `#marketing-campaign`)، دسترسی هر کاربر را به صورت مجزا تنظیم کنید تا مابقی اعضای غیرمرتبط قادر به دیدن یا نوشتن در این اتاق‌ها نباشند.

---

## 🔒 Security Statement / بیانیه امنیت
*DIchat is built upon cryptographic sovereignty. All cryptographic operations (E2EE) and DH keypairs reside entirely within the user client. No unencrypted private text, voice data, or private keys are ever read or transmitted by the application server.*

*دی‌آی‌چت بر پایه حاکمیت رمزنگاری شخصی بنا شده است. تمامی فرآیندهای امنیتی و کلیدهای دیفی-هلمن کاملاً درون کلاینت کاربر نگهداری می‌شوند. هیچ دیتای صوتی خام، کلید خصوصی یا پیام رمزگذاری‌نشده‌ای هرگز توسط سرور خوانده یا ذخیره نخواهد شد.*
