import { useState } from 'react';

export default function AppealForm({ user }) {
  const [appealText, setAppealText] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!appealText.trim()) {
      setStatus('Please enter your appeal text.');
      return;
    }

    try {
      const res = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: user.username,
          appealText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.error || 'There was a problem submitting your appeal.');
        return;
      }

      setStatus('Appeal submitted successfully!');
      setAppealText('');
    } catch (error) {
      console.error('Submit error:', error);
      setStatus('There was a problem submitting your appeal.');
    }
  };

  if (!user) return <p>Please log in to submit an appeal.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={appealText}
        onChange={(e) => setAppealText(e.target.value)}
        placeholder="Write your appeal here..."
        rows={6}
        required
      />
      <button type="submit">Submit Appeal</button>
      {status && <p>{status}</p>}
    </form>
  );
}
