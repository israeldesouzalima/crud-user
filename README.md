# crud-user

Simple CRUD application for users with:

- API fields: `first_name`, `last_name`, `phone`, `email`, `password`
- In-memory persistence
- Basic web interface (HTML, CSS and JavaScript)

## Run

```bash
npm install
npm start
```

Open `http://localhost:3000`.

## API

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PUT /api/users/:id`
- `DELETE /api/users/:id`