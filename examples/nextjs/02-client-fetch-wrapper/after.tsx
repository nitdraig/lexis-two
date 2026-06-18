type User = {
  id: string;
  name: string;
};

async function getUsers(): Promise<User[]> {
  const response = await fetch('https://api.example.com/users', {
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Failed to load users');
  }
  return response.json() as Promise<User[]>;
}

// lexis: Server Component fetch — read-only lists do not need client state or useEffect
export default async function UsersPage() {
  const users = await getUsers();

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
