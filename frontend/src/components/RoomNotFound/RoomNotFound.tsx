import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../Layout/Layout';
import { Button } from '../ui/button';

const RoomNotFound = () => {
  return (
    <Layout title="Room Not Found">
      <div>
        <div
          className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50"
          role="alert"
        >
          <AlertCircle className="flex-shrink-0 inline w-4 h-4 mr-3" />
          <span className="sr-only">Error:</span>
          <div>
            <span className="font-medium">Room not found.</span> Please check
            the room code and try again.
          </div>
        </div>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Button className="w-full text-lg py-6">Go to Home</Button>
        </Link>
      </div>
    </Layout>
  );
};

export default RoomNotFound;
