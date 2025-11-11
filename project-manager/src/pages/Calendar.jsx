import Layout from '../components/Layout';
import { FaCalendar } from 'react-icons/fa';

export default function Calendar() {
  return (
    <Layout>
      <div className="p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Calendar</h1>
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <FaCalendar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Calendar View Coming Soon
          </h2>
          <p className="text-gray-600">
            View your tasks and project deadlines in a calendar format
          </p>
        </div>
      </div>
    </Layout>
  );
}
