// lexis: HTML5 validation first — two fields do not need Zod + react-hook-form
export function ContactForm() {
  return (
    <form action="/api/contact" method="post">
      <label>
        Name
        <input name="name" required minLength={1} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <button type="submit">Send</button>
    </form>
  );
}
