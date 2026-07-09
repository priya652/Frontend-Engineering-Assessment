import { useNavigate } from 'react-router-dom';
import StateMessage from '../components/ui/StateMessage.jsx';

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <StateMessage
      tone="empty"
      title="Page not found"
      description="That URL does not match anything in this catalogue."
      action={{ label: 'Back to products', onClick: () => navigate('/') }}
    />
  );
}

export default NotFoundPage;
