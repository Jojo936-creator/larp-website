import { getCredentials } from '../../lib/credentials';

export default function handler(req, res) {
  try {
    const credentials = getCredentials();
    res.status(200).json(credentials);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load credentials', details: error.message });
  }
}
