# TechSphere Portfolio Blog

TechSphere is now structured as a personal portfolio-blog with admin-only content management.

## Stack

- Node.js
- Express.js
- EJS
- MongoDB + Mongoose
- Express Session + connect-mongo
- bcrypt
- Tailwind CSS styling

## Main Routes

### Public

- `/` - Homepage
- `/about` - About page
- `/projects` - Project listing
- `/projects/:slug` - Project case study
- `/blog` - Blog listing
- `/blog/:slug` - Blog article
- `/contact` - Contact form
- `/terms` - Terms page

### Admin

- `/admin/login` - Admin login
- `/admin/dashboard` - Admin dashboard
- `/admin/posts` - Manage posts
- `/admin/posts/new` - Create post
- `/admin/projects` - Manage projects
- `/admin/projects/new` - Create project
- `/admin/messages` - Contact messages

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your `.env` file using `.env.example` as a guide:

```bash
cp .env.example .env
```

3. Start the app:

```bash
npm start
```

For development:

```bash
npm run dev
```

## Create an Admin Account

Set these values in `.env`:

```env
ADMIN_FIRSTNAME=Faramade
ADMIN_SURNAME=Ayeni
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=change_this_password
```

Then run:

```bash
npm run create-admin
```

If you already have a user in the database from the old version, that user can still log in through `/admin/login`.

## Tailwind CSS

The current Stage 1 build uses Tailwind CDN in the EJS head partials so the UI works immediately during local development.

The project also includes:

- `tailwind.config.js`
- `public/css/input.css`
- `npm run build:css`
- `npm run watch:css`

Later, we can switch from CDN to a compiled local `public/css/output.css` for production.

## Notes

- Public registration has been removed/redirected.
- Content management is admin-only.
- Contact form messages are stored in MongoDB.
- Project and blog images currently support URL/placeholders first. File upload can be added later.
