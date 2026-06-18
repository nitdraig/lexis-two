'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <label>
        Name
        <input {...register('name')} />
        {errors.name ? <span>{errors.name.message}</span> : null}
      </label>
      <label>
        Email
        <input {...register('email')} />
        {errors.email ? <span>{errors.email.message}</span> : null}
      </label>
      <button type="submit" disabled={isSubmitting}>
        Send
      </button>
    </form>
  );
}
