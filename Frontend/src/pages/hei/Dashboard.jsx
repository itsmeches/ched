import { useAuth } from '../../context/AuthContext'

export default function HEIDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'My Proposals', value: '5', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-blue-500' },
    { label: 'Under Review', value: '2', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-yellow-500' },
    { label: 'Approved', value: '2', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-500' },
    { label: 'Ongoing', value: '1', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-purple-500' },
  ]

  const proposals = [
    { title: 'Climate Change Impact on Agriculture', category: 'Environmental', date: 'Apr 15, 2026', status: 'approved' },
    { title: 'Digital Transformation in Education', category: 'Education', date: 'Apr 10, 2026', status: 'pending' },
    { title: 'AI in Healthcare Diagnostics', category: 'Technology', date: 'Apr 5, 2026', status: 'approved' },
  ]

  const getStatusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }
    const labels = { pending: 'Under Review', approved: 'Approved', rejected: 'Rejected' }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1a365d]">HEI Dashboard</h2>
        <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">My Research Proposals</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Submitted</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{proposal.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{proposal.category}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{proposal.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(proposal.status)}</td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1.5 bg-[#2c5282] text-white rounded-md text-sm hover:bg-[#1a365d] transition-colors">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-[#2c5282] text-white rounded-lg text-sm font-medium hover:bg-[#1a365d] transition-colors">Submit New Proposal</button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">View Guidelines</button>
            <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Contact CHED</button>
            </div>
        </div>
        </div>
    )
}